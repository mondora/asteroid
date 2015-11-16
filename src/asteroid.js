import EventEmitter from "wolfy87-eventemitter";

import * as ddp from "./base-mixins/ddp";
import * as login from "./base-mixins/login";
import * as methods from "./base-mixins/methods";
import * as loginWithPassword from "./base-mixins/password-login";
import * as subscriptions from "./base-mixins/subscriptions";

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

export function createClass (customMixins) {

    // Include base mixins before custom ones
    const mixins = [ddp, methods, subscriptions, login, loginWithPassword]
        .concat(customMixins);

    const Asteroid = function Asteroid (/* arguments */) {
        const args = arguments;
        // Call each init method
        mixins.forEach(({init}) => init && init.apply(this, args));
    };

    // Merge all mixins into Asteroid.prototype
    Asteroid.prototype = mixins.reduce((proto, mixin) => {
        return {...proto, ...mixin};
    }, EventEmitter.prototype);
    // And delete the "dangling" init property
    delete Asteroid.prototype.init;

    // Return the newly constructed class
    return Asteroid;

}
