describe("The Asteroid constructor", function () {

	var tmp;
	beforeEach(function () {
		var ddpStub = _.noop;
		if (ENV === "node") {
			tmp = glb.Asteroid.__get__("DDP");
			glb.Asteroid.__set__("DDP", ddpStub);
		} else {
			glb.DDP = ddpStub;
		}
	});

	afterEach(function () {
		if (ENV === "node") {
			glb.Asteroid.__set__("DDP", tmp);
		} else {
			delete glb.DDP;
		}
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			new Asteroid({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should configure the instance according to the passed arguments", function () {

		sinon.stub(Asteroid.prototype, "_init");
		var ceres;

		ceres = new Asteroid("example.com", true, true);
		ceres._host.should.equal("https://example.com");
		ceres._ddpOptions.endpoint.should.equal("wss://example.com/websocket");
		ceres._ddpOptions.socketInterceptFunction.should.equal(true);

		ceres = new Asteroid("example.com", false, true);
		ceres._host.should.equal("http://example.com");
		ceres._ddpOptions.endpoint.should.equal("ws://example.com/websocket");
		ceres._ddpOptions.socketInterceptFunction.should.equal(true);

		ceres = new Asteroid("example.com", true);
		ceres._host.should.equal("https://example.com");
		ceres._ddpOptions.endpoint.should.equal("wss://example.com/websocket");
		_.isUndefined(ceres._ddpOptions.socketInterceptFunction).should.equal(true);

		ceres = new Asteroid("example.com");
		ceres._host.should.equal("http://example.com");
		ceres._ddpOptions.endpoint.should.equal("ws://example.com/websocket");
		_.isUndefined(ceres._ddpOptions.socketInterceptFunction).should.equal(true);

		Asteroid.prototype._init.restore();

	});

	if (ENV === "browser") {
		it("should configure the instance depending on whether SockJS is used or not", function () {

			sinon.stub(Asteroid.prototype, "_init");
			var ceres;

			glb.SockJS = _.noop;
			ceres = new Asteroid("example.com");
			ceres._host.should.equal("http://example.com");
			ceres._ddpOptions.endpoint.should.equal("http://example.com/sockjs");
			ceres._ddpOptions.SocketConstructor.should.equal(SockJS);

			delete glb.SockJS;
			ceres = new Asteroid("example.com");
			ceres._host.should.equal("http://example.com");
			ceres._ddpOptions.endpoint.should.equal("ws://example.com/websocket");
			ceres._ddpOptions.SocketConstructor.should.equal(WebSocket);

			Asteroid.prototype._init.restore();

		});
	}

});

describe("An Asteroid instance", function () {

	var tmp;
	beforeEach(function () {
		var ddpStub = function () {
			ddp = {};
			ddp.on = function (e, f) {
				if (e === "connected") ddp.emitConnected = f;
				if (e === "added") ddp.emitAdded = f;
				if (e === "changed") ddp.emitChanged = f;
				if (e === "removed") ddp.emitRemoved = f;
			};
			ddp.sub = sinon.spy();
			return ddp;
		};
		if (ENV === "node") {
			tmp = glb.Asteroid.__get__("DDP");
			glb.Asteroid.__set__("DDP", ddpStub);
		} else {
			glb.DDP = ddpStub;
		}
	});

	afterEach(function () {
		if (ENV === "node") {
			glb.Asteroid.__set__("DDP", tmp);
		} else {
			delete glb.DDP;
		}
	});

	it("should emit a connected event upon connection", function () {
		var ceres = new Asteroid("example.com");
		ceres._emit = sinon.spy();
		ceres.ddp.emitConnected();
		ceres._emit.calledWith("connected").should.equal(true);
	});

});

describe("The Asteroid.apply method", function () {

	var tmp;
	beforeEach(function () {
		var ddpStub = function () {
			ddp = {};
			ddp.on = _.noop;
			ddp.sub = _.noop;
			ddp.method = sinon.spy(function (m, p, r, u) {
				ddp.params = p;
				ddp.result = r;
				ddp.updated = u;
			});
			return ddp;
		};
		if (ENV === "node") {
			tmp = glb.Asteroid.__get__("DDP");
			glb.Asteroid.__set__("DDP", ddpStub);
		} else {
			glb.DDP = ddpStub;
		}
	});

	afterEach(function () {
		if (ENV === "node") {
			glb.Asteroid.__set__("DDP", tmp);
		} else {
			delete glb.DDP;
		}
	});

	it("should throw if the first argument is not a string", function () {
		var ceres = new Asteroid("example.com");	
		var troublemaker = function () {
			ceres.apply({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should use an empty array as parameters if no array of parameters is supplied", function () {
		var ceres = new Asteroid("example.com");	
		ceres.apply("hello");
		var call = ceres.ddp.method.getCall(0);
		call.args[1].should.eql([]);
	});

	it("should return an object containing two promises", function () {
		var ceres = new Asteroid("example.com");	
		var ret = ceres.apply("method");
		Q.isPromise(ret.result).should.equal(true);
		Q.isPromise(ret.updated).should.equal(true);
	});
	
	describe("the result promise", function () {

		it("should be resolved if the method is successful", function (done) {
			var ceres = new Asteroid("example.com");	
			var res = {};
			var ret = ceres.apply("method");
			ret.result.then(function (arg) {
				try {
					ret.result.isFulfilled().should.equal(true);
					arg.should.equal(res);
				} catch (e) {
					done(e);
				}
				done();
			});
			ceres.ddp.result(null, res);
		});

		it("should be rejected if the method is not successful", function (done) {
			var ceres = new Asteroid("example.com");	
			var err = {};
			var ret = ceres.apply("method");
			ret.result.fail(function (arg) {
				try {
					ret.result.isRejected().should.equal(true);
					arg.should.equal(err);
				} catch (e) {
					done(e);
				}
				done();
			});
			ceres.ddp.result(err);
		});
		
	});

	describe("the updated promise", function () {

		it("should be resolved when the updated message is received", function () {
			var ceres = new Asteroid("example.com");	
			var ret = ceres.apply("method");
			ceres.ddp.updated();
			ret.updated.isFulfilled().should.equal(true);
		});

		it("should be rejected if the method is not successful", function () {
			var ceres = new Asteroid("example.com");	
			var ret = ceres.apply("method");
			ceres.ddp.result(true);
			ret.updated.isRejected().should.equal(true);
		});
		
	});

});
