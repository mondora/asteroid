"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = connect;
exports.disconnect = disconnect;
exports.init = init;

var _ddp = require("ddp.js");

var _ddp2 = _interopRequireDefault(_ddp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
*   Public methods
*/

function connect() {
    this.ddp.connect();
} /*
  *   The ddp mixin:
  *   - instantiates the ddp connection to the server (a DDP instance) and stores
  *     it in the `ddp` property of the Asteroid instance
  *   - listens for the `connected` and `disconnected` events of the DDP instance
  *     and proxies them to the Asteroid instance
  *   - exposes the `endpoint` public property
  *   - defines the `connect` and `disconnect` methods, used to control the ddp
  *     connection with the server
  */

function disconnect() {
    this.ddp.disconnect();
}

/*
*   Init method
*/

function init(options) {
    var _this = this;

    var endpoint = options.endpoint;
    var _options$SocketConstr = options.SocketConstructor;
    var SocketConstructor = _options$SocketConstr === undefined ? WebSocket : _options$SocketConstr;
    var autoConnect = options.autoConnect;
    var autoReconnect = options.autoReconnect;
    var reconnectInterval = options.reconnectInterval;

    this.endpoint = endpoint;
    var ddpOptions = {
        endpoint: endpoint,
        SocketConstructor: SocketConstructor,
        autoConnect: autoConnect,
        autoReconnect: autoReconnect,
        reconnectInterval: reconnectInterval
    };
    this.ddp = new _ddp2.default(ddpOptions).on("connected", function () {
        return _this.emit("connected");
    }).on("disconnected", function () {
        return _this.emit("disconnected");
    });
}