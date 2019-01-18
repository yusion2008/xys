var cfg = {
    xsp: {
        // accesslog: '1h', //日志可以配置为1d表示1天，2d表示两天一个，1h表示一小时一个，2h表示两小时一个了,整个注释掉就不出日志。
        //R_accesslog: '1h', //R系统请求后端的日志，可以配置为1h表示一小时一个,整个注释掉就不出日志，还会按照每15分钟切分
        port: 9527,
        helpers:[
            'helper/helper.js'
        ]
    },
    //扩展配置文件使用环境
    // product：线上环境， 对应ext_config.js, [default]
    // test：测试环境，对应ext_config_test.js
    // dev：开发环境，对应ext_config_dev.js
    ext_env : 'test',
    trace:true,//是否开启跟踪
};

var init_ext = false;

function config() {
    if (init_ext) {
        //console.log('has init ext config!');
        return cfg;
    }
    //加载扩展配置
    var ext = {};
    var env = process.env.ext_env || cfg.ext_env || 'product'; //环境变量优先
    switch (env) {
        case 'test' :
            ext = require('./ext_config_test.js');
            break;
        case 'dev' :
            ext = require('./ext_config_dev.js');
            break;
        default:
            ext = require('./ext_config.js');
            break;
    }
    for (var c in ext) {
        if (ext.hasOwnProperty(c)) {
            cfg[c] = ext[c];
        }
    }
    cfg.env = env;
    init_ext = true;
    return cfg;
}
module.exports.config = config;