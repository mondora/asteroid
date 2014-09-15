Asteroid.prototype._initOauthLogin = function (credentialToken, loginUrl, afterCredentialSecretReceived) {
	var deferred = Q.defer();
	deferred.reject("Oauth login not supported in node");
	return deferred.promise;
};
