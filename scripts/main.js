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
	'discovery',
	'rtc',
	'enums'
], function($, ChatModule, ControlModule, discovery, rtc, enums) {
	// DOM objects
	var chatContainer = $('#chat-container');
	var textInput = $('#text-input');
	var shareInput = $('#share');

	// chat module
	var chat = new ChatModule(chatContainer, textInput, discovery.user());
	var chatChannel = null;

	// control module
	var control = null;

	// datachannels
	var channels = {};
	var channelList = enums.channels.list;


	// page events
	$(document).on('userMessage', function(e, message) {
		if (chatChannel) {
			var jsonMsg = {user: discovery.user(), msg: message};
			chatChannel.send(JSON.stringify(jsonMsg));
		}
	});

	$(document).on('offer', function(e, id) {
		shareInput.val(window.location + '#' + id);
	});

	// Connection init
	if (discovery.isServer()) {
		channels = rtc.openServerChannels(channelList);
	} else {
		channels = rtc.openClientChannels(channelList);
	}

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
		control.ping().done(function(ping) {console.log('aahahahah : ' + ping)});
	});
});