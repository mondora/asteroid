var Promise = require("promiz");

exports.init = function init () {
    var self = this;
    self._methodsCache = {};
    self._ddp.on("result", function (msg) {
        var method = self._methodsCache[msg.id];
        if (msg.error) {
            method.reject(msg.error);
        } else {
            method.resolve(msg.result);
        }
        delete self._methodsCache[msg.id];
    });
};

exports.apply = function apply (method, params) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var id = self._ddp.method(method, params);
        self._methodsCache[id] = {
            resolve: resolve,
            reject: reject
        };
    });
};

exports.call = function call (method /* , param1, param2, ... */) {
    var params = Array.prototype.slice.call(arguments, 1);
    return this.apply(method, params);
};
