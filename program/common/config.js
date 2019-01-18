let env = require('./env.js').env;
let trace = require('./env.js').trace;
//console.log(env);
const BASEPATH = __dirname.toString().replace("common", "");
const config = {
    DEBUG: false, //是否开启调试 开启后在命令行工具会输出console.log的信息,否则只记录log，不输出到命令行
    appName: "shangjia", //日志文件的命名
    PATH: "/shangjia/admin/",
    postDataMaxNum: 200, //单次提交的最大参数个数，超过则只截取postDataMaxNum的元素
    loginSuccessUrl: '',    
    LOGIN_PATH: "/dealer/login/login.xsp",
    TEMPPLATE_PATH: BASEPATH + 'template/',
    BASEPATH,
    env,
    trace,
    domain: {
        dev: {
            passport: "http://xys.pcauto.com.cn:9527",
            auth: "http://xys.pcauto.com.cn:9527",
            basicInfo: "http://xys.pcauto.com.cn:9527",
            ms: "http://xys.pcauto.com.cn:9527",
            local: "http://xys.pcauto.com.cn:9527",
            BASE_URL_XSP: "http://t-price.pcauto.com.cn/",
            UPC_URL: "http://t-upc.pcauto.com.cn/",
            BASE_URL_AUTO_5: "http://t-price.pcauto.com.cn/",
            redis:"localhost",
            redisPort:"6379",
        },
        qa: {
            auth: "http://au.shangjia.com.cn:30406",
            passport: "http://au.shangjia.com.cn:30406",
            basicInfo: "http://ms.shangjia.com.cn:30406",
            ms: "http://ms.shangjia.com.cn:30406",
            local: "",
            BASE_URL_XSP: "http://t-price.pcauto.com.cn/",
            UPC_URL: "http://t-upc.pcauto.com.cn/",
            BASE_URL_AUTO_5: "http://t-price.pcauto.com.cn/",
            redis:"",
            redisPort:"6379",

        },
        pro: {
            auth: "//au.shangjia.com.cn",
            passport: "//au.shangjia.com.cn",
            basicInfo: "//ms.shangjia.com.cn",
            ms: "//ms.shangjia.com.cn",
            local: "",
            BASE_URL_XSP: "//price.pcauto.com.cn/",
            UPC_URL: "//upc.pcauto.com.cn/",
            BASE_URL_AUTO_5: "//price.pcauto.com.cn/",
            redis:"",
            redisPort:"6379",
        }
    },
    actions: {
        dev: {
            login: "/shangjia/admin/localtest/login.xsp",
            auth: "/shangjia/admin/localtest/check.xsp",
            getDealerNotice: "/shangjia/admin/localtest/getDealerNotice.xsp",
            sg_save: "/shangjia/admin/localtest/common_save.xsp",
            sg_list: "/shangjia/admin/localtest/sg_list.xsp",
            recmodel_list: "/shangjia/admin/localtest/recmodel_list.xsp",
            orderreceive_list: "/shangjia/admin/localtest/orderreceive_list.xsp",
            npricemodel_list: "/shangjia/admin/localtest/npricemodel_list.xsp",
            model_list: "/shangjia/admin/localtest/model_list.xsp",
            addmodel_list: "/shangjia/admin/localtest/addmodel_list.xsp",
            news_list: "/shangjia/admin/localtest/news_list.xsp",
            news_draft: "/shangjia/admin/localtest/news_draft.xsp",
            log_list: "/shangjia/admin/localtest/log_list.xsp",
            news_activity: "/shangjia/admin/localtest/news_activity.xsp",
            news_brandnews: "/shangjia/admin/localtest/news_brandnews.xsp",
            news_dealernews: "/shangjia/admin/localtest/news_dealernews.xsp",
            news_newcar: "/shangjia/admin/localtest/news_newcar.xsp",
            orderreceive_save: "/shangjia/admin/localtest/common_save.xsp",
            newcar_save: "/shangjia/admin/localtest/common_save.xsp",
            dealernews_save: "/shangjia/admin/localtest/common_save.xsp",
            brandnews_save: "/shangjia/admin/localtest/common_save.xsp",
            activity_save: "/shangjia/admin/localtest/common_save.xsp",
            model_save: "/shangjia/admin/localtest/common_save.xsp",
            baseinfo_save: "/shangjia/admin/localtest/common_save.xsp",
            company_baseinfo: "/shangjia/admin/localtest/company_baseinfo.xsp",
            account_save: "/shangjia/admin/localtest/common_save.xsp",
            company_account: "/shangjia/admin/localtest/company_account.xsp",
            contact_save: "/shangjia/admin/localtest/common_save.xsp",
            company_contact: "/shangjia/admin/localtest/company_contact.xsp",
            map_save: "/shangjia/admin/localtest/common_save.xsp",
            company_map: "/shangjia/admin/localtest/company_map.xsp",
            qualifications_save: "/shangjia/admin/localtest/common_save.xsp",
            company_qualifications: "/shangjia/admin/localtest/company_qualifications.xsp",
            salesarea_save: "/shangjia/admin/localtest/common_save.xsp",
            company_salesarea: "/shangjia/admin/localtest/company_salesarea.xsp",
            aftersalesarea_save: "/shangjia/admin/localtest/common_save.xsp",
            company_aftersalesarea: "/shangjia/admin/localtest/company_aftersalesarea.xsp",
        },
        qa: {
            login: "/passport/user/login",
            auth: "/auth/check.do",
            getDealerNotice: "/shangjia/admin/notice/getDealerNotice",
            sg_save: "",
            sg_list: "",
            recmodel_list: "",
            orderreceive_list: "",
            npricemodel_list: "",
            model_list: "",
            addmodel_list: "",
            news_list: "",
            news_draft: "",
            log_list: "",
            news_activity: "",
            news_brandnews: "",
            news_dealernews: "",
            news_newcar: "",
            orderreceive_save: "",
            newcar_save: "",
            dealernews_save: "",
            brandnews_save: "",
            activity_save: "",
            model_save: "",
            baseinfo_save: "",
            company_baseinfo: "",
            account_save: "",
            company_account: "",
            contact_save: "",
            company_contact: "",
            map_save: "",
            company_map: "",
            qualifications_save: "",
            company_qualifications: "",
            salesarea_save: "",
            company_salesarea: "",
            aftersalesarea_save: "",
            company_aftersalesarea: "",
        },
        pro: {
            login: "/passport/user/login",
            auth: "/auth/check.do",
            getDealerNotice: "/shangjia/admin/notice/getDealerNotice",
            sg_save: "",
            sg_list: "",
            recmodel_list: "",
            orderreceive_list: "",
            npricemodel_list: "",
            model_list: "",
            addmodel_list: "",
            news_list: "",
            news_draft: "",
            log_list: "",
            news_activity: "",
            news_brandnews: "",
            news_dealernews: "",
            news_newcar: "",
            orderreceive_save: "",
            newcar_save: "",
            dealernews_save: "",
            brandnews_save: "",
            activity_save: "",
            model_save: "",
            baseinfo_save: "",
            company_baseinfo: "",
            account_save: "",
            company_account: "",
            contact_save: "",
            company_contact: "",
            map_save: "",
            company_map: "",
            qualifications_save: "",
            company_qualifications: "",
            salesarea_save: "",
            company_salesarea: "",
            aftersalesarea_save: "",
            company_aftersalesarea: "",
        }
    },
    getDomain(key) {
        const domain = this.domain;

        if (!domain) {
            console.error(`domain is required!`);
            return;
        };

        const curEnvDomain = domain[this.env];

        if (!curEnvDomain) {
            console.error(`domain[${this.env}] is required!`)
        };
        const curDomain = curEnvDomain[key] || "";

        return curDomain
    },
    getAPI(key) {
        const actions = this.actions;

        if (!actions) {
            console.error(`actions is required!`);
            return;
        };

        const curEnvActions = actions[this.env];

        if (!curEnvActions) {
            console.error(`actions[${this.env}] is required!`)
        };
        const curactions = curEnvActions[key] || "";

        return curactions
    },
    BaseJson() {
        let that = this;
        return {
            BASE_URL_XSP: that.getDomain("BASE_URL_XSP"),
            BASE_URL_AUTO_5: that.getDomain("BASE_URL_AUTO_5"),
            UPC_URL: that.getDomain("UPC_URL"),
            getDealerNotice: that.getAPI("getDealerNotice"),
        }
    },

}

exports.config = config;