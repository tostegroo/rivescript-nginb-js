var promise 		= require('bluebird');
var request 		= require('request');
var path 				= require('path');
var fs 					= require("fs")

var botconfig   	= require('../config/botconfig');
var messagesutil 	= require('../utils/messagesutil');
var debugutil 		= require('../utils/debugutil');

var pagectl				= false;
var attachmentctl	= false;

module.exports = function(pagectl, attachmentctl, menuctl)
{
	return new Slackctl(pagectl, attachmentctl, menuctl);
}

/**
 * @constructs Slack_Controller
 * @public
 * @param {Page_Controller} page_controller - A NGINB page controller
 * @param {Attachment_Controller} attachment_controller - A NGINB attachment controller
 * @param {Menu_Controller} menu_controller - A NGINB menu controller
 */
function Slackctl(page_controller, attachment_controller)
{
	pagectl = page_controller || require('./page')();
	attachmentctl = attachment_controller || require('./attachment')();
}

Slackctl.prototype.requestUserData = function requestUserData(app, sender, callback_data)
{
	return new promise(function(resolve)
	{
		request(
		{
			url: botconfig.slack.url + "/users.info",
			qs:
			{
				token: app.token,
				user: app.user
			},
			method: 'POST'
		}, function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Error sending message');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

/**
 * Sends a slack message
 * @param {Object} app - An app config object
 * @param {String} sender - The facebook sender id
 * @param {Object} message_data - A facebook message formated data
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Slackctl.prototype.sendMessage = function sendMessage(app, sender, message_data, callback_data)
{
	return new promise(function(resolve)
	{
		var endpoint = message_data.endpoint;
		var post_type = message_data.post_type;

		delete(message_data.endpoint);
		delete(message_data.post_type);

		message_data.token = app.token;

		if(post_type=='formdata')
		{
			request.post({
				url: botconfig.slack.url + endpoint,
				formData: message_data,
			}, function (error, response)
			{
				var message = messagesutil.getMessage(error, response, response.body, 'Error sending message');
				message.callback_data = callback_data;
				resolve(message);
			});
		}
		else
		{
			request(
			{
				url: botconfig.slack.url + endpoint,
				qs: message_data,
				method: 'POST'
			}, function (error, response, body)
			{
				var message = messagesutil.getMessage(error, response, body, 'Error sending message');
				message.callback_data = callback_data;
				resolve(message);
			});
		}
	});
}

/**
 * Sends a slack action
 * @param {Object} app - An app config object
 * @param {String} sender - The facebook sender id
 * @param {Object} action - A facebook action (mark_seen|typing_on|typing_off)
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Slackctl.prototype.sendAction = function sendAction(app, sender, action, callback_data)
{
	return new promise(function(resolve)
	{
		request(
		{
			url: botconfig.slack.url + "/chat.postMessage",
			qs:
			{
				token: app.token,
				type: 'typing',
				channel: sender
			},
			method: 'POST'
		}, function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Error sending message');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

/**
 * Formats a bot message to a slack message
 * @param {Object} message - A message object returned by bot controller
 * @param {String} lang - The language of the template to be passed to menu configuration
 * @param {Object} data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook message object
 */
Slackctl.prototype.getMessage = function getMessage(app, sender, message, lang, data)
{
	data = data || false;
	return new promise(function(resolve)
	{
		var slack_message = {};

		if(!debugutil.attachment_debug && message.hasOwnProperty('attachment_data') && message.text=='attachment')
		{
			var attachement = message.attachment_data;

			if(typeof attachement === 'string')
				attachement = attachmentctl.getAttachment(attachement, '');

			var basePath = path.resolve(__dirname).split('/node_modules')[0];
			var file = fs.createReadStream(basePath + botconfig.assets_folder + attachement.url);
			file.on('error', function(err)
			{
				console.log(err);
			});

			slack_message =
			{
				post_type: 'formdata',
				endpoint: '/files.upload',
        filetype: 'auto',
        channels: sender,
        file: file
			}
		}
		else
		{
			slack_message =
			{
				post_type: 'qs',
				endpoint: '/chat.postMessage',
				channel: sender,
				as_user: true,
				text: message.text,
				pretty: 1
			}
		}

		console.log(data);

		resolve(slack_message);
	});
}

/**
 * Takes a slack message and transform into a NGINB event formated
 * @param {Object} data - A facebook messenger data object
 * @return {Event} A bluebird promise NGINB event object
 */
Slackctl.prototype.messengerEvent = function messengerEvent(data)
{
	return new promise(function(resolve)
	{
		if(data.type!=undefined && data.type=='website')
		{
			var response_event =
			{
				page: false,
				sender: data.sender,
				type: 'message',
				text: data.text,
				id: '',
				data: {},
				lang: false
			}

			resolve(response_event);
		}
		else
		{
			var message_data = {
				token: data.token,
				api_app_id: data.api_app_id,
				team_id: data.team_id,
				event_id: data.event_id,
				type: data.type
			}

			//console.log('inputdata', data);

			if (data.event)
			{
				var sender = data.event.channel;
				var type = data.event.type;
				var text = data.event.text;
				var user = data.event.user;
				var lang = 'en';
				var id = '';

				if(data.event.bot_id==undefined && user!=undefined)
				{
					pagectl.getSlackPageInfo(message_data.token, message_data)
					.then(function(response)
					{
						if(response && response.page)
						{
							response.page.user = user;
							response.page.authed_users = data.authed_users;

							var response_event =
							{
								page: response.page,
								sender: sender,
								type: type,
								text: text,
								id: id,
								data: {user: user},
								lang: lang
							}

							resolve(response_event);
						}
						else
							resolve(false);
					});
				}
				else
					resolve(false);
			}
			else
				resolve(false);
		}
	});
}
