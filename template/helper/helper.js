var hbs   = require('handlebars');

//小于
hbs.registerHelper('if_lt', function(v1, v2, options) {
    if (v1<v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

//不等于
hbs.registerHelper('if_not_eq', function(v1, v2, options) {
    if (v1 != v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

//车型页标签
hbs.registerHelper('if_eq_tag', function(v1, v2, options) {
    var returnSpan = "";
    switch(v1){
          case "1":
            returnSpan = "<span class=\"tag\">现车充足</span>";
            break;
          case "2":
            returnSpan = "<span class=\"tag\">可预订</span>";
            break;
          case "3":
            returnSpan = "<span class=\"tag\">少量现车</span>";
            break;
    }
    switch(v2){
          case 0:
            returnSpan += "<span class=\"tag\">售本市</span>";
            break;
          case 1:
            returnSpan += "<span class=\"tag\">售本省</span>";
            break;
          case 2:
            returnSpan += "<span class=\"tag\">售全国</span>";
            break;
    }
    return returnSpan;
});

//车型页标签
hbs.registerHelper('if_eq_i_tag', function(v1, v2, options) {
    var returnSpan = "";
    switch(v1){
        case "1":
            returnSpan = "<i>现车充足</i>";
            break;
        case "2":
            returnSpan = "<i>可预订</i>";
            break;
        case "3":
            returnSpan = "<i>少量现车</i>";
            break;
    }
    switch(v2){
        case 0:
            returnSpan += "<i>售本市</i>";
            break;
        case 1:
            returnSpan += "<i>售本省</i>";
            break;
        case 2:
            returnSpan += "<i>售全国</i>";
            break;
    }
    return returnSpan;
});

hbs.registerHelper("objToStr", function (obj) {
	return JSON.stringify(obj);
});

hbs.registerHelper('face', function (userId, suffix) {
	var face = 'https://i6ssl.3conline.com/images/upload/upc/face/';
	userId = userId.toString();
	
	for (var i = 0, c = userId.length; i < c; i += 2) {
		face += userId.charAt(i);
		if (i < c - 1) {
			face += userId.charAt(i + 1);
		}
		face += '/';
	}

	return face += userId + '_' + suffix;
});

hbs.registerHelper('if_eq', function (v1, v2, options) {
	if (v1 == v2) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('if_uneq', function (v1, v2, options) {
	if (v1 != v2) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('if_eq_or', function (v1, v2, options) {
	var array = v2.split('||');
	var flag = false;

	for (var i = 0, c = array.length; i < c; i++) {
		if (v1 == array[i]) {
			flag = true;
			break;
		}
	}

	if (flag) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('gt', function (v1, v2, options) {
	if (v1 > v2) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('gt_or_eq', function (v1, v2, options) {
	if (v1 >= v2) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('lt', function(v1, v2, options) {
    if (v1 < v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('lt_or_eq', function(v1, v2, options) {
    if (v1 <= v2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('replace', function (v1, v2, v3, options) {
	
	var reg = new RegExp(v2);
	return v1.replace(reg, v3);
});

hbs.registerHelper('replaceAll', function (v1, v2, v3, options) {
	
	var reg = new RegExp(v2,'g');
	return v1.replace(reg, v3);
});

hbs.registerHelper('isContains', function (v1, v2, options) {
	
	if (v1.indexOf(v2) > -1) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

hbs.registerHelper('encodeURI', function (v1, options) {
	
	return encodeURIComponent(v1);
});

hbs.registerHelper('replaceEmot', function (v1, options) {
	if (v1) {
		return v1.replace(/\[em(\d+)\]/g, '<img src="https://w1ssl.pcauto.com.cn/autobbs/2013/images/emot/em$1.gif"/>').replace(/\n/g, '<br>');
	} else {
		return '';
	}
});

hbs.registerHelper('verCompare', function (ver, verCmp, options) {
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
		console.trace(e);
	}
	
	return ret;
});

hbs.registerHelper('formatTime', function (millis, pattern) {
	var date = new Date(millis);
	return date.Format(pattern);
});

Date.prototype.Format = function (fmt) {
	var o = {
		"M+" : this.getMonth() + 1, //月份
		"d+" : this.getDate(), //日
		"h+" : this.getHours(), //小时
		"m+" : this.getMinutes(), //分
		"s+" : this.getSeconds(), //秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), //季度
		"S" : this.getMilliseconds() //毫秒
	};
	
	if (/(y+)/.test(fmt)) {
	    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
    
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
		    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}

	return fmt;
}

