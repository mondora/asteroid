var Set = function (readonly) {
	// Allow readonly sets
	if (readonly) {
		// Make the add and rem methods private
		this._add = this.add;
		this._rem = this.rem;
		// Replace them with a throwy function
		this.add = this.rem = function () {
			throw new Error("Attempt to modify readonly set");
		};
	}
	this._items = {};
};
// Inherit from EventEmitter
Set.prototype = Object.create(EventEmitter.prototype);
Set.constructor = Set;

Set.prototype.add = function (id, item) {
	// Save a clone to avoid collateral damage
	this._items[id] = clone(item);
	this._emit("add", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.rem = function (id) {
	delete this._items[id];
	this._emit("rem", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.get = function (id) {
	// Return a clone to avoid collateral damage
	return clone(this._items[id]);
};

Set.prototype.filter = function (belongFn) {

	// Creates the subset
	var sub = new Set(true);

	// Keep a reference to the _items hash
	var items = this._items;

	// Performs the initial adds
	var ids = Object.keys(items);
	ids.forEach(function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = clone(items[id]);
		var belongs = belongFn(id, itemClone);
		if (belongs) {
			sub._items[id] = items[id];
		}
	});

	// Listens to the add and rem events
	// to automatically update the subset
	this.on("add", function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = clone(items[id]);
		var belongs = belongFn(id, itemClone);
		if (belongs) {
			sub._add(id, items[id]);
		}
	});
	this.on("rem", function (id) {
		sub._rem(id);
	});

	// Returns the subset
	return sub;
};

Set.prototype.toArray = function () {
	var array = [];
	var items = this._items;
	var ids = Object.keys(this._items);
	ids.forEach(function (id) {
		array.push(items[id]);
	});
	// Return a clone to avoid collateral damage
	return clone(array);
};

Set.prototype.toHash = function () {
	// Return a clone to avoid collateral damage
	return clone(this._items);
};

Asteroid.Set = Set;
