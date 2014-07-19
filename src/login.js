// @if ENV=='browser'
Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var loginConfigCollection = this.collections[loginConfigCollectionName];
	var service = loginConfigCollection.reactiveQuery({service: serviceName}).result[0];
	return service.clientId || service.consumerKey || service.appId;
};

Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
	// Open the oauth oauth
	var popup = window.open(loginUrl, "_blank", "location=no,toolbar=no");	
	if (popup.focus) popup.focus();
	var self = this;
	return Q()
		.then(function () {
			var deferred = Q.defer();
			if (window.cordova) {
				// We're using Cordova's InAppBrowser plugin.
				// Each time the popup fires the loadstop event,
				// check if the hash fragment contains the
				// credentialSecret we need to complete the
				// authentication flow
				popup.addEventListener("loadstop", function (e) { 
					// If the url does not contain the # character
					// it means the loadstop event refers to an
					// intermediate page, therefore we ignore it
					if (e.url.indexOf("#") === -1) {
						return;
					}
					// Find the position of the # character
					var hashPosition = e.url.indexOf("#");
					// Get the key=value fragments in the hash
					var hashes = e.url.slice(hashPosition + 1).split("&");
					// Once again, check that the fragment belongs to the
					// final oauth page (the one we're looking for)
					if (
						!hashes[0] ||
						hashes[0].split("=")[0] !== "credentialToken" ||
						!hashes[1] ||
						hashes[1].split("=")[0] !== "credentialSecret"
					) {
						return;
					}
					// Retrieve the two tokens
					var hashCredentialToken = hashes[0].split("=")[1];
					var hashCredentialSecret = hashes[1].split("=")[1];
					// Check if the credentialToken corresponds. We could
					// use this as a way to communicate possible errors by
					// purposefully mismatching the credentialToken with
					// the error message. Too much of a hack?
					if (hashCredentialToken === credentialToken) {
						// Resolve the promise with the secret
						deferred.resolve(hashCredentialSecret);
						// Close the popup
						popup.close();
					}
				});
			} else {
				var request = JSON.stringify({
					credentialToken: credentialToken
				});
				var intervalId = setInterval(function () {
					popup.postMessage(request, self._host);
				}, 100);
				window.addEventListener("message", function (e) {
					var message;
					try {
						message = JSON.parse(e.data);
					} catch (err) {
						return;
					}
					if (e.origin === self._host) {
						if (message.credentialToken === credentialToken) {
							clearInterval(intervalId);
							deferred.resolve(message.credentialSecret);
						}
						if (message.error) {
							clearInterval(intervalId);
							deferred.reject(message.error);
						}
					}
				});
			}
			return deferred.promise;
		})
		.then(function (credentialSecret) {
			var deferred = Q.defer();
			var loginParameters = {
				oauth: {
					credentialToken: credentialToken,
					credentialSecret: credentialSecret
				}
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
					deferred.reject(err);
					self._emit("loginError", err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
					self._emit("login", res.id);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype.loginWithFacebook = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("facebook"),
		redirect_uri:	this._host + "/_oauth/facebook?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://www.facebook.com/dialog/oauth?" + formQs(query);
	return this._initOauthLogin("facebook", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGoogle = function (scope) {
	var credentialToken = guid();
	var query = {
		response_type:	"code",
		client_id:		this._getOauthClientId("google"),
		redirect_uri:	this._host + "/_oauth/google?close",
		state:			credentialToken,
		scope:			scope || "openid email"
	};
	var loginUrl = "https://accounts.google.com/o/oauth2/auth?" + formQs(query);
	return this._initOauthLogin("google", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGithub = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("github"),
		redirect_uri:	this._host + "/_oauth/github?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://github.com/login/oauth/authorize?" + formQs(query);
	return this._initOauthLogin("github", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithTwitter = function (scope) {
	var credentialToken = guid();
	var callbackUrl = this._host + "/_oauth/twitter?close&state=" + credentialToken;
	var query = {
		requestTokenAndRedirect:	encodeURIComponent(callbackUrl),
		state:						credentialToken
	};
	var loginUrl = this._host + "/_oauth/twitter/?" + formQs(query);
	return this._initOauthLogin("twitter", credentialToken, loginUrl);
};

// @endif

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	return Q()
		.then(function () {
			return localStorageMulti.get(self._host + "__" + self._instanceId + "__login_token__");
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
					localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
					self._emit("loginError", err);
					deferred.reject(err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
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
	var options = {
		username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
		email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined,
		password: password,
		profile: profile
	};
	self.ddp.method("createUser", [options], function (err, res) {
		if (err) {
			self._emit("createUserError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("createUser", res.id);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.loginWithPassword = function (usernameOrEmail, password) {
	var self = this;
	var deferred = Q.defer();
	var loginParameters = {
		password: password,
		user: {
			username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined
		}
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.logout = function () {
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("logout", [], function (err, res) {
		if (err) {
			self._emit("logoutError", err);
			deferred.reject(err);
		} else {
			delete self.userId;
			delete self.loggedIn;
			localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
			self._emit("logout");
			deferred.resolve();
		}
	});
	return deferred.promise;
};
