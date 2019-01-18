// Copyright PCGroup 2019
// 
// XSP - 简化版xsp,去除了XSP中的XP，只保留S。所以路由规则有变，去了一层/s/
//
// 去除了R系统相关的路由代理            
// 
// 使用nodejs的系统模块cluster，做了集群。
// 
// author xieyongshuang@pconline.com.cn 20190116
//


const fs = require('fs');
const http = require('http');
const path = require('path');
const iconv = require('iconv-lite');
const hbs = require('handlebars');
const domain = require('domain');
const Emitter = require('events').EventEmitter;
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const ResponseHolder = require('./util.js').ResponseHolder;
const config = require('../conf/config.js').config();
const log = require('./log.js').log;
const trace = require('./log.js').trace;

Date.prototype.Format = function(fmt) {
    //日期公共格式化方法，勿删
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };

    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }

    return fmt;
}

// load helper
if (config.xsp.helpers) {
    config.xsp.helpers.forEach(function(e) {
        require('../' + e);
    });
}

// for unique the same url in same time
let unique = {};
let uniqNo = 0;

function uniqReq(req) {
    // Only for cacheable get url !!!
    //if (req.method === 'GET') {
    //    req.uniq = req.url;
    //    return;
    //}
    if (++uniqNo > 0xFFFFFFFF) {
        uniqNo = 0;
    }
    req.uniq = uniqNo;
}

let processTimeOutErr = new Error('process over 5 minute!');
//check long time request
setInterval(function() {
    let now = new Date().getTime();
    for (key in unique) {
        if (unique[key].domain && unique[key].domain.members[0] && ((now - unique[key].domain.members[0]._startTime) > 5 * 60 * 1000)) {
            let url = unique[key].domain.members[0].url;
            log(' request time out,remove key =' + key + "--" + url);
            unique[key].emit('ok', processTimeOutErr);
            delete unique[key];
        }
    }
}, 60 * 1000);

// for security script path
let scriptPath = fs.realpathSync('.') + path.sep + 'scripts';

// parse uri to object with attributes: script and queryString
// script is the filename replace ext name .xsp to .js, and then add the dir
//          ./scripts/ before the filename
// queryString is query string with uri
//
function parseScript(uri) {

    let pos = uri.split('.xsp');
    let script = 'scripts/' + pos[0] + '.js';

    let realScript = fs.realpathSync(script);
    let hasScript = fs.statSync(realScript);
    if (realScript.indexOf(scriptPath) !== 0) {
        //throw 'Not allow access other path!';
        log(uri + ' Not allow access other path!');
    }
    let queryString = pos[1] ? pos[1].substring(1) : '';
    return { script: realScript, queryString: queryString };
}


// Write response for plain text messate
//
function writeResponse(res, sc, msg) {
    res.setHeader('Content-Type', 'text/html chatset=utf-8');
    let body = msg;
    if (!Buffer.isBuffer(body)) {
        body = iconv.encode(msg, 'utf-8');
    }
    res.setHeader('Content-Length', body.length);
    res.statusCode = sc;
    res.end(msg);

}


// Process User Define Script request
// user define script in ./scripts
//

function doScript(req, res) {
    try {
        let option = {};

        let scriptInfo = parseScript(req.url);
        let script = require(scriptInfo.script);

        let onOk = function(err, responseHolder) {
            if (err) {
                log(res.url + err.message)
                writeResponse(res, 500, err.message);
                return;
            }
            try {
                responseHolder.writeTo(res);
            } catch (err2) {
                log(res.url + err2.message)
                writeResponse(res, 500, err2.message);
                return;
            }
        };

        let emitter = unique[req.uniq];
        if (!emitter) {
            emitter = new Emitter();
            emitter.setMaxListeners(0);
            unique[req.uniq] = emitter;

            emitter.once('ok', onOk); // must set before handle for sync call
            script.handle(req, new ResponseHolder(), scriptInfo.queryString,
                function(err, rh) {
                    emitter.emit('ok', err, rh);
                    delete unique[req.uniq];
                });
        } else {
            emitter.once('ok', onOk);
        }


    } catch (err) {

        if (err.message &&
            err.message.indexOf('Cannot find module') === 0) {
            trace(res.url + ' File not found!');
            writeResponse(res, 404, 'File not found!');
        } else {
            log('no such file or directory error, url is: %s ====== tagetUrl is: ' + req.url);
            writeResponse(res, 500, err.message);
        }
    }
}


// Start the server with domain to handle exception when request
//
let port = process.env.port || config.xsp.port || 9527;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        if (worker.isDead) {
            //restart the process after 1 second           
            setTimeout(() => {
                cluster.fork();
            }, 1000)
        }

    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {
        if (req.url.indexOf('.xsp') == -1) {
            if (req.url == '/favicon.ico') {
                return
            } else {
                log(req.url + ' 404File not found!');
                trace(req.url + ' 404File not found!');
                writeResponse(res, 404, '404<br>File not found!');
                return
            }
        }
        let d = domain.create();
        uniqReq(req);
        d.add(req);
        d.add(res);
        d.on('error', function(er) {
            //console.trace('Error', req.url, er);
            log('Error', req.url, er);
            trace(req.url, er);
            let emitter = unique[req.uniq];
            if (emitter) {
                emitter.emit('ok', er);
                delete unique[req.uniq];
            }
        });

        d.run(function() {
            if (req.method === 'POST') {
                let chunks = [];
                let length = 0;
                req.on('data', function(chunk) {
                    length += chunk.length;
                    chunks.push(chunk);
                }).on('end', function() {
                    let data = new Buffer(length);
                    let pos = 0;
                    let l = chunks.length;
                    for (let i = 0; i < l; i++) {
                        chunks[i].copy(data, pos);
                        pos += chunks[i].length;
                    }
                    req.body = data;
                    doScript(req, res);

                });
            } else {
                doScript(req, res);
            }

        });
    }).listen(port);

    console.log(`Worker ${process.pid} started`);
}