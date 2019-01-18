
var http   = require('http');
var https  = require('https');
var url    = require('url');
var iconv  = require('iconv-lite');
var httpsProxy = require('https-proxy-agent');
var config = require('../conf/config.js').config();

/**
 * Created by pc on 2015/3/24.
 */
//判断是否是整数
function checkNumber(str,flg){//flg用于判断是否是正整数
    var patternT = /^[1-9]\d{0,5}$/g;
    if(flg) patternT = /^[0-9]\d{0,5}$/g;
    var result = new RegExp(patternT);
    return result.test(str);
}

//过滤字段，需要的字段取出来
function filterFields(data,fields){
        var obj={};
        fields.forEach(function(e1){
             obj[e1]= data[e1];
        });
    return obj;
}

//用于返回错误信息
function replyError(rh,callback,status,msg){
    var reStr={};
    reStr.msg = msg||'服务器加载数据错误';
    reStr.status=-1;
    rh.statusCode = status||500;

    rh.setHeader('Content-Type', 'application/json; charset=UTF-8');
    rh.setHeader('Cache-Control', 'no-cache');
    rh.setBody(JSON.stringify(reStr));
    callback(null, rh);
}

/**
 * 预加载时把content的内容里面的img进行src2处理
 * @param content 包括html标签的内容
 */
