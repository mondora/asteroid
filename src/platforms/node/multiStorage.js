var nodeTemporaryStorage = {};

multiStorage.get = function (key) {
	var deferred = Q.defer();
	deferred.resolve(nodeTemporaryStorage[key]);
	return deferred.promise;
};

multiStorage.set = function (key, value) {
	var deferred = Q.defer();
	nodeTemporaryStorage[key] = value;
	deferred.resolve();
	return deferred.promise;
};

multiStorage.del = function (key) {
	var deferred = Q.defer();
	delete nodeTemporaryStorage[key];
	deferred.resolve();
	return deferred.promise;
};
