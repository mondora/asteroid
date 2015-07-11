import EventEmitter from "wolfy87-eventemitter";

import ddp from "./mixins/ddp";
import methods from "./mixins/methods";
import subscriptions from "./mixins/subscriptions";
import passwordLogin from "./mixins/password-login";

export default class Asteroid extends EventEmitter {

    constructor (options) {
        Asteroid.initFunctions.forEach(fn => {
            fn.call(this, options);
        });
    }

}

Asteroid.initFunctions = [];

Asteroid.mixin = function (mixin) {
    Object.keys(mixin).forEach(key => {
        var fn = mixin[key];
        if (key === "init") {
            Asteroid.initFunctions.push(fn);
        } else {
            Asteroid.prototype[key] = fn;
        }
    });
    return Asteroid;
};

Asteroid
    .mixin(ddp)
    .mixin(methods)
    .mixin(subscriptions)
    .mixin(passwordLogin);
