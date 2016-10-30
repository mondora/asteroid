/*
*   The methods mixin:
*   - defines the `apply` and `call` methods, used to send a ddp `method`
*     message to the server. In order to do so - due to the asynchronicity of
*     the ddp method call - it must maintain a cache (under the `methods.cache`
*     property of the Asteroid instance) of ddp method calls, which is then used
*     to match ddp `result` messages received from the server
*/

/*
*   Public methods
*/

export function apply (method, params) {
    return new Promise((resolve, reject) => {
        const id = this.ddp.method(method, params);
        this.methods.cache[id] = {resolve, reject};
    });
}

export function call (method, ...params) {
    return this.apply(method, params);
}

/*
*   Init method
*/

export function init () {
    this.methods = {
        cache: {}
    };
    this.ddp.on("result", ({id, error, result}) => {
        const method = this.methods.cache[id];
        if (error) {
            method.reject(error);
        }
        this.methods.cache[id].result = result;
    });
    this.ddp.on("updated", ({id, error}) => {
        const method = this.methods.cache[id];
        if (error) {
            method.reject(error);
        } else {
            method.resolve(method.result);
        }
        delete this.methods.cache[id];
    });
}
