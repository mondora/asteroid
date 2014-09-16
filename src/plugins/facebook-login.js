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

	var getFacebookOauthOptions = function (scope) {
		var credentialToken = Asteroid.utils.guid();
		var query = {
			client_id:		this._getOauthClientId("facebook"),
			redirect_uri:	this._host + "/_oauth/facebook",
			state:			Asteroid.utils.getOauthState(credentialToken),
			scope:			scope || "email"
		};
		var loginUrl = "https://www.facebook.com/dialog/oauth?" + Asteroid.utils.formQs(query);
		return {
			credentialToken: credentialToken,
			loginUrl: loginUrl
		};
	};

	Asteroid.prototype.loginWithFacebook = function (scope) {
		var options = getFacebookOauthOptions.call(this, scope);
		return this._openOauthPopup(
			options.credentialToken,
			options.loginUrl,
			this._loginAfterCredentialSecretReceived
		);
	};

	Asteroid.prototype.connectWithFacebook = function (scope) {
		var options = getFacebookOauthOptions.call(this, scope);
		return this._openOauthPopup(
			options.credentialToken,
			options.loginUrl,
			this._connectAfterCredentialSecretReceived
		);
	};

}));
