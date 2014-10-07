var ENV = typeof window === "undefined" ? "node" : "browser";
if (ENV === "node") {
	global.glb = global;
	global.should = require("should");
	global._ = require("lodash");
	global.Q = require("q");
	global.sinon = require("sinon");
	global.rewire = require("rewire");
	global.Asteroid = rewire("./dist/asteroid.node.js");
} else {
	window.glb = window;
}

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

describe("Asteroid._Collection", function () {

	var col, ast;
	beforeEach(function () {
		ast = {};
		ast.ddp = {
			method: sinon.spy()
		};
		col = new Asteroid._Collection("col", ast);
	});



	////////////
	// Insert //
	////////////

	describe("calling the insert method", function () {

		it("should add an item to the internal database", function () {
			col.insert({_id: "someId"});
			col._set._items.someId.should.eql({_id: "someId"});
		});

		it("should throw an error if an item by that id already exists", function () {
			col.insert({_id: "someId"});
			col._set._items.someId.should.eql({_id: "someId"});
			var troublemaker = function () {
				col.insert({_id: "someId"});
			};
			troublemaker.should.throw("Item someId already exists");
		});

		it("should send an insert request to the ddp server", function () {
			col.insert({_id: "someId"});
			var call = ast.ddp.method.getCall(0);
			call.args[0].should.equal("/col/insert");
			call.args[1].should.eql([{_id: "someId"}]);
		});

		it("should return an object with two promises: local and remote", function () {
			var ret = col.insert({});
			Q.isPromise(ret.local).should.equal(true);
			Q.isPromise(ret.remote).should.equal(true);
		});

		it("the local promise should be resolved with the id of the added item", function (done) {
			var ret = col.insert({_id: "someId"});
			ret.local.isPending().should.equal(false);
			ret.local.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});
		});

		it("the remote promise should be rejected if the server answers with an error", function (done) {
			var error = {};
			ast.ddp.method = function () {
				arguments[2](error);
			};
			var ret = col.insert({_id: "someId"});
			ret.remote.fail(function (err) {
				if (err !== error) {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("the remote promise should be resolved otherwise", function (done) {
			ast.ddp.method = function () {
				arguments[2]();
			};
			var ret = col.insert({_id: "someId"});
			ret.remote.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("should not send an insert request if the local insert fails", function () {
			col.insert({_id: "someId"});
			var troublemaker = function () {
				col.insert({_id: "someId"});
			};
			ast.ddp.method = sinon.spy();
			troublemaker.should.throw("Item someId already exists");
			ast.ddp.method.callCount.should.equal(0);
		});

		it("should restore the database if the request fails", function () {
			ast.ddp.method = function () {
				arguments[2](true);
			};
			col.insert({_id: "someId"});
			_.isUndefined(col._set._items.someId).should.equal(true);
		});

	});

	describe("inserting from remote", function () {

		it("should add an item to the internal database", function () {
			col._remoteToLocalInsert({_id: "someId"});
			col._set._items.someId.should.eql({_id: "someId"});
		});

	});



	////////////
	// Remove //
	////////////

	describe("calling the remove method", function () {

		it("should remove the item by the given id from the internal database", function () {
			col.insert({_id: "someId"});
			col._set._items.someId.should.eql({_id: "someId"});
			col.remove("someId");
			_.isUndefined(col._set._items.someId).should.equal(true);
		});

		it("should not throw an error if we try to delete an unexisting item", function () {
			var preppie = function () {
				col.remove("someId");
			};
			preppie.should.not.throw();
		});

		it("should send a remove request to the ddp server", function () {
			col.remove("someId");
			var call = ast.ddp.method.getCall(0);
			call.args[0].should.equal("/col/remove");
			call.args[1].should.eql([{_id: "someId"}]);
		});

		it("should return an object with two promises: local and remote", function () {
			var ret = col.remove("someId");
			Q.isPromise(ret.local).should.equal(true);
			Q.isPromise(ret.remote).should.equal(true);
		});

		it("the local promise should be resolved with the id of the removed item", function (done) {
			var ret = col.remove("someId");
			ret.local.isPending().should.equal(false);
			ret.local.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});
		});

		it("the remote promise should be rejected if the server answers with an error", function (done) {
			var error = {};
			ast.ddp.method = function () {
				arguments[2](error);
			};
			var ret = col.remove("someId");
			ret.remote.fail(function (err) {
				if (err !== error) {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("the remote promise should be resolved otherwise", function (done) {
			ast.ddp.method = function () {
				arguments[2]();
			};
			var ret = col.remove("someId");
			ret.remote.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("should restore the database if the request fails", function () {
			col.insert({_id: "someId"});
			ast.ddp.method = function () {
				arguments[2](true);
			};
			col.remove("someId");
			col._set._items.someId.should.eql({_id: "someId"});
		});

	});

	describe("removing from remote", function () {

		it("should remove the item from the internal database", function () {
			col.insert({_id: "someId"});
			col._remoteToLocalRemove("someId");
			_.isUndefined(col._set._items.someId).should.equal(true);
		});

	});



	////////////
	// Update //
	////////////

	describe("calling the update method", function () {

		it("should update the item by the given id", function () {
			col.insert({_id: "someId"});
			col._set._items.someId.should.eql({_id: "someId"});
			col.update("someId", {prop1: "someProp1", prop2: "someProp2"});
			col._set._items.someId.should.eql({_id: "someId", prop1: "someProp1", prop2: "someProp2"});
		});

		it("should throw an error if we try to update an unexisting item", function () {
			var troublemaker = function () {
				col.update("someId", {prop: "someProp"});
			};
			troublemaker.should.throw("Item someId doesn't exist");
		});

		it("should throw an error if we try to modify the _id", function () {
			col.insert({_id: "someId"});
			var troublemaker = function () {
				col.update("someId", {_id: "someOtherId", prop: "someProp"});
			};
			troublemaker.should.throw("Modifying the _id of a document is not allowed");
		});

		it("should send an update request to the ddp server", function () {
			col.insert({_id: "someId"});
			var fields = {prop: "someProp"};
			col.update("someId", fields);
			var sel = {
				_id: "someId"
			};
			var mod = {
				$set: fields
			};
			var call = ast.ddp.method.getCall(1);
			call.args[0].should.equal("/col/update");
			call.args[1].should.eql([sel, mod]);
		});

		it("should not send an update request if the local update fails", function () {
			col.insert({_id: "someId"});
			var troublemaker = function () {
				col.update("someId", {_id: "someOtherId", prop: "someProp"});
			};
			ast.ddp.method = sinon.spy();
			troublemaker.should.throw("Modifying the _id of a document is not allowed");
			ast.ddp.method.callCount.should.equal(0);
		});

		it("should return an object with two promises: local and remote", function () {
			col.insert({_id: "someId"});
			var ret = col.update("someId", {});
			Q.isPromise(ret.local).should.equal(true);
			Q.isPromise(ret.remote).should.equal(true);
		});

		it("the local promise should be resolved with the id of the removed item", function (done) {
			col.insert({_id: "someId"});
			var ret = col.update("someId", {});
			ret.local.isPending().should.equal(false);
			ret.local.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});
		});

		it("the remote promise should be rejected if the server answers with an error", function (done) {
			col.insert({_id: "someId"});
			var error = {};
			ast.ddp.method = function () {
				arguments[2](error);
			};
			var ret = col.update("someId", {});
			ret.remote.fail(function (err) {
				if (err !== error) {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("the remote promise should be resolved otherwise", function (done) {
			col.insert({_id: "someId"});
			ast.ddp.method = function () {
				arguments[2]();
			};
			var ret = col.update("someId", {});
			ret.remote.then(function (id) {
				if (id !== "someId") {
					done(new Error());
				} else {
					done();
				}
			});	
		});

		it("should restore the database if the request fails", function () {
			col.insert({_id: "someId"});
			ast.ddp.method = function () {
				arguments[2](true);
			};
			col.update("someId", {_id: "someId", prop: "someProp"});
			col._set._items.someId.should.eql({_id: "someId"});
		});

	});

	describe("updating from remote", function () {

		it("should update the item", function () {
			col.insert({_id: "someId"});
			col._remoteToLocalUpdate("someId", {prop: "someProp"});
			col._set._items.someId.should.eql({_id: "someId", prop: "someProp"});
		});

		it("should warn if the item doesn't exist", function () {
			sinon.stub(console, "warn");
			col._remoteToLocalUpdate("someId", {prop: "someProp"});
			var arg = console.warn.getCall(0).args[0];
			arg.should.equal("Server misbehaviour: item someId doesn't exist");
			console.warn.restore();
		});

		it("should warn if trying to modify the _id", function () {
			sinon.stub(console, "warn");
			col.insert({_id: "someId"});
			col._remoteToLocalUpdate("someId", {_id: "someOtherId", prop: "someProp"});
			var arg = console.warn.getCall(0).args[0];
			arg.should.equal("Server misbehaviour: modifying the _id of a document is not allowed");
			console.warn.restore();
		});

	});

});

describe("A reactive query", function () {

	it("should return a subset of the collection containing only the filtered values", function () {
		var ast = {};
		ast.ddp = {};
		ast.ddp.method = function () {
			arguments[2]();
		};
		var col = new Asteroid._Collection("col", ast);
		var repeat = function (n, f) {
			for (var i=0; i<n; i++) f();
		};


		// Increase the stress level to test more values
		// 1e2 takes ~ 30ms
		// 1e3 takes ~ 300ms
		// 1e4 takes ~ 3s
		// 1e5 takes ~ 30s
		// ...
		var stressLevel = 1e1;


		// Picheghel dent
		
		var rnd = [];



		// First batch
		rnd[0] = Math.round(Math.random() * stressLevel);
		repeat(rnd[0], function () {
			col.insert({
				prop: "A"
			});
		});

		rnd[1] = Math.round(Math.random() * stressLevel);
		repeat(rnd[1], function () {
			col.insert({
				prop: "B"
			});
		});

		rnd[2] = Math.round(Math.random() * stressLevel);
		repeat(rnd[2], function () {
			col.insert({
				prop: "C"
			});
		});



		// Second batch
		rnd[3] = Math.round(Math.random() * stressLevel);
		repeat(rnd[3], function () {
			col.insert({
				prop1: "C",
				prop2: "A"
			});
		});

		rnd[4] = Math.round(Math.random() * stressLevel);
		repeat(rnd[4], function () {
			col.insert({
				prop1: "B",
				prop2: "B"
			});
		});

		rnd[5] = Math.round(Math.random() * stressLevel);
		repeat(rnd[5], function () {
			col.insert({
				prop1: "A",
				prop2: "C"
			});
		});



		// Third bathc
		rnd[6] = Math.round(Math.random() * stressLevel);
		repeat(rnd[6], function () {
			col.insert({
				prop1: "A",
				cprop2: {
					sp1: "A",
					sp2: "A"
				}
			});
		});

		rnd[7] = Math.round(Math.random() * stressLevel);
		repeat(rnd[7], function () {
			col.insert({
				prop1: "B",
				cprop2: {
					sp1: "A",
					sp2: "B"
				}
			});
		});

		rnd[8] = Math.round(Math.random() * stressLevel);
		repeat(rnd[8], function () {
			col.insert({
				prop1: "C",
				cprop2: {
					sp1: "A",
					sp2: "C"
				}
			});
		});



		// Tirel fò

		var sss = [];


		// First batch
		sss[0] = col.reactiveQuery({
			prop: "A"
		});
		sss[0].result.length.should.equal(rnd[0]);

		sss[1] = col.reactiveQuery({
			prop: "B"
		});
		sss[1].result.length.should.equal(rnd[1]);

		sss[2] = col.reactiveQuery({
			prop: "C"
		});
		sss[2].result.length.should.equal(rnd[2]);



		// Second batch
		sss[3] = col.reactiveQuery({
			prop2: "A"
		});
		sss[3].result.length.should.equal(rnd[3]);

		sss[4] = col.reactiveQuery({
			prop2: "B"
		});
		sss[4].result.length.should.equal(rnd[4]);

		sss[5] = col.reactiveQuery({
			prop2: "C"
		});
		sss[5].result.length.should.equal(rnd[5]);



		// Third batch
		sss[6] = col.reactiveQuery({
			"cprop2.sp2": "A"
		});
		sss[6].result.length.should.equal(rnd[6]);

		sss[7] = col.reactiveQuery({
			"cprop2.sp2": "B"
		});
		sss[7].result.length.should.equal(rnd[7]);

		sss[8] = col.reactiveQuery({
			"cprop2.sp2": "C"
		});
		sss[8].result.length.should.equal(rnd[8]);



		// Fourth batch
		sss[10] = col.reactiveQuery({
			"prop1": "A"
		});
		sss[10].result.length.should.equal(rnd[6] + rnd[5]);

		sss[11] = col.reactiveQuery({
			"prop1": "B"
		});
		sss[11].result.length.should.equal(rnd[7] + rnd[4]);

		sss[12] = col.reactiveQuery({
			"prop1": "C"
		});
		sss[12].result.length.should.equal(rnd[8] + rnd[3]);



	});

});

if (ENV === "node") {

	describe("The getFilterFromSelector function should return a function which filters objetcs", function () {
		var getFilterFromSelector = Asteroid.utils.getFilterFromSelector;
		var item0 = {
			_id: "postOne",
			title: "TitleOne",
			subtitle: "SubtitleOne",
			author: {
				name: {
					first: "Paolo",
					last: "Scanferla"
				},
				screenName: "pscanf"
			},
			permissions: {
				published: true
			}
		};
		var item1 = {
			_id: "postTwo",
			title: "TitleTwo",
			subtitle: "SubtitleTwo",
			author: {
				name: {
					first: "Paolino",
					last: "Paperino"
				},
				screenName: "pp313"
			},
			permissions: {
				published: false
			}
		};
		var item2 = {
			_id: "postThree",
			title: "TitleThree",
			subtitle: "SubtitleThree",
			author: {
				name: {
					first: "Paperon",
					last: "de' Papaeroni"
				},
				screenName: "$pdp"
			},
			permissions: {
				published: true
			}
		};

		it("with a basic selector", function () {
			var basicSelector = {
				_id: "postOne"
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(false);
		});

		it("with a deep selector", function () {
			var basicSelector = {
				"permissions.published": true
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with an $and selector", function () {
			var basicSelector = {
				$and: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with an $or selector", function () {
			var basicSelector = {
				$or: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with a $nor selector", function () {
			var basicSelector = {
				$nor: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(true);
			filter(item2).should.equal(false);
		});

		it("with nested $and selectors", function () {
			var basicSelector = {
				$and: [
					{
						$and: [
							{
								title: "TitleOne"
							},
							{
								subtitle: "SubtitleOne"
							}
						]
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(false);
		});

		it("with nested $and and $or selectors", function () {
			var basicSelector = {
				$and: [
					{
						$or: [
							{
								title: "TitleOne"
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with supernested $or selectors", function () {
			var basicSelector = {
				$or: [
					{
						$or: [
							{
								$or: [
									{
										title: "TitleOne"
									},
									{
										subtitle: "SubtitleTwo"
									}
								]
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": "hello"
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(true);
			filter(item2).should.equal(true);
		});

		it("with supernested $or and $and selectors", function () {
			var basicSelector = {
				$or: [
					{
						$or: [
							{
								$and: [
									{
										title: "TitleOne"
									},
									{
										subtitle: "SubtitleTwo"
									}
								]
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": false
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(true);
			filter(item2).should.equal(true);
		});

	});

}

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

describe("An Asteroid.Set instance", function () {

	describe("should have the following methods:", function () {

		var set = new Asteroid.Set();

		it("put", function () {
			_.isFunction(set.put).should.equal(true);
		});

		it("del", function () {
			_.isFunction(set.del).should.equal(true);
		});

		it("get", function () {
			_.isFunction(set.get).should.equal(true);
		});

		it("contains", function () {
			_.isFunction(set.contains).should.equal(true);
		});

		it("filter", function () {
			_.isFunction(set.filter).should.equal(true);
		});

		it("toArray", function () {
			_.isFunction(set.toArray).should.equal(true);
		});

		it("toHash", function () {
			_.isFunction(set.toHash).should.equal(true);
		});

	});

	it("if readonly, should throw when put and del are called", function () {

		var set = new Asteroid.Set(true);

		var put = function () {
			set.put();
		};
		var del = function () {
			set.del();
		};
		put.should.throw("Attempt to modify readonly set");
		del.should.throw("Attempt to modify readonly set");

	});

});

describe("The put method", function () {

	var set = new Asteroid.Set();
	var id = "someRandomId";
	var item = {};

	it("should put a clone of the element", function () {
		set.put(id, item);
		set._items[id].should.eql(item);
		set._items[id].should.not.equal(item);
	});

	it("should fire the put event", function () {
		set._emit = sinon.spy();
		set.put(id, item);
		set._emit.calledWith("put", id).should.equal(true);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.put({}, {});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should throw if the second argument is not an object", function () {
		var troublemaker = function () {
			set.put("", "");
		};
		troublemaker.should.throw("Assertion failed: expected Object, instead got String");
	});

	it("should return the set instance", function () {
		var s = set.put(id, item);
		s.should.equal(set);
	});

});

describe("The del method", function () {

	var set;
	var id = "someRandomId";
	var item = {};

	beforeEach(function () {
		set = new Asteroid.Set();
		set.put(id, item);
	});

	it("should delove the element from the hash", function () {
		set._items[id].should.eql(item);
		set.del(id);
		_.isUndefined(set._items[id]).should.equal(true);
	});

	it("should fire the del event", function () {
		set._emit = sinon.spy();
		set.del(id);
		set._emit.calledWith("del", id).should.equal(true);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.del({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should return the set instance", function () {
		var s = set.del(id);
		s.should.equal(set);
	});

});

describe("The get method", function () {

	var id = "someRandomId";
	var item = {};
	var set = new Asteroid.Set();
	set.put(id, item);

	it("should get a clone of the element", function () {
		var itm = set.get(id);
		itm.should.not.equal(item);
		itm.should.eql(item);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.get({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

});

describe("The contains method", function () {

	var id = "someRandomId";
	var item = {};
	var set = new Asteroid.Set();
	set.put(id, item);

	it("should return true if and only if the set contains the item", function () {
		set.contains(id).should.equal(true);
		set.contains("anotherRandomId").should.equal(false);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.contains({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

});

describe("The filter method", function () {

	var set;
	beforeEach(function () {
		var id;
		set = new Asteroid.Set();
		for (var i=0; i<100; i++) {
			id = ("000" + i).slice(-4);
			set.put(id, {_id: id});
		}
	});

	it("should return a subset filtered by the passed function", function () {
		var odds = [];
		var id;
		for (var i=0; i<100; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		var ss = set.filter(function (id, item) {
			return parseInt(id) % 2;
		});
		(ss instanceof Asteroid.Set).should.equal(true);

		var sortFn = function (a, b) {
			var ai = parseInt(a._id);
			var bi = parseInt(b._id);
			return ai > bi;
		};

		var found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (var j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}
	});

	it("should return a reactive subset", function () {

		var ss = set.filter(function (id, item) {
			return parseInt(id) % 2;
		});

		var odds, id, found, i, j;
	  	var sortFn = function (a, b) {
			var ai = parseInt(a._id);
			var bi = parseInt(b._id);
			return ai > bi;
		}; 

		set.put("0100", {_id: "0100"});
		set.put("0101", {_id: "0101"});

		odds = [];
		for (i=0; i<102; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}

		set.del("0100");
		set.del("0101");

		odds = [];
		for (i=0; i<100; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}

	});

});

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
