import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as passwordLogin from "base-mixins/password-login";

describe("`passwordLogin` mixin", function () {

    const onLogin = sinon.spy();

    beforeEach(function () {
        onLogin.reset();
        passwordLogin.__Rewire__("onLogin", onLogin);
    });

    afterEach(function () {
        passwordLogin.__ResetDependency__("onLogin");
    });

    describe("`createUser` method", function () {

        it("should call the `call` instance method with the correct parameters", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const parameters = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            const expectedParameter = {
                password: "password",
                user: {
                    username: "username",
                    email: "test@email.com"
                }
            };
            passwordLogin.createUser.call(instance, parameters);
            expect(instance.call).to.have.been.calledWith("createUser", expectedParameter);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            return passwordLogin.createUser.call(instance, options)
                .then(function () {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

    describe("`loginWithPassword` method", function () {

        it("should call the `call` instance method with the correct parameters", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            const expectedParameter = {
                password: "password",
                user: {
                    username: "username",
                    email: "test@email.com"
                }
            };
            passwordLogin.loginWithPassword.call(instance, options);
            expect(instance.call).to.have.been.calledWith("login", expectedParameter);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            return passwordLogin.loginWithPassword.call(instance, options)
                .then(function () {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

});
