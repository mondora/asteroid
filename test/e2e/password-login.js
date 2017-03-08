import {expect} from "chai";
import {Client} from "faye-websocket";

import {createClass} from "asteroid";

describe("password-login method", () => {

    const Asteroid = createClass();
    var asteroid;

    beforeEach(() => {
        asteroid = new Asteroid({
            endpoint: "ws://localhost:3000/websocket",
            SocketConstructor: Client
        });
        asteroid.call("removeUserByUsername", "username");
        asteroid.call("removeUserByEmail", "test@email.com");
    });

    afterEach(done => {
        asteroid.on("disconnected", () => done());
        asteroid.disconnect();
    });

    describe("createUser function", () => {

        it("create a new user passing username", async () => {
            const options = {
                username: "username",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            expect(id).to.be.a("string");
            const user = await asteroid.call("getUserById", id);
            expect(user.username).to.equal("username");
            asteroid.call("removeUserById", id);
        });

        it("create a new user passing email", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            expect(id).to.be.a("string");
            const user = await asteroid.call("getUserById", id);
            expect(user.emails[0].address).to.equal("test@email.com");
            asteroid.call("removeUserById", id);
        });

        it("create a new user passing email, username and profile", async () => {
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password",
                profile: {}
            };
            const id = await asteroid.createUser(options);
            expect(id).to.be.a("string");
            const user = await asteroid.call("getUserById", id);
            expect(user.username).to.equal("username");
            expect(user.emails[0].address).to.equal("test@email.com");
            asteroid.call("removeUserById", id);
        });

        it("returns 403 error if user already exist", async () => {
            const options = {
                username: "username",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            await asteroid.createUser(options).catch(err => {
                expect(err.error).to.equal(403);
                expect(err.errorType).to.equal("Meteor.Error");
            });
            asteroid.call("removeUserById", id);
        });

    });

    describe("loginWithPassword function", () => {

        it("login with username", async () => {
            const options = {
                username: "username",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            const loggedId = await asteroid.loginWithPassword(options);
            expect(loggedId).to.be.a("string");
            expect(loggedId).to.equal(id);
            asteroid.call("removeUserById", id);
        });

        it("login with email", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            const loggedId = await asteroid.loginWithPassword(options);
            expect(loggedId).to.be.a("string");
            expect(loggedId).to.equal(id);
            asteroid.call("removeUserById", id);
        });

        it("login with id", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            const loggedId = await asteroid.loginWithPassword({id, password: "password"});
            expect(loggedId).to.be.a("string");
            expect(loggedId).to.equal(id);
            asteroid.call("removeUserById", id);
        });

        it("return 400 if user and password are not defined", async () => {
            const options = {
                username: "username",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            await asteroid.loginWithPassword({}).catch(err => {
                expect(err.error).to.equal(400);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("Unrecognized options for login request");
            });
            asteroid.call("removeUserById", id);
        });

        it("return 400 if password is not a string", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            await asteroid.loginWithPassword({
                email: "test@email.com",
                password: {}
            }).catch(err => {
                expect(err.error).to.equal(400);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("Match failed");
            });
            asteroid.call("removeUserById", id);
        });

        it("return 400 if both username and email are provided as user", async () => {
            const options = {
                email: "test@email.com",
                username: "username",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            await asteroid.loginWithPassword(options).catch(err => {
                expect(err.error).to.equal(400);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("Match failed");
            });
            asteroid.call("removeUserById", id);
        });

        it("return 403 if username doesn't belong to registered user", async () => {
            const options = {
                username: "username",
                password: "password"
            };
            await asteroid.loginWithPassword(options).catch(err => {
                expect(err.error).to.equal(403);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("User not found");
            });
        });

        it("return 403 if email doesn't belong to registered user", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            await asteroid.loginWithPassword(options).catch(err => {
                expect(err.error).to.equal(403);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("User not found");
            });
        });

        it("return 403 if password provided is not correct", async () => {
            const options = {
                email: "test@email.com",
                password: "password"
            };
            const id = await asteroid.createUser(options);
            await asteroid.loginWithPassword({
                email: "test@email.com",
                password: "not-correct-password"
            }).catch(err => {
                expect(err.error).to.equal(403);
                expect(err.errorType).to.equal("Meteor.Error");
                expect(err.reason).to.equal("Incorrect password");
            });
            asteroid.call("removeUserById", id);
        });

    });

});
