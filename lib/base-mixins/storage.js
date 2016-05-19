"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.init = init;

var _multiStorage = require("../common/multi-storage");

var defaultStorages = _interopRequireWildcard(_multiStorage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function init(options) {
    var _options$storage = options.storage;
    var storage = _options$storage === undefined ? defaultStorages : _options$storage;


    this.storage = {
        get: storage.get,
        set: storage.set,
        del: storage.del
    };
}