/*
*   The ddp mixin:
*   - instantiates the ddp connection to the server (a DDP instance) and stores
*     it in the `ddp` property of the Asteroid instance
*   - listens for the `connected` and `disconnected` events of the DDP instance
*     and proxies them to the Asteroid instance
*   - exposes the `endpoint` public property
*   - defines the `connect` and `disconnect` methods, used to control the ddp
*     connection with the server
*/

import DDP from "ddp.js";

/*
*   Public methods
*/

export function connect () {
    this.ddp.connect();
}

export function disconnect () {
    this.ddp.disconnect();
}

/*
*   Init method
*/

export function init (options) {
    const {
        endpoint,
        SocketConstructor = WebSocket,
        autoConnect,
        autoReconnect,
        reconnectInterval
    } = options;
    this.endpoint = endpoint;
    const ddpOptions = {
        endpoint,
        SocketConstructor,
        autoConnect,
        autoReconnect,
        reconnectInterval
    };
    this.ddp = new DDP(ddpOptions)
        .on("connected", () => this.emit("connected"))
        .on("disconnected", () => this.emit("disconnected"));
}
