"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.apply = apply;
exports.call = call;
exports.init = init;
/*
*   The methods mixin:
*   - defines the `apply` and `call` methods, used to send a ddp `method`
*     message to the server. In order to do so - due to the asynchronicity of
*     the ddp method call - it must maintain a cache (under the `methods.cache`
*     property of the Asteroid instance) of ddp method calls, which is then used
*     to match ddp `result` messages received from the server
*/

/*
*   Public methods
*/

function apply(method, params) {
    var _this = this;

    return new Promise(function (resolve, reject) {
        var id = _this.ddp.method(method, params);
        _this.methods.cache[id] = { resolve: resolve, reject: reject };
    });
}

function call(method) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
    }

    return this.apply(method, params);
}

/*
*   Init method
*/

function init() {
    var _this2 = this;

    this.methods = {
        cache: {}
    };
    this.ddp.on("result", function (_ref) {
        var id = _ref.id;
        var error = _ref.error;
        var result = _ref.result;

        var method = _this2.methods.cache[id];
        if (error) {
            method.reject(error);
        } else {
            method.resolve(result);
        }
        delete _this2.methods.cache[id];
    });
}