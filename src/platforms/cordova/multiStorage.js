multiStorage.get = function (key) {
	var deferred = Q.defer();
	deferred.resolve(localStorage[key]);
	return deferred.promise;
};

multiStorage.set = function (key, value) {
	var deferred = Q.defer();
	localStorage[key] = value;
	deferred.resolve();
	return deferred.promise;
};

multiStorage.del = function (key) {
	var deferred = Q.defer();
	delete localStorage[key];
	deferred.resolve();
	return deferred.promise;
};
