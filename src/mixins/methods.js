export function init () {
    this._methodsCache = {};
    this.ddp.on("result", msg => {
        var method = this._methodsCache[msg.id];
        if (msg.error) {
            method.reject(msg.error);
        } else {
            method.resolve(msg.result);
        }
        delete this._methodsCache[msg.id];
    });
}

export function apply (method, params) {
    return new Promise((resolve, reject) => {
        var id = this.ddp.method(method, params);
        this._methodsCache[id] = {resolve, reject};
    });
}

export function call (method, ...params) {
    return this.apply(method, params);
}
