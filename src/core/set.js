var Set = function (readonly) {
	// Allow readonly sets
	if (readonly) {
		// Make the put and del methods private
		this._put = this.put;
		this._del = this.del;
		// Replace them with a throwy function
		this.put = this.del = function () {
			throw new Error("Attempt to modify readonly set");
		};
	}
	this._items = {};
};
// Inherit from EventEmitter
Set.prototype = Object.create(Asteroid.utils.EventEmitter.prototype);
Set.constructor = Set;

Set.prototype.put = function (id, item) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	Asteroid.utils.must.beObject(item);
	// Save a clone to avoid collateral damage
	this._items[id] = Asteroid.utils.clone(item);
	this._emit("put", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.del = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	delete this._items[id];
	this._emit("del", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.get = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	// Return a clone to avoid collateral damage
	return Asteroid.utils.clone(this._items[id]);
};

Set.prototype.contains = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	return !!this._items[id];
};

Set.prototype.filter = function (belongFn) {

	// Creates the subset
	var sub = new Set(true);

	// Keep a reference to the _items hash
	var items = this._items;

	// Performs the initial puts
	var ids = Object.keys(items);
	ids.forEach(function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = Asteroid.utils.clone(items[id]);
		var belongs = belongFn(itemClone);
		if (belongs) {
			sub._items[id] = items[id];
		}
	});

	// Listens to the put and del events
	// to automatically update the subset
	this.on("put", function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = Asteroid.utils.clone(items[id]);
		var belongs = belongFn(itemClone);
		if (belongs) {
			sub._put(id, items[id]);
		}
	});
	this.on("del", function (id) {
		sub._del(id);
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
	return Asteroid.utils.clone(array);
};

Set.prototype.toHash = function () {
	// Return a clone to avoid collateral damage
	return Asteroid.utils.clone(this._items);
};

Asteroid.Set = Set;
