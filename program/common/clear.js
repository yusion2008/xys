/**
 * 清除缓存，测试专用，上线会删除
 * author：xieyongshuang
 */
let co = require('co');
let tool = require('./tools.js').common;

exports.handle = function(req, rh, queryString, callback) {
    co(function*() {
        try {
            //清理模板缓存
            let logs = []
            for (let property in require.cache) {
                logs.push(property);
                delete require.cache[property];
            }
            tool.clearTemplate();
            let obj = { status: "清除成功", logs };
            rh.setHeader('Content-Type', 'text/html; charset=UTF-8');
            rh.setHeader('Cache-Control', 'no-cache');
            rh.setBody(JSON.stringify(obj));
            callback(null, rh);

        } catch (e) {
            console.error(e);
            tool.log(__filename + ' ' + e);
            callback(e);
        }
    })();
};