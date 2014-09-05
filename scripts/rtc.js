define(['./discovery', 'jquery'], function(discovery, $) {
	var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCSessionDescription = window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

	var openServerChannels = function openServerChannels(channels) {
		// open the connection
		var pc = new RTCPeerConnection();

		// initialize the promises
		var promises = {};
		channels.forEach(function(channelName) {
			var dc = pc.createDataChannel(channelName);
			promises[channelName] = new $.Deferred();
			dc.onopen = function(e) {
				promises[channelName].resolve(dc);
			};
			//hack to force the onopen event to be triggered
			var itv = window.setInterval(function() {
				if (dc.readyState == "open") {
					console.log(dc.readyState);
					window.clearInterval(itv);
				}
			}, 500);
		});

		// if something fails, reject all the promises
		var rejectAll = function() {
			channels.forEach(function(channelName) {
				promises[channelName].reject();
			}); 
		};

		// how to send the offer to the clien
		var sendOffer = function(offer) {
			var id = discovery.offerId(); // generate an id
			discovery.offer(id, offer).fail(rejectAll); // send the offer to the server (no need to  wait for completion)
	    	pc.setLocalDescription(offer); // set the local description
			console.log(offer); // log it
			// the offer is ready (or soon to be), this event will inform listener of the room id
			$(document).trigger('offer', id);

			// waiting for an answer
			discovery.getAnswer(id).done(function(serverAnswer) {
				var answer = new RTCSessionDescription(serverAnswer.msg);
				pc.setRemoteDescription(answer);
				console.log('okay !');
			}).fail(rejectAll);
		};

		// initiate the offer
		pc.createOffer(sendOffer, rejectAll, {});
		return promises;
	};

	var openClientChannels = function openClientChannels(channels) {
		// open the connection
		var pc = new RTCPeerConnection();
		// grab the id
		var id = discovery.offerId();
		// get the offer promise. Will be resolved as soon as data is received from server
		var offer = discovery.getOffer(id);
		// generate the promises
		var promises = {};
		channels.forEach(function(channelName) {
			promises[channelName] = new $.Deferred();
		});

		// if error, reject all promises
		var rejectAll = function() {
			channels.forEach(function(channelName) {
				promises[channelName].reject();
			});
		};

		// when one datachannel is opened
		pc.ondatachannel = function(channelEvent) {
			var dc = channelEvent.channel;
			dc.onopen = function() {
				if (promises[dc.label]) {
					console.log('dc opened ' + dc.label);
					// resolve the promess with the datachannel
					promises[dc.label].resolve(dc);
				}
			}
		}

		// when the offer is received
		offer.done(function(serverOffer) {
			var offer = new RTCSessionDescription(serverOffer.msg);
			pc.setRemoteDescription(offer);

			// when the answer is generated, send it to the server
			var sendAnswer = function(answer) {
				discovery.answer(id, answer).fail(rejectAll);
				pc.setLocalDescription(answer);
				console.log(answer);
			}
			// initiate an answer
			pc.createAnswer(sendAnswer, rejectAll, {});
		});

		return promises;
	};
	
	//var pc = new RTCPeerConnection();
	return {
		RTCPeerConnection : RTCPeerConnection,
		RTCSessionDescription : RTCSessionDescription,
		openServerChannels: function (channels) {
			return openServerChannels(channels);
		},
		openClientChannels: function (channels) {
			return openClientChannels(channels);
		}
	};
});