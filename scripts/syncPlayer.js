define([], function() {
	var SyncPlayer = function(controlChannel, videoElement) {
		
		var delayOrder = function delayOrder(order, fct, params) {
			return controlChannel.ping().done(function(latency) {
				controlChannel.send(order, params);
				setTimeout(fct, Math.round(latency / 2), params);
			});
		};
		controlChannel.register('play', function() {
			videoElement.play();
		});
		controlChannel.register('pause', function() {
			videoElement.pause();
		});

		return {
			play: function() {
				delayOrder('play', function() {
					videoElement.play();
				}, {});
			},
			pause: function() {
				delayOrder('pause', function() {
					videoElement.pause();
				}, {});
			}
		};
	};
	return SyncPlayer;
});