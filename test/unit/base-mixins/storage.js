import {expect} from "chai";
import sinon from "sinon";

import {init} from "base-mixins/storage";
import {get, set, del} from "common/multi-storage";

describe("`storage` mixin", () => {

    describe("`init` method", () => {

        it("expose the passed `storage` as public property", () => {
            const storage = {
                get: sinon.spy(),
                set: sinon.spy(),
                del: sinon.spy()
            };
            const instance = {};
            const options = {storage};
            init.call(instance, options);
            expect(instance.storage).to.deep.equal(storage);
        });

        it("expose the default `storage` as public property", () => {
            const instance = {};
            const options = {};
            init.call(instance, options);
            expect(instance.storage).to.deep.equal({get, set, del});
        });

    });

});
