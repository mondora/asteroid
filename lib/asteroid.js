"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createClass = createClass;

var _lodash = require("lodash.assign");

var _lodash2 = _interopRequireDefault(_lodash);

var _wolfy87Eventemitter = require("wolfy87-eventemitter");

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _ddp = require("./base-mixins/ddp");

var ddp = _interopRequireWildcard(_ddp);

var _login = require("./base-mixins/login");

var login = _interopRequireWildcard(_login);

var _passwordLogin = require("./base-mixins/password-login");

var loginWithPassword = _interopRequireWildcard(_passwordLogin);

var _methods = require("./base-mixins/methods");

var methods = _interopRequireWildcard(_methods);

var _storage = require("./base-mixins/storage");

var storage = _interopRequireWildcard(_storage);

var _subscriptions = require("./base-mixins/subscriptions");

var subscriptions = _interopRequireWildcard(_subscriptions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
*   A mixin is a plain javascript object. Mixins are composed by merging the
*   mixin object own enumerable properties into the Asteroid's base prototype.
*   The only exception is the `init` method. If the mixin defines an `init`
*   method, it will _not_ be merged into the prototype, instead it'll be called
*   at construction time.
*
*   Example usage:
*   ```js
*   import {createClass} from "asteroid";
*   import * as myMixinOne from "asteroid-my-mixin-one";
*   import * as myMixinTwo from "asteroid-my-mixin-two";
*   const Asteroid = createClass([myMixinOne, myMixinTwo]);
*   ```
*/

function createClass() {
    var customMixins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];


    // Include base mixins before custom ones
    var mixins = [ddp, methods, subscriptions, login, loginWithPassword, storage].concat(customMixins);

    var Asteroid = function Asteroid() /* arguments */{
        var _this = this,
            _arguments = arguments;

        // Call each init method
        mixins.forEach(function (_ref) {
            var init = _ref.init;
            return init && init.apply(_this, _arguments);
        });
    };

    Asteroid.prototype = Object.create(_wolfy87Eventemitter2.default.prototype);
    Asteroid.prototype.constructor = Asteroid;
    // Merge all mixins into Asteroid.prototype
    _lodash2.default.apply(undefined, [Asteroid.prototype].concat(_toConsumableArray(mixins)));
    // And delete the "dangling" init property
    delete Asteroid.prototype.init;

    // Return the newly constructed class
    return Asteroid;
}