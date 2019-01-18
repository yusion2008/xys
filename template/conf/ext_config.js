/**
 * 线上可配置扩展文件，当config.js里ext_env:'product'||''
 */

module.exports = {   
    domain: {   //域名host映射
        pcauto: {
            price_prefix: 'http://price.pcauto.com.cn',     //报价库
            mrobot_prefix: 'http://mrobot.pcauto.com.cn',   //mrobot
            pangku_prefix: 'http://api.pangku.com',         //口袋
            rs_prefix: 'http://rs.pcauto.com.cn',           //推荐系统
            www_prefix:'http://www.pcauto.com.cn',        //静态服务器
            ks_prefix: 'http://ks.pcauto.com.cn',
            cmt_prefix: 'http://cmt.pcauto.com.cn',
            mall_prefix: 'http://mall.pcauto.com.cn',
            club_prefix: 'http://club.pcauto.com.cn',
            mjr_prefix: 'http://m-jr.pcauto.com.cn',
            jr_prefix: 'http://jr.pcauto.com.cn',
            video_prefix: 'http://pcauto.pcvideo.com.cn',
            beauty_photo_prefix: 'http://agent1.pconline.com.cn:8941/pcautophoto',
            panorama_prefix: 'http://t-panorama.pcauto.com.cn',
            pocket_prefix: 'http://pocket.pcauto.com.cn',
            solr_prefix: 'http://192.168.237.8',
            cms_intf_prefix: 'http://192.168.10.74:8003'
        },
        pconline:{
            ivy_prefix: "http://ivy.pconline.com.cn",
            product_prefix:"http://product.pconline.com.cn"   //产品库
        }

    },


};