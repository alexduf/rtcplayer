define(['./discovery', 'jquery', 'enums'], function(discovery, $, enums) {
	var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

	var openServerChannels = function openServerChannels(channels) {

		// open the connection
		var pc = new RTCPeerConnection(enums.rtcConfiguration, {});
		var id = discovery.offerId(); // generate an id

		$(document).trigger('roomId', id);

		// initialize the promises
		var promises = {};
		channels.forEach(function(channelName) {
			promises[channelName] = new $.Deferred();
		});

		// if something fails, reject all the promises
		var rejectAll = function(error) {
			channels.forEach(function(channelName) {
				promises[channelName].reject(error);
			}); 
		};

		channels.forEach(function(channelName) {
			var dc = pc.createDataChannel(channelName);
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

		// how to send the offer to the client
		var sendOffer = function(offer) {
			discovery.offer(id, offer).fail(rejectAll); // send the offer to the server (no need to  wait for completion)
	    	pc.setLocalDescription(offer); // set the local description
			console.log(offer); // log it

			// waiting for an answer
			discovery.getAnswer(id).done(function(serverAnswer) {
				console.log('answer received');
				var answer = new RTCSessionDescription(serverAnswer.msg);
				pc.setRemoteDescription(answer);
				console.log('okay ! lets start');
			}).fail(rejectAll);
		};

		// initiate the offer
		pc.createOffer(sendOffer, rejectAll, {});
		return promises;
	};

	var openClientChannels = function openClientChannels(channels) {

		// open the connection
		var pc = new RTCPeerConnection(enums.rtcConfiguration, {});
		var id = discovery.offerId(); // generate an id

		// generate the promises
		var promises = {};
		channels.forEach(function(channelName) {
			promises[channelName] = new $.Deferred();
		});

		// if error, reject all promises
		var rejectAll = function(error) {
			console.error(error);
			channels.forEach(function(channelName) {
				promises[channelName].reject(error);
			});
		};

		// get the offer promise. Will be resolved as soon as data is received from server
		var offerPromise = discovery.getOffer(id);


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
		offerPromise.done(function(serverOffer) {
			console.log('offer received');
			var offer = new RTCSessionDescription(serverOffer.msg);
			pc.setRemoteDescription(offer);

			// when the answer is generated, send it to the server
			var sendAnswer = function(answer) {
				console.log('sending answer');
				discovery.answer(id, answer).fail(rejectAll);
				pc.setLocalDescription(answer);
				console.log(answer);
			}
			
			// initiate an answer
			pc.createAnswer(sendAnswer, rejectAll, {});
			
		});

		return promises;
	};
	
	return {
		openServerChannels: function (channels) {
			return openServerChannels(channels);
		},
		openClientChannels: function (channels) {
			return openClientChannels(channels);
		}
	};
});