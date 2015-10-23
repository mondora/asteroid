/*
*   The ddp mixin:
*   - instantiates the ddp connection to the server (a DDP instance) and stores
*     it in the `ddp` property of the Asteroid instance
*   - listens for the `connected` and `disconnected` events of the DDP instance
*     and proxies them to the Asteroid instance
*/

import DDP from "ddp.js";

/*
*   Init method
*/

export function init ({endpoint, SocketConstructor = WebSocket}) {
    this.ddp = new DDP({endpoint, SocketConstructor})
        .on("connected", () => this.emit("connected"))
        .on("disconnected", () => this.emit("disconnected"));
}
