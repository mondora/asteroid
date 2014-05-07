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
			col.update("someId", {_id: "someId", prop: "someProp"});
			col._set._items.someId.should.eql({_id: "someId", prop: "someProp"});
		});

		it("should throw an error if we try to update an unexisting item", function () {
			var troublemaker = function () {
				col.update("someId", {_id: "someId", prop: "someProp"});
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
			var newItem = {_id: "someId", prop: "someProp"};
			col.update("someId", newItem);
			var sel = {
				_id: "someId"
			};
			var mod = {
				$set: newItem
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
