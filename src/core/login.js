Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var loginConfigCollection = this.collections[loginConfigCollectionName];
	var service = loginConfigCollection.reactiveQuery({service: serviceName}).result[0];
	return service.clientId || service.consumerKey || service.appId;
};

Asteroid.prototype._loginAfterCredentialSecretReceived = function (credentials) {
	var self = this;
	var deferred = Q.defer();
	var loginParameters = {
		oauth: credentials
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype._connectAfterCredentialSecretReceived = function (credentials) {
	var deferred = Q.defer();
	var loginParameters = {
		oauth: credentials
	};
	this.ddp.method("addLoginService", [loginParameters], function (err, res) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve();
		}
	});
	return deferred.promise;
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	return Q()
		.then(function () {
			return Asteroid.utils.multiStorage.get(self._host + "__" + self._instanceId + "__login_token__");
		})
		.then(function (token) {
			if (!token) {
				throw new Error("No login token");
			}
			return token;
		})
		.then(function (token) {
			var deferred = Q.defer();
			var loginParameters = {
				resume: token
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
					self._emit("loginError", err);
					deferred.reject(err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
					self._emit("login", res.id);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype.createUser = function (usernameOrEmail, password, profile) {
	var self = this;
	var deferred = Q.defer();
	var options;
	if (typeof usernameOrEmail === "string") {
		options = {
			username: Asteroid.utils.isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: Asteroid.utils.isEmail(usernameOrEmail) ? usernameOrEmail : undefined,
			password: password,
			profile: profile
		};
	} else if (typeof usernameOrEmail === "object") {
		options = usernameOrEmail;
	}
	self.ddp.method("createUser", [options], function (err, res) {
		if (err) {
			self._emit("createUserError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("createUser", res.id);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.loginWithPassword = function (usernameOrEmail, password) {
	var self = this;
	var loginParameters = {
		password: password,
		user: {
			username: Asteroid.utils.isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: Asteroid.utils.isEmail(usernameOrEmail) ? usernameOrEmail : undefined
		}
	};
	return self.login(loginParameters);
};

Asteroid.prototype.login = function (loginParameters) {
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.logout = function () {
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("logout", [], function (err) {
		if (err) {
			self._emit("logoutError", err);
			deferred.reject(err);
		} else {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			self._emit("logout");
			deferred.resolve();
		}
	});
	return deferred.promise;
};
