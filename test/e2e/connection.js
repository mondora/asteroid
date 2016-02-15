import chai, {expect} from "chai";
import {Client} from "faye-websocket";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import {createClass} from "asteroid";

chai.use(sinonChai);

const Asteroid = createClass();
const options = {
    endpoint: "ws://localhost:3000/websocket",
    SocketConstructor: Client
};

describe("connection", () => {

    var asteroid = null;
    afterEach(done => {
        if (asteroid) {
            asteroid.on("disconnected", () => done());
            asteroid.disconnect();
            asteroid = null;
        } else {
            done();
        }
    });

    describe("connecting", () => {

        it("a connection is established on instantiation unless `autoConnect === false`", done => {
            /*
            *   The test suceeds when the `connected` event is fired, signaling
            *   the establishment of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            asteroid = new Asteroid(options);
            asteroid.on("connected", () => {
                done();
            });
        });

        it("a connection is not established on instantiation when `autoConnect === false`", done => {
            /*
            *   The test succeeds if, 1s after the creation of the Asteroid
            *   instance, a `connected` event has not been fired.
            */
            const asteroid = new Asteroid({
                ...options,
                autoConnect: false
            });
            const connectedHandler = sinon.spy();
            asteroid.on("connected", connectedHandler);
            setTimeout(() => {
                try {
                    expect(connectedHandler).to.have.callCount(0);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("a connection can be established manually when `autoConnect === false`", done => {
            /*
            *   The test suceeds when the `connected` event is fired, signaling
            *   the establishment of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            asteroid = new Asteroid({
                ...options,
                autoConnect: false
            });
            asteroid.connect();
            asteroid.on("connected", () => {
                done();
            });
        });

        it("manually connecting several times doesn't causes multiple simultaneous connections [CASE: `autoConnect === true`]", done => {
            /*
            *   The test suceeds if 1s after having called `connect` several
            *   times only one connection has been established.
            */
            asteroid = new Asteroid(options);
            const connectedSpy = sinon.spy();
            asteroid.connect();
            asteroid.connect();
            asteroid.connect();
            asteroid.connect();
            asteroid.on("connected", connectedSpy);
            setTimeout(() => {
                try {
                    expect(connectedSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("manually connecting several times doesn't causes multiple simultaneous connections [CASE: `autoConnect === false`]", done => {
            /*
            *   The test suceeds if 1s after having called `connect` several
            *   times only one connection has been established.
            */
            asteroid = new Asteroid({
                ...options,
                autoConnect: false
            });
            const connectedSpy = sinon.spy();
            asteroid.connect();
            asteroid.connect();
            asteroid.connect();
            asteroid.connect();
            asteroid.on("connected", connectedSpy);
            setTimeout(() => {
                try {
                    expect(connectedSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

    });

    describe("disconnecting", () => {

        it("the connection is closed when calling `disconnect`", done => {
            /*
            *   The test suceeds when the `disconnected` event is fired,
            *   signaling the termination of the connection.
            *   If the event is never fired, the test times out and fails.
            */
            const asteroid = new Asteroid(options);
            asteroid.on("connected", () => {
                asteroid.disconnect();
            });
            asteroid.on("disconnected", () => {
                done();
            });
        });

        it("calling `disconnect` several times causes no issues", done => {
            /*
            *   The test suceeds if:
            *   - calling `disconnect` several times doesn't throw, both before
            *     and after the `disconnected` event has been received
            *   - one and only one `disconnected` event is fired (check after
            *     1s)
            */
            const asteroid = new Asteroid(options);
            const disconnectSpy = sinon.spy(() => {
                try {
                    asteroid.disconnect();
                    asteroid.disconnect();
                    asteroid.disconnect();
                    asteroid.disconnect();
                } catch (e) {
                    done(e);
                }
            });
            asteroid.on("connected", () => {
                try {
                    asteroid.disconnect();
                    asteroid.disconnect();
                    asteroid.disconnect();
                    asteroid.disconnect();
                } catch (e) {
                    done(e);
                }
            });
            asteroid.on("disconnected", disconnectSpy);
            setTimeout(() => {
                try {
                    expect(disconnectSpy).to.have.callCount(1);
                    done();
                } catch (e) {
                    done(e);
                }
            }, 1000);
        });

        it("the connection is closed when calling `disconnect` and it's not re-established", done => {
            /*
            *   The test suceeds if, 1s after the `disconnected` event has been
            *   fired, there hasn't been any reconnection.
            */
            const asteroid = new Asteroid({
                ...options,
                reconnectInterval: 10
            });
            const disconnectOnConnection = sinon.spy(() => {
                asteroid.disconnect();
            });
            asteroid.on("connected", disconnectOnConnection);
            asteroid.on("disconnected", () => {
                setTimeout(() => {
                    try {
                        expect(disconnectOnConnection).to.have.callCount(1);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

        it("the connection is closed and re-established when the server closes the connection, unless `autoReconnect === true`", done => {
            /*
            *   In this test we simulate some (2) disconnections.
            *   The test suceeds when the `connect` event is fired a third time
            *   after the client gets disconnected from the server (occurrence
            *   marked by the `disconnected` event).
            *   If the event is never fired a third time, the test times out
            *   and fails.
            */
            asteroid = new Asteroid({
                ...options,
                reconnectInterval: 10
            });
            var callCount = 0;
            asteroid.on("connected", () => {
                callCount += 1;
                if (callCount < 3) {
                    asteroid.call("disconnectMe");
                }
                if (callCount === 3) {
                    done();
                }
            });
        });

        it("the connection is closed and _not_ re-established when the server closes the connection and `autoReconnect === false`", done => {
            /*
            *   The test suceeds if, 1s after the `disconnected` event has been
            *   fired, there hasn't been any reconnection.
            */
            const asteroid = new Asteroid({
                ...options,
                reconnectInterval: 10,
                autoReconnect: false
            });
            const disconnectMe = sinon.spy(() => {
                asteroid.call("disconnectMe");
            });
            asteroid.on("connected", disconnectMe);
            asteroid.on("disconnected", () => {
                setTimeout(() => {
                    try {
                        expect(disconnectMe).to.have.callCount(1);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 1000);
            });
        });

    });

});
