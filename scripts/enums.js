define(function() {
	return {
		channels: {
			list: ['chat', 'control'],
			chat: 'chat',
			control: 'control'
		},
		rtcConfiguration: {
			//"iceServers": [{ "url": "stun:stun.services.mozilla.com" }]
			iceServers: [{"url": "stun:stun.l.google.com:19302"}]
		}
	};
});