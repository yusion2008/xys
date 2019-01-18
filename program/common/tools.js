const http = require('http');
const url = require('url');
const iconv = require('iconv-lite');
const hbs = require('handlebars');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const redis = require('redis');
const config = require('./config.js').config;


let redisClient=null;
let templateMap = {};

// 根据日期检查日志存放目录,不存在则创建,然后返回目录
const toPad2 = num => num > 10 ? num : '0' + num;

const getLogPath = dirname => {
    const date = new Date();
    let dir = dirname || "logs"
    const logPath = path.join(
        __dirname.toString().replace("common", dir),
        `${date.Format('yyyy-MM')}`
    )
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath)
    }
    return logPath
}

// 写入文件,返回一个`promise`
const write = (filePath, data) =>
    new Promise((resolve, reject) => {
        fs.appendFile(filePath, data, 'utf8', err => {
            if (err) {
                reject(err)
            } else {
                resolve(true)
            }
        })
    })

// 事件触发
const writeLog = (logData, filename) => {
    let fileName = filename || "logs";
    const logPath = getLogPath(fileName);
    const date = new Date();
    write(path.join(logPath, `${date.Format('MM-dd')}${config.appName}-${fileName}.txt`), logData).then(() => {
        //console.log("日志写入成功！");
    })
}


