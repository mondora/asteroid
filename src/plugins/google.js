(function (root, extend) {
    if (typeof define === "function" && define.amd) {
		// XXX figure out how to do it
    } else if (typeof exports === "object") {
		extend(require("asteroid"));
    } else {
        extend(root.Asteroid);
    }
}(this, function (Asteroid) {

	"use strict";

	var getGoogleOauthOptions = function (scope) {
		var credentialToken = Asteroid.utils.guid();
		var query = {
			response_type:	"code",
			client_id:		this._getOauthClientId("google"),
			redirect_uri:	this._host + "/_oauth/google?close",
			state:			credentialToken,
			scope:			scope || "openid email"
		};
		var loginUrl = "https://accounts.google.com/o/oauth2/auth?" + Asteroid.utils.formQs(query);
		return this._initOauthLogin("google", credentialToken, loginUrl);
	};

	Asteroid.prototype.loginWithGoogle = function (scope) {
		var options = getGoogleOauthOptions.call(this, scope);
		return this._openOauthPopup(
			"twitter",
			options.credentialToken,
			options.loginUrl,
			this._loginAfterCredentialSecretReceived
		);
	};

	Asteroid.prototype.connectWithGoogle = function (scope) {
		var options = getGoogleOauthOptions.call(this, scope);
		return this._openOauthPopup(
			"twitter",
			options.credentialToken,
			options.loginUrl,
			this._connectAfterCredentialSecretReceived
		);
	};

}));
