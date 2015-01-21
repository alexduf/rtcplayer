define(['jquery'], function($) {
	var Chat = function(container, textInput, localUser) {


		var renderChatMessage = function renderChatMessage(user, message) {
			var div = $('<div>').text('[' + user + ']: ' + message);
			div.appendTo(container);
			setTimeout(function() {
				div.addClass('old');
			}, 4000);
			container.scrollTop(container.prop("scrollHeight") - container.height());
		};

		var logMessage = function logMessage(message) {
			var div = $('<div class="log">').text(message);
			div.appendTo(container);
			setTimeout(function() {
				div.addClass('old');
			}, 4000);
			container.scrollTop(container.prop("scrollHeight") - container.height());
		};

		textInput.on('keydown', function(e) {
			if (e.keyCode === 13) {
				var message = textInput.val();
				textInput.val('');
				renderChatMessage(localUser, message);
				$(document).trigger('userMessage', message);
			}
		});

		return {
			renderChatMessage: renderChatMessage,
			log: logMessage
		}
	};
	return Chat;
});