const common = {
    /**
     * [extend 继承对象，并且去重]
     * @param  {[type]} destination [主对象]
     * @param  {[type]} source      [次对象]
     * @return {[type]}             [返回合并后的对象]
     */
    extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    },
    /**
     * [curObj 截取对象前num个，再返回对象]
     * @param  {[type]} obj [操作的对象]
     * @param  {[type]} num [要截取的个数]
     * @return {[type]}     [返回值]
     */
    curObj(obj, num) {
        let i = 0;
        let tmp = {};
        for (var property in obj) {
            tmp[property] = obj[property];
            i++;
            if (i >= num) {
                break;
            }
        }
        return tmp;
    },
    /**
     * [log 写入日志的方法]
     * @param  {[type]} msg [需要写入的内容字符串]
     */
    log: function(msg) {
        const date = new Date();
        const time = `[${date.Format("yyyy-MM-dd hh:mm:ss")}] `;
        writeLog(time + msg + '\n\n');
    },
    /**
     * [trace 写入跟踪的方法]
     * @param  {[type]} msg [需要写入的内容字符串]
     */
    trace: function(msg) {
        if (!config.trace) { return }
        const date = new Date();
        const time = `${date.Format("yyyy-MM-dd hh:mm:ss")} `;
        writeLog(time + msg + '\n\n', "trace");
    },
    formatTime(millis, pattern) {
        var date = new Date(millis);
        return date.Format(pattern);
    },
    getClientIp: function(req) {
        let ip = [];
        if (req.headers['x-real-ip'] || req.headers['X-Real-IP']) {
            ip.push(req.headers['x-real-ip'] || req.headers['X-Real-IP'])
        }
        if (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']) {
            //console.log(req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
            let forward = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'];
            let forwarded = forward.split(",");
            for (let i = 0; i < forwarded.length; i++) {
                if (!ip.includes(forwarded[i])) {
                    ip.push(forwarded[i])
                }
            }

        }
        req.connection && req.connection.remoteAddress && !ip.includes(req.connection.remoteAddress) && ip.push(req.connection.remoteAddress)
        req.socket && req.socket.remoteAddress && !ip.includes(req.socket.remoteAddress) && ip.push(req.socket.remoteAddress)
        req.connection && req.connection.socket && req.connection.socket.remoteAddress && !ip.includes(req.connection.socket.remoteAddress) && ip.push(req.connection.socket.remoteAddress);
        return ip.join("/");
    },
    getTemplate: function(name) {
        const that = this;
        let templateCacheTime = 900000;
        if (config.DEBUG)
            templateCacheTime = 6000;
        let holder = templateMap[name];
        if (!holder) {
            holder = ['', 0];
            templateMap[name] = holder;
        }
        let now = new Date().getTime();
        if (now - holder[1] < templateCacheTime) {
            if (config.DEBUG)
                that.log('cache hit for template: ', name);
            return holder[0];
        } else {
            if (config.DEBUG)
                that.log('cache missed for template: ', name);
        }

        try {
            holder[0] = hbs.compile(fs.readFileSync(name).toString());
        } catch (e) {
            let msg = 'missed for template:' + name;
            that.log(msg);
            if (config.DEBUG)
                that.log(e);
            return null;
        }
        holder[1] = now;
        return holder[0];
    },
    clearTemplate: function() {
        templateMap = {};
    },
    switchHandler: function(msg, statusCode, newUrl, callback, rh) {
        if (msg) {
            console.error(msg);
        }
        rh.setStatusCode(statusCode);
        rh.setHeader('Content-Type', 'text/html; charset=UTF-8');
        rh.setHeader("Cache-Control", "no-cache,no-store,must-revalidate"); // HTTP 1.1
        rh.setHeader("Location", newUrl);
        callback(null, rh);
        return;
    },
    errHandler: function(msg, callback, rh) {
        msg = msg || "请求失败，请重试！"
        rh.setStatusCode(200);
        rh.setHeader('Content-Type', 'text/html; charset=UTF-8');
        rh.setHeader("Cache-Control", "no-cache,no-store,must-revalidate"); // HTTP 1.1
        rh.setBody(msg);
        callback(null, rh);
        return;
    },
    /**
     * [getPostData 整合页面发送过来的数据]
     * @param  {[type]} req         [description]
     * @param  {[type]} queryString [description]
     * @return {[type]}             [description]
     */
    getPostData: function(req, queryString) {
        let that = this;
        const uri = req.url.toString().split(".xsp")[0].replace("/s/", "/");
        let postDataJson = {
            "data": {},
            "authInfo": {
                "token": "",
                "ip": that.getClientIp(req),
                "userAgent": req.headers['user-agent'] || "",
                "cookie": req.headers.cookie || "",
                "referer": req.headers.referer || "",
                uri
            }
        }
        let data = req.body ? iconv.decode(req.body, 'UTF-8') : null;
        let a = qs.parse(data);
        let b = queryString ? qs.parse(queryString) : {};
        let stringObj = that.extend(a, b); //合并去重post和get的数据
        if (Object.keys(stringObj).length > config.postDataMaxNum) { //判断参数个数，超过配置值时截断
            stringObj = that.curObj(stringObj, config.postDataMaxNum);
        }
        postDataJson.data = stringObj;

        let token = that.getCookie(req, 'token');
        if (token) {
            postDataJson.authInfo.token = token;
        }
        that.trace(`${req.url},${JSON.stringify(postDataJson)}`);
        return postDataJson;
    },
    getCookie: function(req, name) {
        let Cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function(Cookie) {
            let parts = Cookie.split('=');
            Cookies[parts[0].trim()] = (parts[1] || '').trim();
        });
        return Cookies[name];
    },
    /**
     * [httpRequest description]
     * @param  {[type]}   reqUrl   [description]
     * @param  {Function} callback [description]
     * @param  {[type]}   opt 
     * opt 
     * {
     *    method:['GET','POST']
     *    data:
     *    headers:
     *    chatset: ['gbk','utf8(default)']
     *    datatype: ['raw', 'json'. 'string(default)']
     * }
     * @return {[type]}            [description]
     */

    httpRequest: function(reqUrl, callback, opt) {
        let that = this;
        let urlInfo = url.parse(reqUrl);
        let isSecureUrl = urlInfo.protocol ? /^https:?$/i.test(urlInfo.protocol) : false;
        let options = {
            hostname: urlInfo.hostname || urlInfo.host,
            port: urlInfo.port || (isSecureUrl ? 443 : 80),
            path: urlInfo.path,
            method: opt.method || 'GET'
        };

        let datatype = opt.datatype ? opt.datatype.toLowerCase() : 'string';

        if (opt.data) {
            options.headers = opt.headers || {
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': Buffer.byteLength(JSON.stringify(opt.data))
            }
        }

        let req = http.request(options, function(res) {
            let chunks = [];
            res.on('data', function(chunk) {
                chunks.push(chunk);
            }).on('end', function() {
                let data = '';
                if (datatype == 'raw') {
                    data = chunks;
                    that.trace(`${reqUrl},return:${data}`);
                } else {
                    let rawdata = iconv.decode(Buffer.concat(chunks), opt.charset || that.getCharset(res.headers, 'utf8'));
                    try {
                        if (datatype == 'json') {
                            data = JSON.parse(rawdata);
                            that.trace(`${reqUrl},return:${rawdata}`);
                        }
                    } catch (e) {
                        let msg = '解密 ' + reqUrl + '时失败:，res.statusCode:' + res.statusCode + ' 请求参数:' + JSON.stringify(opt) + "\n返回字符串:" + rawdata.substring(0, 150);
                        that.trace(`${reqUrl} failed,statusCode:${res.statusCode},param:${JSON.stringify(opt)},return${rawdata.substring(0, 250)}`);
                        that.log(msg);
                        //callback('iconv ' + reqUrl + ' failed：' + e);
                    }
                }
                res.data = data;
                callback(null, res);
            }).on('error', function(err) {
                // throw 'https request res chunk is error' + err;
                that.trace(`${reqUrl},failed:${err}`);
                let msg = '请求 ' + reqUrl + ' 失败，原因是：' + err;
                //callback(msg);
                that.log(msg);
            });
        });
        req.on('error', function(e) {
            that.trace(`${reqUrl},failed:${e}`);
            // throw 'https request is error' + e;
            let msg = '请求 ' + reqUrl + ' 失败，原因是：' + e;
            //callback(msg);
            that.log(msg);
        });
        if (opt.data) req.write(JSON.stringify(opt.data));
        req.end();
    },

    getCharset: function(headers, defaultCharset) {
        let contentType = headers['Content-Type'];
        if (!contentType) {
            return defaultCharset;
        }

        contentType = contentType.toLowerCase();
        if (contentType.indexOf("charset=") > -1) {
            return contentType.split('charset=')[1];
        }
        return defaultCharset;

    },

    get: function(url, callback, opt) {
        let that = this;
        let options = opt || {};
        options.method = "GET";
        that.httpRequest(url, callback, options);
    },

    post: function(url, callback, opt) {
        let that = this;
        let options = opt || {};
        options.method = "POST";
        that.httpRequest(url, callback, options);
    },

    coRequest: function(url, opt) {
        let that = this;
        return function(callback) {
            that.httpRequest(url, callback, opt);
        }
    },

    coPost: function(url, opt) {
        let that = this;
        let options = opt || {};
        options.method = "POST";
        return that.coRequest(url, options);
    },

    coGet: function(url, opt) {
        let that = this;
        let options = opt || {};
        options.method = "GET";
        return that.coRequest(url, options);
    },
    /**
     * [coCheckRight 鉴权方法]
     * @param  {[type]}   req      [description]
     * @param  {[type]}   rh       [description]
     * @param  {Function} callback [description]
     * @param  {[type]}   b        [description]
     * @return {[type]}            [description]
     */
    coCheckRight: function(req, rh, callback) {
        const that = this;
        const loginUrl = config.LOGIN_PATH + "?return=" + req.url;

        const opt = that.getPostData(req);
        const url = config.getDomain('auth') + config.getAPI("auth");
        const options = {};
        options.method = "POST";
        options.datatype = "json";
        options.data = opt;

        return function(cb) {
            that.httpRequest(url, function(err, data) {
                if (err) {
                    that.errHandler(err, callback, rh)
                } else {
                    if (data.data.code == 0) {
                        cb(null, data.data.data);
                    } else {
                        if (data.data.code == 13 || data.data.code == 20 || data.data.code == 21 || data.data.code == 22) {
                            that.switchHandler(null, 302, loginUrl, callback, rh);
                        } else {
                            that.errHandler(data.data.msg, callback, rh);
                        }

                    }
                }
            }, options);
        }

    },
    redisGet: function(key, fn) {       
         if(!redisClient){redisClient=redis.createClient(config.getDomain('redisPort'), config.getDomain('redis')}; //建立客户端}
        redisClient.get(key, fn);
    },
    redisCoGet: function(key) {
        let that = this;
        return function(callback) {
            that.redisGet(key, callback);
        };
    },
    pageMaker(req, queryString, pageNo, total, pageCount) {
        if (total == 0) { return `<p class="noneContent">暂无相关数据！</p>`; }
        const uri = req.url.toString().split("?")[0];
        let q = qs.parse(queryString);

        let prevLink = "",
            nextLink = "",
            prevQ = "",
            nextQ = "";
        if (pageNo == 1) {
            prevLink = 'javascript:void(0);';
            q.pageNo = pageNo * 1 + 1;
            nextQ = qs.stringify(q);
            nextLink = uri + '?' + nextQ;
        } else if (pageNo == pageCount) {
            nextLink = 'javascript:void(0);';
            q.pageNo = pageNo - 1;
            prevQ = qs.stringify(q);
            prevLink = uri + '?' + prevQ;
        } else {
            q.pageNo = pageNo - 1;
            prevQ = qs.stringify(q);
            prevLink = uri + '?' + prevQ;
            q.pageNo = pageNo * 1 + 1;
            nextQ = qs.stringify(q);
            nextLink = uri + '?' + nextQ;
        }

        let html = `
        <div class="pager">
            <div class="pager-info"> 共有<i class="blue" id="recordTotal">${total}</i>条记录 </div>
            <div class="pager-jump">
                <input type="text" id="pageNoValue">
                <a href="javascript:void(0);" class="btn btn-success btn-auto" onclick="queryMsg()">跳转</a>
            </div>
            <div class="pager-sub" id="pager">
                <a href="${prevLink}" class="prev"><em class="arr-wrap"><i class="icon-arrA icon-arrA-l s1"></i><i class="icon-arrA icon-arrA-l s2"></i></em></a><span class="num"><em class="blue">${pageNo}</em>/${pageCount}</span><a href="${nextLink}" class="next"><em class="arr-wrap"><i class="icon-arrA icon-arrA-r s1"></i><i class="icon-arrA icon-arrA-r s2"></i></em></a>
            </div>
        </div>`;
        return html;
    }


}

exports.common = common;