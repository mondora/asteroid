var DDP = require("ddp.js");

exports.init = function init (options) {
    var self = this;
    self.endpoint = options.endpoint;
    var ddpOptions = {
        endpoint: self.endpoint,
        SocketConstructor: options.SocketConstructor || WebSocket
    };
    self._ddp = new DDP(ddpOptions)
        .on("connected", function () {
            self.status = "connected";
            self.emit("connected");
        })
        .on("disconnected", function () {
            self.status = "disconnected";
            self.emit("disconnected");
        });
};
