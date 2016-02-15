import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as multiStorage from "common/multi-storage";

describe("`multiStorage` lib", function () {

    describe("`get` method", function () {

        it("should return a Promise", function () {
            const ret = multiStorage.get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", function () {

            before(function () {
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

            after(function () {
                delete global.chrome;
            });

            it("should resolve the promise with the correct parameters", function () {
                return expect(multiStorage.get("key")).to.become("value");
            });

        });

        describe("`localStorage`", function () {

            before(function () {
                global.localStorage = {
                    key: "value"
                };
            });

            after(function () {
                delete global.localStorage;
            });

            it("should resolve the promise with the correct parameters", function () {
                return expect(multiStorage.get("key")).to.become("value");
            });

        });

        describe("`react-native` storage", function () {

            before(function () {
                global.AsyncStorage = {};
            });

            after(function () {
                delete global.AsyncStorage;
            });

            it("should resolve the promise with the correct parameters", function () {
                global.AsyncStorage.getItem = sinon.spy(function (key, cb) {
                    cb(undefined, "value");
                });
                return expect(multiStorage.get("key")).to.become("value");
            });

            it("should reject the promise if there is an error", function () {
                global.AsyncStorage.getItem = sinon.spy(function (key, cb) {
                    cb("error", undefined);
                });
                return expect(multiStorage.get("key")).to.be.rejectedWith("error");
            });

        });

        describe("`genericStorage`", function () {

            const genericStorage = {key: "value"};

            before(function () {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });

            after(function () {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should resolve the promise with the correct parameters", function () {
                return expect(multiStorage.get("key")).to.become("value");
            });

        });

    });

    describe("`set` method", function () {

        it("should return a Promise", function () {
            const ret = multiStorage.get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", function () {

            before(function () {
                global.chrome = {
                    storage: {
                        local: {
                            set: sinon.stub().returns(Promise.resolve())
                        }
                    }
                };
            });

            after(function () {
                delete global.chrome;
            });

            it("should set a value in the `chrome` storage", function () {
                multiStorage.set("key", "value");
                expect(chrome.storage.local.set).to.be.calledWith({"key": "value"});
            });

        });

        describe("`localStorage`", function () {

            before(function () {
                global.localStorage = {};
            });

            after(function () {
                delete global.localStorage;
            });

            it("should set a value in the `localStorage`", function () {
                multiStorage.set("key", "value");
                expect(localStorage.key).to.be.equal("value");
            });

        });

        describe("`react-native`", function () {

            before(function () {
                global.AsyncStorage = {};
            });

            after(function () {
                delete global.AsyncStorage;
            });

            it("should set a value in the `AsyncStorage` storage", function () {
                global.AsyncStorage.setItem = sinon.spy();
                multiStorage.set("key", "value");
                expect(AsyncStorage.setItem).to.be.calledWith("key", "value");
            });

            it("should resolve the promise if there isn't any error", function () {
                global.AsyncStorage.setItem = sinon.spy(function (key, value, cb) {
                    cb(undefined);
                });
                const ret = multiStorage.set("key", "value");
                return expect(ret).to.become(undefined);
            });

            it("should reject the promise if there is an error", function () {
                global.AsyncStorage.setItem = sinon.spy(function (key, value, cb) {
                    cb("error");
                });
                const ret = multiStorage.set("key", "value");
                return expect(ret).to.be.rejectedWith("error");
            });


        });

        describe("`genericStorage`", function () {

            const genericStorage = {};

            before(function () {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });

            after(function () {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should set a value in the `genericStorage`", function () {
                multiStorage.set("key", "value");
                expect(genericStorage.key).to.be.equal("value");
            });

        });

    });

    describe("`del` method", function () {

        it("should return a Promise", function () {
            const ret = multiStorage.get.call("key");
            expect(ret).to.be.an.instanceOf(Promise);
        });

        describe("`chrome` storage", function () {

            before(function () {
                global.chrome = {
                    storage: {
                        local: {
                            remove: sinon.stub().returns(Promise.resolve())
                        }
                    }
                };
            });

            after(function () {
                delete global.chrome;
            });

            it("should remove a value from the `chrome` storage", function () {
                multiStorage.del("key");
                expect(chrome.storage.local.remove).to.be.calledWith("key");
            });

        });

        describe("`localStorage`", function () {

            before(function () {
                global.localStorage = {
                    key: "value"
                };
            });

            after(function () {
                delete global.localStorage;
            });

            it("should remove a value from the `localStorage`", function () {
                multiStorage.del("key");
                expect(localStorage.key).to.be.equal(undefined);
            });

        });

        describe("`react-native` storage", function () {

            before(function () {
                global.AsyncStorage = {};
            });

            after(function () {
                delete global.AsyncStorage;
            });

            it("should remove a value from the `react-native` storage", function () {
                AsyncStorage.removeItem = sinon.spy();
                multiStorage.del("key");
                expect(AsyncStorage.removeItem).to.be.calledWith("key");
            });

            it("should resolve the promise if there isn't any error", function () {
                global.AsyncStorage.removeItem = sinon.spy(function (key, cb) {
                    cb(undefined);
                });
                const ret = multiStorage.del("key");
                return expect(ret).to.become(undefined);
            });

            it("should reject the promise if there is an error", function () {
                global.AsyncStorage.removeItem = sinon.spy(function (key, cb) {
                    cb("error");
                });
                const ret = multiStorage.del("key");
                return expect(ret).to.be.rejectedWith("error");
            });

        });

        describe("`genericStorage`", function () {

            const genericStorage = {
                key: "value"
            };

            before(function () {
                multiStorage.__Rewire__("genericStorage", genericStorage);
            });

            after(function () {
                multiStorage.__ResetDependency__("genericStorage");
            });

            it("should remove a value from the `genericStorage`", function () {
                multiStorage.del("key");
                expect(genericStorage.key).to.be.equal(undefined);
            });

        });

    });

});
