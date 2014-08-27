Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
	var deferred = Q.defer();
	deferred.reject("Oauth login not supported in node");
	return deferred.promise;
};
