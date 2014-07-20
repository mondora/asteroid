describe("The _tryResumeLogin method", function () {

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
			ddp.method = function (n, p, f) {
				if (n === "login") {
					ddp.logInClient = f;
				}
			};
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

	it("should return a promise, setting it as property resumeLoginPromise of the instance", function () {
		var ceres = new Asteroid("example.com");
		ceres.ddp.emitConnected();
		Q.isPromise(ceres.resumeLoginPromise).should.equal(true);
	});

	it("which should be rejected if no previous login token is found", function (done) {
		if (ENV === "browser") {
			localStorage.clear();
		} else {
			glb.Asteroid.__set__("nodeTemporaryStorage", {});
		}
		var ceres = new Asteroid("example.com");
		ceres.ddp.emitConnected();
		ceres.resumeLoginPromise
			.then(function () {
				done("Expected promise to fail");
			})
			.fail(function (e) {
				e.message.should.equal("No login token");
				done();
			});
	});

	it("which should be rejected if a non-valid login token is found ", function (done) {
		if (ENV === "node") {
			glb.Asteroid.__set__("nodeTemporaryStorage", {
				"http://example.com__0__login_token__": "token"
			});
		} else {
			localStorage["http://example.com__0__login_token__"] = "token";
		}	
		var err = {};
		var ceres = new Asteroid("example.com");
		ceres.ddp.emitConnected();
		ceres.resumeLoginPromise
			.then(function () {
				done("Expected promise to fail");
			})
			.fail(function (e) {
				if (ENV === "browser") {
					localStorage.clear();
				} else {
					glb.Asteroid.__set__("nodeTemporaryStorage", {});
				}
				e.should.equal(err);
				done();
			});
		setTimeout(function () {
			ceres.ddp.logInClient(err);
		}, 20);
	});

	it("which should be resolved with the id of the logged in user if the token is valid", function (done) {
		if (ENV === "node") {
			glb.Asteroid.__set__("nodeTemporaryStorage", {
				"http://example.com__0__login_token__": "token"
			});
		} else {
			localStorage["http://example.com__0__login_token__"] = "token";
		}	
		var ceres = new Asteroid("example.com");
		ceres.ddp.emitConnected();
		ceres.resumeLoginPromise
			.then(function (id) {
				if (ENV === "browser") {
					localStorage.clear();
				} else {
					glb.Asteroid.__set__("nodeTemporaryStorage", {});
				}
				id.should.equal("userId");
				done();
			})
			.fail(function (e) {
				done(e);
			});
		setTimeout(function () {
			ceres.ddp.logInClient(null, {id: "userId"});
		}, 20);	
	});

});
