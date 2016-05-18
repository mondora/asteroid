import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import passwordLogin, {createUser, loginWithPassword} from "base-mixins/password-login";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`passwordLogin` mixin", () => {

    const onLogin = sinon.spy();
    beforeEach(() => {
        onLogin.reset();
        passwordLogin.__Rewire__("onLogin", onLogin);
    });
    afterEach(() => {
        passwordLogin.__ResetDependency__("onLogin");
    });

    describe("`createUser` method", () => {

        it("should call the `call` instance method with the correct parameters", () => {
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
            createUser.call(instance, parameters);
            expect(instance.call).to.have.been.calledWith("createUser", expectedParameter);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            return createUser.call(instance, options)
                .then(() => {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

    describe("`loginWithPassword` method", () => {

        it("should call the `call` instance method with the correct parameters", () => {
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
            loginWithPassword.call(instance, options);
            expect(instance.call).to.have.been.calledWith("login", expectedParameter);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            return loginWithPassword.call(instance, options)
                .then(() => {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

});
