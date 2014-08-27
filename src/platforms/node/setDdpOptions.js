Asteroid.prototype._setDdpOptions = function (host, ssl, socketInterceptFunction) {
	this._ddpOptions = {
		endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
		SocketConstructor: WebSocket.Client,
		socketInterceptFunction: socketInterceptFunction
	};
};
