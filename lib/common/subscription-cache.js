"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SubscriptionCache = function () {
    function SubscriptionCache() {
        _classCallCheck(this, SubscriptionCache);

        this.byFingerprint = {};
        this.byId = {};
    }

    _createClass(SubscriptionCache, [{
        key: "add",
        value: function add(sub) {
            this.byFingerprint[sub.fingerprint] = sub;
            this.byId[sub.id] = sub;
        }
    }, {
        key: "get",
        value: function get(idOrFingerprint) {
            return this.byId[idOrFingerprint] || this.byFingerprint[idOrFingerprint] || null;
        }
    }, {
        key: "del",
        value: function del(idOrFingerprint) {
            var sub = this.get(idOrFingerprint) || {};
            delete this.byFingerprint[sub.fingerprint];
            delete this.byId[sub.id];
        }
    }, {
        key: "forEach",
        value: function forEach(iterator) {
            var _this = this;

            Object.keys(this.byId).forEach(function (id) {
                iterator(_this.byId[id]);
            });
        }
    }]);

    return SubscriptionCache;
}();

exports.default = SubscriptionCache;