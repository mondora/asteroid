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

	var getGithubOauthOptions = function (scope) {
		var credentialToken = Asteroid.utils.guid();
		var query = {
			client_id:		this._getOauthClientId("github"),
			redirect_uri:	this._host + "/_oauth/github",
			state:			Asteroid.utils.getOauthState(credentialToken),
			scope:			scope || "email"
		};
		var loginUrl = "https://github.com/login/oauth/authorize?" + Asteroid.utils.formQs(query);
		return {
			credentialToken: credentialToken,
			loginUrl: loginUrl
		};
	};

	Asteroid.prototype.loginWithGithub = function (scope) {
		var options = getGithubOauthOptions.call(this, scope);
		return this._openOauthPopup(
			options.credentialToken,
			options.loginUrl,
			this._loginAfterCredentialSecretReceived
		);
	};

	Asteroid.prototype.connectWithGithub = function (scope) {
		var options = getGithubOauthOptions.call(this, scope);
		return this._openOauthPopup(
			options.credentialToken,
			options.loginUrl,
			this._connectAfterCredentialSecretReceived
		);
	};

}));
