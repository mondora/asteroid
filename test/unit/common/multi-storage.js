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

        describe("`react-native` storage", () => {

            before(() => {
                global.AsyncStorage = {};
            });
            after(() => {
                delete global.AsyncStorage;
            });

            it("should resolve the promise with the correct parameters", () => {
                global.AsyncStorage.getItem = sinon.spy(function (key, cb) {
                    cb(undefined, "value");
                });
                return expect(get("key")).to.become("value");
            });

            it("should reject the promise if there is an error", () => {
                global.AsyncStorage.getItem = sinon.spy(function (key, cb) {
                    cb("error", undefined);
                });
                return expect(get("key")).to.be.rejectedWith("error");
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

        describe("`react-native`", () => {

            before(() => {
                global.AsyncStorage = {};
            });
            after(() => {
                delete global.AsyncStorage;
            });

            it("should set a value in the `AsyncStorage` storage", () => {
                global.AsyncStorage.setItem = sinon.spy();
                set("key", "value");
                expect(AsyncStorage.setItem).to.be.calledWith("key", "value");
            });

            it("should resolve the promise if there isn't any error", () => {
                global.AsyncStorage.setItem = sinon.spy(function (key, value, cb) {
                    cb(undefined);
                });
                const ret = set("key", "value");
                return expect(ret).to.become(undefined);
            });

            it("should reject the promise if there is an error", () => {
                global.AsyncStorage.setItem = sinon.spy(function (key, value, cb) {
                    cb("error");
                });
                const ret = set("key", "value");
                return expect(ret).to.be.rejectedWith("error");
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

        describe("`react-native` storage", () => {

            before(() => {
                global.AsyncStorage = {};
            });
            after(() => {
                delete global.AsyncStorage;
            });

            it("should remove a value from the `react-native` storage", () => {
                AsyncStorage.removeItem = sinon.spy();
                del("key");
                expect(AsyncStorage.removeItem).to.be.calledWith("key");
            });

            it("should resolve the promise if there isn't any error", () => {
                global.AsyncStorage.removeItem = sinon.spy(function (key, cb) {
                    cb(undefined);
                });
                const ret = del("key");
                return expect(ret).to.become(undefined);
            });

            it("should reject the promise if there is an error", () => {
                global.AsyncStorage.removeItem = sinon.spy(function (key, cb) {
                    cb("error");
                });
                const ret = del("key");
                return expect(ret).to.be.rejectedWith("error");
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
