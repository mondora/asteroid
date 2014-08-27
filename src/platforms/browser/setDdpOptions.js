Asteroid.prototype._setDdpOptions = function (host, ssl, socketInterceptFunction) {
	// If SockJS is available, use it, otherwise, use WebSocket
	// Note: SockJS is required for IE9 support
	if (typeof SockJS === "function") {
		this._ddpOptions = {
			endpoint: (ssl ? "https://" : "http://") + host + "/sockjs",
			SocketConstructor: SockJS,
			socketInterceptFunction: socketInterceptFunction
		};
	} else {
		this._ddpOptions = {
			endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
			SocketConstructor: WebSocket,
			socketInterceptFunction: socketInterceptFunction
		};
	}
};
