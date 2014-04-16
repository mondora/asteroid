var options = {
	host: "http://localhost:3000"
};
options.ddpOptions = {
	endpoint: "ws://localhost:3000/websocket",
	SocketConstructor: WebSocket,
	debug: true
};
var Rocket = new Asteroid(options);
Rocket.on("connected", function () {
	console.log("Connected!");
});

window.onload = function () {
	document.getElementById("fb").addEventListener("click", function () {
		Rocket.loginWithFacebook()
			.then(function (id) {
				console.log(id);
			})
			.fail(function (id) {
				console.log(id);
			});
	}, false);
	document.getElementById("tw").addEventListener("click", function () {
		Rocket.loginWithTwitter().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gl").addEventListener("click", function () {
		Rocket.loginWithGoogle().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gh").addEventListener("click", function () {
		Rocket.loginWithGithub().then(function (id) {
			console.log(id);
		});
	}, false);
};
