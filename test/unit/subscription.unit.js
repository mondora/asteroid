describe("The Asteroid.subscribe method", function () {

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
			ddp.sub = (function () {
				var i = 0;
				return function (n, p, f, s, r) {
					ddp.resolve = f;
					ddp.stop = s;
					ddp.reject = r;
					ddp.params = p;
					return i++;
				};
			})();
			ddp.unsub = sinon.spy(function () {
				ddp.stop();
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
			ceres.subscribe({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should save a reference to the subscription", function () {
		var ceres = new Asteroid("example.com");	
		var sub0 = ceres.subscribe("sub0");
		var sub1 = ceres.subscribe("sub1");
		ceres.subscriptions[sub0.id].should.equal(sub0);
		ceres.subscriptions[sub1.id].should.equal(sub1);
	});

	describe("should return an object with a ready property, which", function () {

		it("is a promise", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			Q.isPromise(promise).should.equal(true);
		});

		it("will be resolved if the subscription is successful", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			ceres.ddp.resolve();
			promise.isFulfilled().should.equal(true);
		});

		it("will be rejected if the subscription is not successful", function () {
			var ceres = new Asteroid("example.com");	
			var promise = ceres.subscribe("sub").ready;
			ceres.ddp.reject();
			promise.isRejected().should.equal(true);	
		});

		it("if rejected, should clean up all references of the subscription", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			var promise = sub.ready;
			ceres.ddp.reject();
			promise.isRejected().should.equal(true);	
			_.isUndefined(ceres.subscriptions[sub.id]).should.equal(true);
			_.isUndefined(ceres._subscriptionsCache[sub._fingerprint]).should.equal(true);
		});

	});

	describe("should return an object with a stop method, which", function () {

		it("is a function", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			_.isFunction(sub.stop).should.equal(true);
		});

		it("when called will stop the subscription", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			sub.stop();
			ceres.ddp.unsub.calledWith(sub.id).should.equal(true);
		});

		it("will delete the subscription on stop", function () {
			var ceres = new Asteroid("example.com");	
			var sub = ceres.subscribe("sub");
			ceres.subscriptions[sub.id].should.equal(sub);
			sub.stop();
			_.isUndefined(ceres.subscriptions[sub.id]).should.equal(true);
			_.isUndefined(ceres._subscriptionsCache[sub._fingerprint]).should.equal(true);
		});

	});

	it("should pass the correct parameters to the publish function (on the server)", function () {
		var p0 = {};
		var p1 = {};
		var p2 = {};
		// ...
		var ceres = new Asteroid("example.com");	
		var sub = ceres.subscribe("sub", p0, p1, p2);
		ceres.ddp.params[0].should.equal(p0);
		ceres.ddp.params[1].should.equal(p1);
		ceres.ddp.params[2].should.equal(p2);
	});

	it("should cache identical calls", function () {
		var p0 = {};
		var p1 = {};
		var p2 = {};
		// ...
		var ceres = new Asteroid("example.com");	
		var sub0 = ceres.subscribe("sub", p0, p1, p2);
		var sub1 = ceres.subscribe("sub", p0, p1, p2);
		sub0.should.equal(sub1);
	});

	it("should not cache non-identical calls", function () {
		var p = {};
		var p0 = {a: 0};
		var p1 = {a: 1};
		// ...
		var ceres = new Asteroid("example.com");	
		var sub0 = ceres.subscribe("sub", p, p0);
		var sub1 = ceres.subscribe("sub", p, p1);
		sub0.should.not.equal(sub1);
	});

});

describe("The Asteroid._reEstablishSubscriptions method", function () {

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
			ddp.sub = (function () {
				var i = 0;
				return function (n, p, f, s, r) {
					ddp.resolve = f;
					ddp.stop = s;
					ddp.reject = r;
					ddp.params = p;
					return i++;
				};
			})();
			ddp.unsub = sinon.spy(function () {
				ddp.stop();
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

	it("should replay all active subscriptions", function ()  {
		var ceres = new Asteroid("example.com");	
		var sub0 = ceres.subscribe("sub", 0, 1);
		var sub1 = ceres.subscribe("sub", 1, 2);
		_.keys(ceres.subscriptions).length.should.equal(2);
		ceres._reEstablishSubscriptions();
		_.keys(ceres.subscriptions).length.should.equal(2);
		_.isUndefined(ceres._subscriptionsCache[sub0._fingerprint]).should.equal(false);
		_.isUndefined(ceres._subscriptionsCache[sub1._fingerprint]).should.equal(false);
	});

});
