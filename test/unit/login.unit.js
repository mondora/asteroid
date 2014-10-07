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



describe("The createUser method", function () {

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
				if (n === "createUser") {
					ddp.createUser = f;
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

	it("should return a promise", function () {
		var ceres = new Asteroid("example.com");
		Q.isPromise(ceres.createUser()).should.equal(true);
	});

	describe("if not successful", function () {

		it("should reject the returned promise with the error message given by the ddp method call", function (done) {
			var ceres = new Asteroid("example.com");
			var promise = ceres.createUser();
			promise.fail(function (e) {
				e.should.equal("errorMessage");
				done();
			});
			ceres.ddp.createUser("errorMessage");
		});

		it("should emit the createUserError event", function () {
			var ceres = new Asteroid("example.com");
			ceres.createUser();
			var spy = sinon.spy();
			ceres.on("createUserError", spy);
			ceres.ddp.createUser("errorMessage");
			spy.calledWith("errorMessage").should.equal(true);
		});

	});

	describe("if successful", function () {

		it("should resolve the returned promise with id of the created user", function (done) {
			var ceres = new Asteroid("example.com");
			var promise = ceres.createUser();
			promise.then(function (id) {
				id.should.equal("userId");
				done();
			});
			ceres.ddp.createUser(null, {
				id: "userId"
			});
		});

		it("should emit the createUser event", function () {
			var ceres = new Asteroid("example.com");
			ceres.createUser();
			var spy = sinon.spy();
			ceres.on("createUser", spy);
			ceres.ddp.createUser(null, {
				id: "userId"
			});
			spy.calledWith("userId").should.equal(true);
		});

		it("should emit the login event", function () {
			var ceres = new Asteroid("example.com");
			ceres.createUser();
			var spy = sinon.spy();
			ceres.on("login", spy);
			ceres.ddp.createUser(null, {
				id: "userId"
			});
			spy.calledWith("userId").should.equal(true);
		});

		it("should save the login token", function () {
			if (ENV === "browser") {
				localStorage.clear();
			} else {
				glb.Asteroid.__set__("nodeTemporaryStorage", {});
			}
			var ceres = new Asteroid("example.com");
			ceres.createUser();
			ceres.ddp.createUser(null, {
				id: "userId",
				token: "loginToken"
			});
			if (ENV === "browser") {
				localStorage[ceres._host + "__" + ceres._instanceId + "__login_token__"].should.equal("loginToken");
			} else {
				glb.Asteroid.__get__("nodeTemporaryStorage")[ceres._host + "__" + ceres._instanceId + "__login_token__"].should.equal("loginToken");
			}
		});

		it("should set the userId and loggedIn properties of the Asteroid instance", function () {
			var ceres = new Asteroid("example.com");
			ceres.createUser();
			ceres.ddp.createUser(null, {
				id: "userId"
			});
			ceres.userId.should.equal("userId");
			ceres.loggedIn.should.equal(true);
		});

	});

	it("if passed an object as first argument, should pass it directly as a parameter for the ddp createUser method", function () {
		var ceres = new Asteroid("example.com");
		ceres.ddp.method = sinon.spy();
		var obj = {};
		ceres.createUser(obj);
		ceres.ddp.method.getCall(0).args[1][0].should.equal(obj);
	});

	it("should pass an object as argument to the ddp createUser method built according to the parameters used", function () {
		var ceres = new Asteroid("example.com");
		ceres.ddp.method = sinon.spy();
		var profile = {};

		ceres.createUser("usr", "pwd", profile);
		var options_0 = ceres.ddp.method.getCall(0).args[1][0];
		options_0.username.should.equal("usr");
		options_0.password.should.equal("pwd");
		options_0.profile.should.equal(profile);

		ceres.createUser("usr@usr.com", "pwd", profile);
		var options_1 = ceres.ddp.method.getCall(1).args[1][0];
		options_1.email.should.equal("usr@usr.com");
		options_1.password.should.equal("pwd");
		options_1.profile.should.equal(profile);
	});

});
