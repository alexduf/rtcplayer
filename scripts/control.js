define(['jquery'],function($) {

	var Ping = function(control) {
		var currentPing = null;
		var currentPingId = -1;

		control.register('ping', this, function(message) {
			control.send('pong', message);
		});

		control.register('pong', this, function(message) {
			if (currentPing && currentPing.state() == "pending" && currentPingId === message.id) {
				currentPing.resolve(Date.now() - message.start);
			}
		});
		return {
			ping: function() {
				if (currentPing && currentPing.state() == "pending") {
					currentPing.reject();
					currentPingId = -1;
				}
				currentPing = new $.Deferred();
				currentPingId = Math.floor(Math.random() * 1000);
				control.send('ping', {id: currentPingId, start: Date.now()});
				return currentPing;
			}
		}
	};

	var Control = function(dataChannel) {

		var handlers = {};

		dataChannel.onmessage = function(msg) {
			var message = JSON.parse(msg.data);
			if (handlers[message.msgType]) {
				handlers[message.msgType](message.payload);
			}
		}

		var pingHandler = null;

		return {
			register: function(msgType, listener, fct) {
				handlers[msgType] = fct;
			},
			unregister: function(msgType) {
				delete handlers[msgType];
			},
			send: function(msgType, payload) {
				var message = {msgType: msgType, payload: payload};
				dataChannel.send(JSON.stringify(message));
			},
			ping: function() {
				if (pingHandler === null) {
					pingHandler = new Ping(this);
				}
				return pingHandler.ping();
			}
		};
	}
	return Control;
});