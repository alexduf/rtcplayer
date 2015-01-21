require.config({
    baseUrl: 'scripts',
    paths: {
        jquery: 'jquery-2.1.1.min'
    }
});

require([
	'jquery',
	'chat',
	'control',
	'syncPlayer',
	'discovery',
	'rtc',
	'async',
	'enums'
], function($, ChatModule, ControlModule, SyncPlayer, discovery, rtc, async, enums) {
	// DOM objects
	var chatPanel = $('#chat');
	var chatContainer = $('#chat-container');
	var textInput = $('#chat-input');
	var shareInput = $('#share');
	var header = $('#header');
	var playButton = $('#play');
	var videoPlayer = $('#videoPlayer')[0];

	// chat module
	var chat = new ChatModule(chatContainer, textInput, discovery.user());
	var chatChannel = null;

	// control module
	var control = null;

	// datachannels
	var channels = {};
	var channelList = enums.channels.list;

	var syncPlayer = null;

	// page events
	$(document).on('userMessage', function(e, message) {
		if (chatChannel) {
			var jsonMsg = {user: discovery.user(), msg: message};
			chatChannel.send(JSON.stringify(jsonMsg));
		}
	});

	$(document).on('roomId', function(e, id) {
		header.slideDown();
		shareInput.val(window.location + '#' + id);
		shareInput.focus().select();
	});

	$(videoPlayer).on('click', function() {
		syncPlayer.play();
	});

	// Connection init
	if (discovery.isServer()) {
		channels = rtc.openServerChannels(channelList);
	} else {
		channels = rtc.openClientChannels(channelList);
	}

	var channelPromises = channelList.map(function(channelName) {
		return channels[channelName];
	});

	// channels init
	channels[enums.channels.chat].done(function (dc) {
		dc.onmessage = function(message) {
			var jsonMsg = JSON.parse(message.data);
			chat.renderChatMessage(jsonMsg.user, jsonMsg.msg);
		}
		chatChannel = dc;
	});

	channels[enums.channels.control].done(function(dc) {
		control = new ControlModule(dc);
		console.log(dc.readyState);
	});

	// Channels are ready, let's init the app !
	async.all(channelPromises).done(function() {
		
		// check the ping every minute
		setInterval(function() {
			control.ping().done(function(ping) {chat.log('Latency : ' + ping + ' ms')});
		}, 60000);

		syncPlayer = new SyncPlayer(control, videoPlayer);
		header.slideUp();
		chatPanel.show().addClass('ready');
		$('#ynhportal').remove();
		$('#ynhoverlay').remove();
	})
	
	$('#ynhportal').remove();
	$('#ynhoverlay').remove();
});