function loadImgSrc2(content){
    content=content.replace(/<img[^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {//匹配得到<img xxx/>整个对象
        match=match.replace("src","src2");
        match= match.replace("/>"," src=http://www1.pconline.com.cn/wap/2013/cms/img/best_loading.png />");
        return match;
    });
    return content;
}

/**
 * 比较版本大小
 * 
 * @ver 版本号参数1，形式为 x.x.x
 * @verCmp 版本号参数2，形式为 x.x.x
 * @return ver > verCmp时，返回1；ver = verCmp时，返回0；ver < verCmp时，返回-1
 */
function verCompare(ver, verCmp) {
	var vArray = ver.split('.');
	var vcArray = verCmp.split('.');
	var ret = -1;
	
	try {
		if (isNaN(parseInt(vArray[0])) || isNaN(parseInt(vArray[1])) || isNaN(parseInt(vArray[2]))) {
			return ret;
		}
		
		if (parseInt(vArray[0]) > parseInt(vcArray[0])) {
			ret = 1;
		} else if (parseInt(vArray[0]) < parseInt(vcArray[0])) {
			ret = -1;
		} else {
			if (parseInt(vArray[1]) > parseInt(vcArray[1])) {
				ret = 1;
			} else if (parseInt(vArray[1]) < parseInt(vcArray[1])) {
				ret = -1;
			} else {
				if (parseInt(vArray[2]) > parseInt(vcArray[2])) {
					ret = 1;
				} else if (parseInt(vArray[2]) < parseInt(vcArray[2])) {
					ret = -1;
				} else {
					ret = 0;
				}
			}
		}
	} catch (e) {
	}
	
	return ret;
}

function formatTime(millis, pattern) {
	var date = new Date(millis);
	return date.Format(pattern);
}

function getIp(req) {
    var forwarded = req.headers['x-forwarded-for'];
    var ip = null;

    if (forwarded) {
        ip = forwarded.split(', ')[0];
    }

    return ip;
}

function face(userId, suffix) {
	var face = 'http://i6.3conline.com/images/upload/upc/face/';
	userId = userId.toString();
	
	for (var i = 0, c = userId.length; i < c; i += 2) {
		face += userId.charAt(i);
		if (i < c - 1) {
			face += userId.charAt(i + 1);
		}
		face += '/';
	}

	return face += userId + '_' + suffix;
}

function convert(html,firstImgInSummary,suffixs) {
    var temp = html.split('<img')

    var list = temp.map(function(item,index){return index==0?item:'<img'+item})
    list = mergeDirectShow(list,suffixs)

    var content ={}
    var rest = []
    if(firstImgInSummary){
        content.summary = list.slice(0,2).join('')
        rest = list.slice(2)
    }else{
        content.summary = list[0]
        rest = list.slice(1)
    }

    var list2 = []
    rest.forEach(function(item,index){

        var pos = item.indexOf('>')
        var imgStr = item.substring(0,pos+1)
        var width = 0;
        var height = 0;
        var imgUrl = '';
        var bigImgUrl = '';

        if (imgStr.indexOf('width=') > -1) {
            width = imgStr.replace(/.*width=\"(.+?)\".*/, '$1');
        }
		
		if (width == 0) {
			width = 300;
		}

        if (imgStr.indexOf('height=') > -1) {
            height = imgStr.replace(/.*height=\"(.+?)\".*/, '$1');
        }
		
		if (height == 0) {
			height = 200;
		}
		
        if (imgStr.indexOf('src2') > -1) {
            imgUrl = imgStr.replace(/.*src2=\"(.+?)\".*/, '$1');
        } else {
            imgUrl = imgStr.replace(/.*src=\"(.+?)\".*/, '$1');
        }

        if (imgUrl.indexOf('_240x160.') > -1 && imgUrl.indexOf('.gif') == -1) {
            if (imgUrl.indexOf('bbs6') > -1) {
                var position = imgUrl.indexOf('bbs6');
                var year = imgUrl.substring(position+5,position+7);
                if (year >= 18) {
                    bigImgUrl = imgUrl.replace('_240x160.', '_699x699.');
                } else {
                    bigImgUrl = imgUrl.replace('_240x160.', '_500x500.');
                }
            } else if (imgUrl.indexOf('usercenter') > -1) {
                var position = imgUrl.indexOf('usercenter');
                var year = imgUrl.substring(position+11,position+13);
                if (year >= 18) {
                    bigImgUrl = imgUrl.replace('_240x160.', '_699x699.');
                } else {
                    bigImgUrl = imgUrl.replace('_240x160.', '_500x500.');
                }
            }
        } else if (imgUrl.indexOf('_120x90.') > -1 && imgUrl.indexOf('.gif') == -1) {
            bigImgUrl = imgUrl.replace('_120x90.', '_500x500.');
        } else {
			bigImgUrl = imgUrl;
		}

        list2.push({seq:index+1,text:imgStr,width:width,height:height,imgUrl:imgUrl,bigImgUrl:bigImgUrl})
        if(pos<item.length-1){
            list2.push({seq:0,text:trimHtml(item.substring(pos+1))})
        }
    })

    content.blockList = list2
    content.imgCount = rest.length
    content.videoIdList = []
    return content

    function mergeDirectShow(list, suffixs) {
        var result = []
        var index = 0
        list.forEach(function (item) {
            if(isDirectShow(item,suffixs)&&index>0){
                var s = result[index-1] || ''
                result[index-1] = s + item
            }else{
                result.push(item)
                index = index + 1
            }
        })
        return result
    }

    function isDirectShow(img,suffixs) {
        var ret = false
        suffixs.forEach(function(item){
            if(img.indexOf(item)>=0){
                ret = true
            }
        })
        return ret
    }

    function trimHtml(text) {
        var result = text
        var lbr = /^(<br\/>|<br>)+(.*)/
        var rbr = /(.*?)(<br\/>|<br>)+$/
        var lrspace = /^(&nbsp;)*(.*?)(&nbsp;)*$/
        var mspace = /(&nbsp;)+/g
        var lr = /^(\n)*(.*?)(\n)*$/

        if(lbr.test(result)){
            result = '<br/>' + result.replace(lbr,'$2')
        }
        if(rbr.test(result)){
            result = result.replace(rbr,'$1') + '<br/>'
        }
        result = result.replace(lrspace,'$2')
        result = result.replace(mspace,'&nbsp;')
        result = result.replace(lr,'$2')

        return result
    }
}

function coGet(url, handler) {
    var agent = {};
    // var handler = opts ? opts.handler : undefined;
    agent.hostname = config.proxy.hostname;
    agent.port = config.proxy.port;
    return get(agent, url, handler);
}

/**
*用于代理请求第三方接口
*@agent 代理对象
*@url 第三方接口地址
*/
function get(agent, url, handler) {
	
	var options = {
		port: agent.port,
		hostname: agent.hostname,
		path: url
	};
	
	return function (callback) {
		var req            = null;
		var requestTimeout = null;

		requestTimeout = setTimeout(function () {
			requestTimeout = null;
			req.abort();
			callback(new Error('Request timeout for url: ' + url));
		}, 3 * 1000);

		req = http.get(options, function (res) {
			if (requestTimeout) {
				clearTimeout(requestTimeout);
				requestTimeout = null;
			}

			var chunks = [];
			res.on('data', function (chunk) {
				chunks.push(chunk);
			}).on('end', function () {
				res.url  = options.path;
				res.body = Buffer.concat(chunks);
				var data = null;
				if (handler) {
                    data = handler(null, res).data;
                } else {
                    data = res.body;
                }
				callback(null, data);
			}).on('error', function (err) {
				callback(err, res);
			});
		});
	};
}

/**
 *代理https请求Get
 *@urlpath 接口地址
 */
function httpsGet(reqUrl, callback) {
    httpsRequest('GET', reqUrl, callback, null);
}

/**
 *代理https请求POST
 *@urlpath 第三方接口地址
 */
function httpsPost(reqUrl, callback, postData) {
    httpsRequest('POST', reqUrl, callback, postData);
}

/**
 *用于代理请求第三方https接口
 *@reqUrl 第三方接口地址
 */
function httpsRequest(method, reqUrl, callback, postData) {
    var urlInfo = url.parse(reqUrl);
    var isSecureUrl = urlInfo.protocol ? /^https:?$/i.test(urlInfo.protocol) : false;
    var agent = {};
    if (config.proxy) { // config.js里边配置的 proxy
        agent.hostname = config.proxy.hostname,
        agent.port = config.proxy.port
    }
    var proxy = agent && agent.hostname && agent.port ? new httpsProxy('http://'+agent.hostname+":"+agent.port) : null;
    var options = {
        hostname: urlInfo.hostname || urlInfo.host,
        port: urlInfo.port || (isSecureUrl ? 443 : 80),
        agent : proxy,
        path: urlInfo.path,
        method : method || 'GET'
    };

    if (postData) {
        options.headers = { //微信的必须要传请求头
            'Content-Type': 'application/json;charset=UTF-8',
            'Content-Length': Buffer.byteLength(postData)
        }
    }

    var req = https.request(options, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        }).on('end', function () {
            callback(null, chunks);
        }).on('error', function (err) {
            // throw 'https request res chunk is error' + err;
            callback(err);
        });
    });
    req.on('error', function (e) {
        // throw 'https request is error' + e;
        callback(e);
    });
    if(postData) req.write(postData);
    req.end();
}

/**
 *用于代理请求第三方https接口，更灵活的请求
 *@reqUrl 第三方接口地址
 */
function httpsRequestNew(method, reqUrl, callback, data) {
    var urlInfo = url.parse(reqUrl);
    var isSecureUrl = urlInfo.protocol ? /^https:?$/i.test(urlInfo.protocol) : false;
    var agent = {};
    if (config.proxy) { // config.js里边配置的 proxy
        agent.hostname = config.proxy.hostname,
            agent.port = config.proxy.port
    }
    var proxy = agent && agent.hostname && agent.port ? new httpsProxy('http://'+agent.hostname+":"+agent.port) : null;
    var options = {
        hostname: urlInfo.hostname || urlInfo.host,
        port: urlInfo.port || (isSecureUrl ? 443 : 80),
        agent : proxy,
        path: urlInfo.path,
        method : method || 'GET'
    };
    var postData = '';
    if (data) {
        options.headers = data.headers;
        postData = data.content;
    }

    var req = https.request(options, function (res) {
        var result = {
            headers : res.headers
        };
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        }).on('end', function () {
            result.content = chunks;
            callback(null, result);
        }).on('error', function (err) {
            // throw 'https request res chunk is error' + err;
            callback(err);
        });
    });
    req.on('error', function (e) {
        // throw 'https request is error' + e;
        callback(e);
    });
    if(postData) req.write(postData);
    req.end();
}


function escape2Html(str) {
    var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"','#039':'\'','#x2F':'/'};
    return str.replace(/&(lt|gt|nbsp|amp|quot|#039|#x2F);/ig,function(all,t){return arrEntities[t];});
}

//转换JSON,不抛异常
function parseJSON(str) {
    try {
     return JSON.parse(str);
    } catch (e) {
        console.log(e);
        return {};
    }
}
function coHttpsPost(reqUrl, postData){
    return function (callback){
        httpsPost(reqUrl, callback, postData);
    };
}

exports.checkNumber=checkNumber;
exports.filterFields=filterFields;
exports.replyError=replyError;
exports.loadImgSrc2=loadImgSrc2;
exports.verCompare=verCompare;
exports.formatTime=formatTime;
exports.getIp=getIp;
exports.face=face;
exports.convert=convert;
exports.get=get;
exports.coGet=coGet;
exports.escape2Html=escape2Html;
exports.httpsGet=httpsGet;
exports.httpsPost=httpsPost;
exports.parseJSON=parseJSON;
exports.httpsRequestNew=httpsRequestNew;
exports.coHttpsPost=coHttpsPost;