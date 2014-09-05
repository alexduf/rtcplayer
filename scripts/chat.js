define(['jquery'], function($) {
	var Chat = function(container, textInput, localUser) {


		var renderChatMessage = function renderChatMessage(user, message) {
			var div = $('<div>').text('[' + user + ']: ' + message);
			div.appendTo(container);
		}

		textInput.on('keydown', function(e) {
			if (e.keyCode === 13) {
				var message = textInput.val();
				textInput.val('');
				renderChatMessage(localUser, message);
				$(document).trigger('userMessage', message);
			}
		});

		return {
			renderChatMessage: renderChatMessage
		}
	};
	return Chat;
});