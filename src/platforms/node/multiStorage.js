var nodeTemporaryStorage = {};

Asteroid.utils.multiStorage.get = function (key) {
	var deferred = Q.defer();
	deferred.resolve(nodeTemporaryStorage[key]);
	return deferred.promise;
};

Asteroid.utils.multiStorage.set = function (key, value) {
	var deferred = Q.defer();
	nodeTemporaryStorage[key] = value;
	deferred.resolve();
	return deferred.promise;
};

Asteroid.utils.multiStorage.del = function (key) {
	var deferred = Q.defer();
	delete nodeTemporaryStorage[key];
	deferred.resolve();
	return deferred.promise;
};
