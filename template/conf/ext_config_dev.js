/**
 * 开发环境可配置扩展文件，当config.js里ext_env:'dev'
 */

module.exports =  {
    domain: {   //域名host映射
        pcauto : {
            // price_prefix:'http://t-price.pcauto.com.cn',
            price_prefix:'http://t-price.pcauto.com.cn',
            mrobot_prefix:'http://mrobot.pcauto.com.cn',
            pangku_prefix:'http://api.pangku.com',
            rs_prefix:'http://rs.pcauto.com.cn',
            www_prefix:'http://www.pcauto.com.cn',  //静态服务器
            ks_prefix:'http://ks.pcauto.com.cn',
            cmt_prefix:'http://cmt.pcauto.com.cn',
            mall_prefix: "http://mall.pcauto.com.cn",
            club_prefix: "http://club.pcauto.com.cn",
            jr_prefix: "http://m-jr.pcauto.com.cn",
            jr2_prefix: "http://m-jr.pcauto.com.cn"
        },
        pconline:{
            ivy_prefix: "http://ivy.pconline.com.cn",
            product_prefix:"http://t-product.pconline.com.cn"   //产品库
        }
    },

};