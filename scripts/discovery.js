define(['./cookies', 'jquery'], function(cookies, $) {

	var url = 'discovery.php';

	return {
		user: function user() {
			return cookies.read("SSOwAuthUser");
		},
		offerId: function offerId() {
			var hash = window.location.hash;
			if (hash) {
				return hash.substr(1);
			} else {
				return Math.floor(Math.random() * 1000);
			}
		},
		isServer: function isServer() {
			return !window.location.hash || window.location.hash.length <= 1;
		},
		offer: function offer(offerId, offerMsg) {
			var data = {
				messageType: "offer",
				offerId: offerId,
				offer: JSON.stringify({
					from: this.user(),
					msg: offerMsg
				})
			};
			return $.post(url, data);
		},
		getOffer: function getOffer(offerId) {
			return $.getJSON(url, {offerId: offerId, messageType:"offer"});
		},
		answer: function answer(answerId, answerMsg) {
			var data = {
				messageType: "answer",
				answerId: answerId,
				answer: JSON.stringify({
					from: this.user(),
					msg: answerMsg
				})
			};
			return $.post(url, data);
		},
		getAnswer: function getAnswer(answerId) {
			return $.getJSON(url, {answerId: answerId, messageType:"answer"});
		},
		iceServer: function iceServer(iceServerId, iceServerMsg) {
			var data = {
				messageType: "iceServer",
				iceServerId: iceServerId,
				iceServer: JSON.stringify({
					from: this.user(),
					msg: iceServerMsg
				})
			};
			return $.post(url, data);
		},
		getIceServer: function getIceServer(iceServerId) {
			return $.getJSON(url, {iceServerId: iceServerId, messageType:"iceServer"});
		},
		iceClient: function iceClient(iceClientId, iceClientMsg) {
			var data = {
				messageType: "iceClient",
				iceClientId: iceClientId,
				iceClient: JSON.stringify({
					from: this.user(),
					msg: iceClientMsg
				})
			};
			return $.post(url, data);
		},
		getIceClient: function getIceClient(iceClientId) {
			return $.getJSON(url, {iceClientId: iceClientId, messageType:"iceClient"});
		}
	};
});