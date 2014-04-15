var options = {
	host: "http://localhost:3000"
};
options.ddpOptions = {
	endpoint: "ws://localhost:3000/websocket",
	SocketConstructor: WebSocket,
	debug: true
};
var Rocket1 = new Asteroid(options);

window.onload = function () {
	document.getElementById("fb").addEventListener("click", function () {
		Rocket1.loginWithFacebook()
			.then(function (id) {
				console.log(id);
			})
			.fail(function (id) {
				console.log(id);
			});
	}, false);
	document.getElementById("tw").addEventListener("click", function () {
		Rocket1.loginWithTwitter().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gl").addEventListener("click", function () {
		Rocket1.loginWithGoogle().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gh").addEventListener("click", function () {
		Rocket1.loginWithGithub().then(function (id) {
			console.log(id);
		});
	}, false);
};
