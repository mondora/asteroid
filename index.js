var ddpOptions1 = {
	endpoint: "ws://localhost:3000/websocket",
	SocketConstructor: WebSocket
};

var ddpOptions2 = {
	endpoint: "ws://localhost:4000/websocket",
	SocketConstructor: WebSocket
};

var Rocket1 = new Asteroid();
var Rocket2 = new Asteroid();

var Items = new Collection("items", Rocket, DB);
var Users = new Collection("users", Rocket, DB);

Rocket1.init(ddpOptions);
