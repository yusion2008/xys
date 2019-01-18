
/**
* 数字的校验
* @param num 需要校验的数字
* @param defaul 如果校验失败返回的默认值
*/
function numberValidate(num,defaultNum){
    var pattern = /^[1-9]\d{0,9}$/g;
    pattern.compile(pattern);
    var re1 = new RegExp(pattern);
    if( ! re1.test(num)){
         return defaultNum;
    }

    return num;
}

/**
 * 验证中文
 * c:需要验证的中文
 * p:字符的位数
 * d:验证不通过时默认值
 */
function chineseValidate(c,p,d){
    //pageNo 校验
    var cPatt = "^[\\u4e00-\\u9fa5\\s]" + "{1," + p + "}$";
    //cPatt.compile(cPatt);
    var re1 = new RegExp(cPatt);
    if( ! re1.test(c)){
        return d;
    }

    return c;
}

/**
* 验证页码和页数
*/
function pageNoValidate(pageNo){
    //pageNo 校验
    var pageNoPatt = /^[1-9]\d{0,5}$/g;
    pageNoPatt.compile(pageNoPatt);
    var re1 = new RegExp(pageNoPatt);
    if( ! re1.test(pageNo)){
         return 1; 
    }

    return pageNo;
}

/**
* 验证页码和页数
*/
function pageSizeValidate(pageSize){
   //pageSize 校验
    var pageSizePatt = /^[1-9]\d{0,5}$/g;
    pageSizePatt.compile(pageSizePatt);
    var re1 = new RegExp(pageSizePatt);
    if( ! re1.test(pageSize)){
         return 20; 
    }

    return pageSize;
}

function pageParamValidate(pageNo,pageSize){
   //pageNo 校验
    var pageNoPatt = /^[1-9]\d{0,5}$/g;
    pageNoPatt.compile(pageNoPatt);
    var re1 = new RegExp(pageNoPatt);
    if( ! re1.test(pageNo)){
         pageNo = 1; 
    }

   //pageSize 校验
    var pageSizePatt = /^[1-9]\d{0,5}$/g;
    pageSizePatt.compile(pageSizePatt);
    var re1 = new RegExp(pageSizePatt);
    if( ! re1.test(pageSize)){
         pageSize = 20; 
        
    }
    var returnString = '&pageNo=' + pageNo + '&pageSize=' + pageSize;
    return returnString
}


exports.numberValidate = numberValidate;
exports.pageNoValidate = pageNoValidate;
exports.pageSizeValidate = pageSizeValidate;
exports.pageParamValidate = pageParamValidate;
exports.chineseValidate = chineseValidate;