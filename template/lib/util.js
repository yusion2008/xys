// Save status for response use later, use for unique multi-request to one
//
var iconv = require('iconv-lite');


var ResponseHolder = function() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
};

ResponseHolder.prototype.setStatusCode = function(sc) {
    this.statusCode = sc;
};

ResponseHolder.prototype.setHeader = function(name, value) {
    this.headers[name] = value;
};

ResponseHolder.prototype.setBody = function(body, enc) {
    if (Buffer.isBuffer(body)) {
        this.body = body;
    } else {
        _enc = enc || 'utf-8';
        var _body = null;
        if (typeof(body) === 'string' || body instanceof String) {
            _body = body;
        } else {
            _body = '' + body;
        }
        this.body = iconv.encode(_body, _enc);
    }
};

ResponseHolder.prototype.writeTo = function(response) {
    response.statusCode = this.statusCode;
    var headers = this.headers;
    for (var prop in headers) {
        if (headers.hasOwnProperty(prop)) {
            response.setHeader(prop, headers[prop]);
        }
    }
    if (this.body && this.body.length) {
        response.setHeader('Content-Length', this.body.length);
    }
    response.end(this.body);
};

// for debug only
ResponseHolder.prototype.print = function(response) {
    console.log('StatusCode: %d', this.statusCode);
    var headers = this.headers;
    console.log('Headers:');
    for (var prop in headers) {
        if (headers.hasOwnProperty(prop)) {
            console.log("%s: %s", prop, headers[prop]);
        }
    }

    console.log('Body: %s', this.body);
};

module.exports.ResponseHolder = ResponseHolder;
