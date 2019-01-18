/**
 * demo页面 * 
 * @author xieyongshuang
 * @date 20190117
 */

//引入依赖
let co = require('co');
let tool = require('../../common/tools.js').common;
let config = require('../../common/config.js').config;

//引入模板
let mainbody_template = tool.getTemplate(config.TEMPPLATE_PATH + "index.html");

exports.handle = function(req, rh, queryString, callback) {
    co(function*() {
        try {
            let env_json = config.BaseJson();
            let data = tool.getPostData(req, queryString);

           env_json.title="我是标题";
           env_json.body="我是内容";

            //编译模板
            mainbody_html = mainbody_template(env_json);

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