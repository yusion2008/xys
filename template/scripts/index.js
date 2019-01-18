/**
 * xsp  demo页面 * 
 * @author xieyongshuang
 * @date 20190117
 */

//引入依赖
let co = require('co');

exports.handle = function(req, rh, queryString, callback) {
    co(function*() {
        try {
            mainbody_html='这里是xsp的欢迎页面！'
            //响应和输出
            rh.setHeader('Content-Type', 'text/html; charset=UTF-8');
            rh.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
            rh.setBody(mainbody_html);
            callback(null, rh);
        } catch (e) {
            tool.log(__filename + ' ' + e);
            callback(e);
        }
    })();
};