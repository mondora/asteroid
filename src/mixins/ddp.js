import DDP from "ddp.js";

export function init ({endpoint, SocketConstructor}) {
    this.endpoint = endpoint;
    var options = {
        endpoint: endpoint,
        SocketConstructor: SocketConstructor || WebSocket
    };
    this._ddp = new DDP(options)
        .on("connected", () => {
            this.status = "connected";
            this.emit("connected");
        })
        .on("disconnected", () => {
            this.status = "disconnected";
            this.emit("disconnected");
        });
}
