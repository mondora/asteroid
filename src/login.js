// @if ENV=='browser'
Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var loginConfigCollection = this.collections[loginConfigCollectionName];
	var service = loginConfigCollection.reactiveQuery({service: serviceName}).result[0];
	return service.clientId || service.consumerKey || service.appId;
};

Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
        var popup = window.open(loginUrl, '_blank', 'location=no,toolbar=no');	
        var self = this;
        var isCordovaApp = !!window.cordova;
        var popupclosed = false;
	
        if(isCordovaApp){
		$(popup).on('loaderror', function(e) {
		    setTimeout(function() {
                        popup.close();
                    }, 100);
                });

                $(popup).on('exit', function(e) { 
                    popupclosed = true;
                });
        }

	return Q()
		.then(function () {
			var deferred = Q.defer();
			if (popup.focus) popup.focus();
			var intervalId = setInterval(function () {
				if (
					( !isCordovaApp && (popup.closed || popup.closed === undefined) ) ||
					( isCordovaApp && popupclosed )
				) 
				{
					clearInterval(intervalId);
					deferred.resolve();
				}
			}, 100);
			return deferred.promise;
		})
		.then(function () {
			var deferred = Q.defer();
			var loginParameters = {
				oauth: {
					credentialToken: credentialToken
				}
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					delete localStorage[self._host + "__login_token__"];
					deferred.reject(err);
					self._emit("loginError", err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorage[self._host + "__login_token__"] = res.token;
					self._emit("login", res.id);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	var deferred = Q.defer();
	var token = localStorage[self._host + "__login_token__"];
	if (!token) {
		deferred.reject("No login token");
		return deferred.promise;
	}
	var loginParameters = {
		resume: token
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			delete localStorage[self._host + "__login_token__"];
			self._emit("loginError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorage[self._host + "__login_token__"] = res.token;
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
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
			localStorage[self._host + "__login_token__"] = res.token;
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
			delete localStorage[self._host + "__login_token__"];
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorage[self._host + "__login_token__"] = res.token;
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
			delete localStorage[self._host + "__login_token__"];
			self._emit("logout");
			deferred.resolve();
		}
	});
	return deferred.promise;
};
