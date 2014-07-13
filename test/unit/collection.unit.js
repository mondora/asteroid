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
