/**
 * 测试环境可配置扩展文件，当config.js里ext_env:'test'
 */

module.exports =  {

    domain: {   //域名host映射
        pcauto : {
            price_prefix:'http://t-price.pcauto.com.cn',
            mrobot_prefix:'http://t-mrobot.pcauto.com.cn',
            pangku_prefix:'http://api.pangku.com', //不支持R系统，需要用代理
            rs_prefix:'http://rs.pcauto.com.cn',   //无测试环境
            www_prefix:'http://www.pcauto.com.cn',  //静态服务器
            ks_prefix:'http://ks.pcauto.com.cn',
            cmt_prefix:'http://t-cmt.pcauto.com.cn',
            mall_prefix:'http://t-mall.pcauto.com.cn',
            club_prefix:'http://t-club.pcauto.com.cn',
            ivy_prefix:'http://t-ivy.pcauto.com.cn',
            jr_prefix:'http://m-jr.pcauto.com.cn',
            video_prefix:'http://t-pcauto.pcvideo.com.cn',
            beauty_photo_prefix:'http://t-beauty.pcauto.com.cn',
            // solr_prefix:'http://192.168.75.98:8983/solr',
            solr_prefix:'http://192.168.237.8',
            cms_intf_prefix:'http://t-cms.pcauto.com.cn:8002'
        },
        pconline:{
            ivy_prefix: "http://ivy.pconline.com.cn",
            product_prefix:"http://t-product.pconline.com.cn"   //产品库
        }
    },

   
};  