import EventEmitter from "wolfy87-eventemitter";

export default class Asteroid extends EventEmitter {

    // Use ES7 object spread when available (http://git.io/vqhsp)
    static mixin (mixin) {
        class subClass extends this {
            constructor (options) {
                super(options);
                if (mixin.init) {
                    mixin.init.call(this, options);
                }
            }
        }
        Object.assign(subClass.prototype, mixin);
        delete subClass.prototype.init;
        return subClass;
    }

}
