import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import multiStorage, {get, set, del} from "common/multi-storage";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`multiStorage` lib", () => {

    describe("`get` method", () => {

        it("should return a Promise", () => {
            const ret = get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", () => {

            before(() => {
                global.chrome = {
                    storage: {
                        local: {
                            get: sinon.spy(function (key, cb) {
                                cb({
                                    key: "value"
                                });
                            })
                        }
                    }
                };
            });
            after(() => {
                delete global.chrome;
            });

            it("should resolve the promise with the correct parameters", () => {
                return expect(get("key")).to.become("value");
            });

        });

        describe("`localStorage`", () => {

            before(() => {
                global.localStorage = {
                    key: "value"
                };
            });
            after(() => {
                delete global.localStorage;
            });

            it("should resolve the promise with the correct parameters", () => {
                return expect(get("key")).to.become("value");
            });

        });

        describe("`genericStorage`", () => {

            const genericStorage = {key: "value"};
            before(() => {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });
            after(() => {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should resolve the promise with the correct parameters", () => {
                return expect(get("key")).to.become("value");
            });

        });

    });

    describe("`set` method", () => {

        it("should return a Promise", () => {
            const ret = get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", () => {

            before(() => {
                global.chrome = {
                    storage: {
                        local: {
                            set: sinon.stub().returns(Promise.resolve())
                        }
                    }
                };
            });
            after(() => {
                delete global.chrome;
            });

            it("should set a value in the `chrome` storage", () => {
                set("key", "value");
                expect(chrome.storage.local.set).to.be.calledWith({"key": "value"});
            });

        });

        describe("`localStorage`", () => {

            before(() => {
                global.localStorage = {};
            });
            after(() => {
                delete global.localStorage;
            });

            it("should set a value in the `localStorage`", () => {
                set("key", "value");
                expect(localStorage.key).to.be.equal("value");
            });

        });

        describe("`genericStorage`", () => {

            const genericStorage = {};

            before(() => {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });
            after(() => {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should set a value in the `genericStorage`", () => {
                set("key", "value");
                expect(genericStorage.key).to.be.equal("value");
            });

        });

    });

    describe("`del` method", () => {

        it("should return a Promise", () => {
            const ret = get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", () => {

            before(() => {
                global.chrome = {
                    storage: {
                        local: {
                            remove: sinon.stub().returns(Promise.resolve())
                        }
                    }
                };
            });
            after(() => {
                delete global.chrome;
            });

            it("should remove a value from the `chrome` storage", () => {
                del("key");
                expect(chrome.storage.local.remove).to.be.calledWith("key");
            });

        });

        describe("`localStorage`", () => {

            before(() => {
                global.localStorage = {
                    key: "value"
                };
            });
            after(() => {
                delete global.localStorage;
            });

            it("should remove a value from the `localStorage`", () => {
                del("key");
                expect(localStorage.key).to.be.equal(undefined);
            });

        });

        describe("`genericStorage`", () => {

            const genericStorage = {
                key: "value"
            };
            before(() => {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });
            after(() => {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should remove a value from the `genericStorage`", () => {
                del("key");
                expect(genericStorage.key).to.be.equal(undefined);
            });

        });

    });

});
