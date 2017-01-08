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
    let onResult = params && params[params.length - 1];
    if (typeof onResult === "function") {
        params.pop();
    } else {
        onResult = undefined;
    }
    return new Promise((resolve, reject) => {
        const id = this.ddp.method(method, params);
        this.methods.cache[id] = {
            resolve,
            reject,
            onResult,
        };
    });
}

export function call (method, ...params) {
    return this.apply(method, params);
}

export function updateMethod (id) {
    const method = this.methods.cache[id];
    // if there was no previous `result` event, there is no result
    // stored that we can use to resolve
    // since every method invocation will have one `updated` and one
    // `result` event, we now wait until the `result` event occurs
    if (!method.hasOwnProperty("result")) {
        this.methods.cache[id].updated = true;
        return;
    }
    method.resolve(method.result);
    delete this.methods.cache[id];
}

/*
*   Init method
*   The method lifecycle contains exactly one `result` event and one `updated` event.
*   - Once the Method has finished running on the server, it sends a `result` message.
*   - If the method has updates that are relevant to the client's subscriptions,
*   the server sends those relevant updates, and emits an `updated` event afterward.
*   - if there are no relevant data updates, the `updated` event is emitted before
*   the `results` event (for whatever reason...)
*   See the meteor guide for more information about the method lifecycle
*   https://guide.meteor.com/methods.html#call-lifecycle
*/

export function init () {
    this.methods = {
        cache: {}
    };
    this.ddp.on("result", ({id, error, result}) => {
        const method = this.methods.cache[id];
        if (error) {
            method.reject(error);
        } else if (method.updated) {
            // only resolve if there was a previous `updated` event
            method.resolve(result);
        } else {
            // since there was no previous `update` event we have to cache the
            // result and resolve the promise with this result when the
            // `updated` event is emitted
            this.methods.cache[id].result = result;
            if (this.methods.cache[id].onResult) {
                this.methods.cache[id].onResult(result);
            }
            return;
        }
        delete this.methods.cache[id];
    });
    this.ddp.on("updated", ({methods}) => {
        methods.forEach(updateMethod.bind(this));
    });
}
