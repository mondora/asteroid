if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.getFilterFromSelector = function (selector) {

	// Get the value of the object from a compund key
	// (e.g. "profile.name.first")
	var getItemVal = function (item, key) {
		return key.split(".").reduce(function (prev, curr) {
			if (!prev) {
				return prev;
			}
			prev = prev[curr];
			return prev;
		}, item);
	};

	var keys = Object.keys(selector);

	var filters = keys.map(function (key) {

		var subFilters;
		if (key === "$and") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (!acc) {
						return acc;
					}
					return subFilter(item);
				}, true);
			};
		}

		if (key === "$or") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (acc) {
						return acc;
					}
					return subFilter(item);
				}, false);
			};
		}

		if (key === "$nor") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (!acc) {
						return acc;
					}
					return !subFilter(item);
				}, true);
			};
		}

		return function (item) {
			var itemVal = getItemVal(item, key);
			return itemVal === selector[key];
		};


	});

	// Return the filter function
	return function (item) {

		// Filter out backups
		if (item._id && is_backup(item._id)) {
			return false;
		}

		return filters.reduce(function (acc, filter) {
			if (!acc) {
				return acc;
			}
			return filter(item);
		}, true);

	};
};
