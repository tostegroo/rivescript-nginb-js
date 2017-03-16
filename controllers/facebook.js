var promise 		= require('bluebird');
var request 		= require('request');
var JSONbig 		= require('json-bigint');

var botconfig   	= require('../config/botconfig');

var fbmessageutil 	= require('../utils/fbmessageutil');
var messagesutil 	= require('../utils/messagesutil');
var debugutil 		= require('../utils/debugutil');

var pagectl			= false;
var menuctl			= false;
var attachmentctl	= false;

exports = module.exports = function(pagectl, attachmentctl, menuctl)
{
	return new Facebookctl(pagectl, attachmentctl, menuctl);
}

function Facebookctl(page_controller, attachment_controller, menu_controller)
{
	pagectl = page_controller || require('./page')();
	attachmentctl = attachment_controller || require('./attachment')();
	menuctl = menu_controller || require('./menu')();
}


Facebookctl.prototype.setGreetingText = function setGreetingText(page, text)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var json = {
			setting_type: 'greeting',
			greeting: {text: text}
		}

		self.setThreadSettings(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

Facebookctl.prototype.setStartButton = function setStartButton(page, payload)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var json = {
			setting_type: 'call_to_actions',
			thread_state: 'new_thread',
			call_to_actions: [{"payload": payload}]
		}

		self.setThreadSettings(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

Facebookctl.prototype.setPersistentMenu = function setPersistentMenu(page, menu)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(menu.type!=undefined && menu.type=='fixed')
		{
			var menu_data = (menu.data!=undefined && menu.data.length!=undefined && menu.data.length>0) ? menu.data[0] : {};
			var menu_buttons = (menu_data.hasOwnProperty('buttons') && menu_data.buttons.length>0) ? menu_data.buttons : [{"type":"postback", "title":"OK", "payload":"ok"}];
			var buttons = menuctl.getFacebookButtons(menu_buttons);

			var json = {
				setting_type: 'call_to_actions',
				thread_state: 'existing_thread',
				call_to_actions: buttons
			}

			self.setThreadSettings(page, json)
			.then(function(result)
			{
				resolve(result);
			});
		}
		else
		{
			resolve(false);
		}
	});
}

//action: add or remove
Facebookctl.prototype.domainWhitelisting = function domainWhitelisting(page, domainArray, action)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(action!=undefined && (action=='add' || action=='remove'))
		{
			var json = {
				setting_type: 'domain_whitelisting',
				whitelisted_domains: domainArray,
				domain_action_type: action
			}

			self.setThreadSettings(page, json)
			.then(function(result)
			{
				resolve(result);
			});
		}
		else
		{
			resolve(false);
		}
	});
}

Facebookctl.prototype.paymentPrivacy = function paymentPrivacy(page, url)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var json = {
			setting_type: 'payment',
			payment_privacy_url: url
		}

		self.setThreadSettings(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

Facebookctl.prototype.setThreadSettings = function setThreadSettings(page, json)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		request(
		{
			method: 'POST',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/thread_settings?access_token=" + page.token,
			json: json
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			resolve(message);
		});
	});
}

Facebookctl.prototype.doSubscribeRequest = function doSubscribeRequest(page)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		request(
		{
			method: 'POST',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/subscribed_apps?access_token=" + page.token
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Do Subscribe Error');
			resolve(message);
		});
	});
}

Facebookctl.prototype.facebookLogin = function functionName(req, res, redirect_url, scope)
{
	var self = this;
	var facebookUrl = "https://www.facebook.com";

	if (req.device.type!='desktop')
		facebookUrl = "https://m.facebook.com";

	var url = facebookUrl+'/'+botconfig.facebook.version+'/dialog/oauth?';
	var params = 'client_id='+botconfig.facebook.login_app_id+'&redirect_uri='+encodeURIComponent(redirect_url)+'&scope='+scope;

	res.redirect(url+params);
}

Facebookctl.prototype.getFacebookToken = function getFacebookToken(code, redirect_url, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var params = 'client_id='+botconfig.facebook.login_app_id+'&redirect_uri='+encodeURIComponent(redirect_url)+'&client_secret='+botconfig.facebook.login_app_secret+'&code='+code;
		request(
		{
			method: 'GET',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/oauth/access_token?"+params
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Get Token Error');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

Facebookctl.prototype.getFacebookUserDataByCode = function requestUserData(code, redirect_url, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		self.getFacebookToken(code, redirect_url, callback_data)
		.then(function(token_response)
		{
			var data = token_response.data.body;

			if(typeof(data)=='string')
				data = JSONbig.parse(data);

			self.getFacebookUserData(data.access_token, token_response.callback_data)
			.then(function(fb_response)
			{
				var fb_data = fb_response.data.body;

				if(typeof(fb_data)=='string')
					fb_data = JSONbig.parse(fb_data);

				var picture = botconfig.facebook.graph_url + "/" + fb_data.id + "/picture?type=large";
				fb_data.profile_pic = picture;
				fb_data.facebook_id = fb_data.id;
				fb_data.sender_id = fb_response.callback_data.pid;
				fb_data.page_id = fb_response.callback_data.page_id;

				delete fb_data.id;
				delete fb_data.name;

				resolve({data:fb_data, callback_data:callback_data, access_token:data.access_token});
			});
		});
	});
}

Facebookctl.prototype.getFacebookUserData = function requestUserData(access_token, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var fields = 'name,first_name,last_name,locale,gender,email,timezone';

		request(
		{
			method: 'GET',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me?fields=" + fields + "&access_token=" + access_token
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

Facebookctl.prototype.requestUserData = function requestUserData(page, sender_id, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var fields = 'first_name,last_name,profile_pic,locale,timezone,gender';

		request(
		{
			method: 'GET',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/"+sender_id+"?fields="+fields+"&access_token=" + page.token
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

Facebookctl.prototype.sendMessage = function sendMessage(page, sender, message_data, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		request(
		{
			url: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/messages",
			qs: {access_token: page.token},
			method: 'POST',
			json:
			{
				recipient: {id: sender},
				message: message_data
			}
		}, function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Error sending message');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

Facebookctl.prototype.sendAction = function sendAction(page, sender, action, callback_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		request(
		{
			url: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/messages",
			qs: {access_token: page.token},
			method: 'POST',
			json: {
				recipient: {id: sender},
				sender_action: action
			}
		}, function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Error sending action');
			message.callback_data = callback_data;
			resolve(message);
		});
	});
}

Facebookctl.prototype.getFacebookTemplate = function getFacebookTemplate(sender, page_id, message, lang, data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var facebook_message = false;
		var menu_params = false;
		var params = (message.button_params) ? message.button_params : [];

		if(message.template)
		{
			if(typeof(message.template)=='string' || (typeof(message.template)=='object' && message.template.length==undefined))
				menu_params = message.template;

			if(menu_params)
			{
				menuctl.getMenu(menu_params, lang)
				.then(function(menu)
				{
					facebook_message = menuctl.getFacebookMenu(menu, sender, page_id, data, params);
					resolve(facebook_message);
				});
			}
			else if(message.template.length!=undefined)
			{
				var elements = [];
				for (var i = 0; i < message.template.length; i++)
				{
					var element = message.template[i];
					var buttons = [];

					if(element.hasOwnProperty('buttons'))
						buttons = menuctl.getFacebookButtons(element.buttons, sender, page_id, data, params);

					element.buttons = buttons;
					elements.push(element);
				}

				facebook_message = fbmessageutil.genericTemplate(elements);
				resolve(facebook_message);
			}
			else
				resolve(false);
		}
		else
			resolve(false);
	});
}

Facebookctl.prototype.getFacebookMessage = function getFacebookMessage(sender, page_id, message, lang, data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		var facebook_message = {text: ''};
		var menu_params = false;

		if(message.quickreply)
		{
			var rpl_items = message.quickreply;
			var msg = {text: ''};
			var params = (message.quickreply_params) ? message.quickreply_params : [];
			var menu = false;

			if(typeof(message.quickreply)=='string' || (typeof(message.quickreply)=='object' && message.quickreply.length==undefined))
				menu_params = message.quickreply;

			menuctl.getMenu(menu_params, lang)
			.then(function(menu)
			{
				if(menu)
				{
					if(menu.data[0].hasOwnProperty('quick_replies'))
						rpl_items = menu.data[0].quick_replies;
					else
						rpl_items = [];

					msg = menu.data[0].hasOwnProperty('text') ? {text: menu.data[0].text} : msg;
				}

				rpl_items = menuctl.getFacebookButtons(rpl_items, sender, page_id, data, params);

				if(message.text!=undefined && message.text!='')
					msg = {text: message.text};

				var items = fbmessageutil.quickReplyItems(rpl_items);
				facebook_message = fbmessageutil.quickReply(msg, items);

				resolve(facebook_message);
			});
		}
		else if(message.button)
		{
			var bt_items = message.button;
			var msg = '';
			var params = (message.button_params) ? message.button_params : [];
			var menu = false;

			if(typeof(message.button)=='string' || (typeof(message.button)=='object' && message.button.length==undefined))
				menu_params = message.button;

			menuctl.getMenu(menu_params, lang)
			.then(function(menu)
			{
				if(menu)
				{
					if(menu.data[0].hasOwnProperty('buttons'))
						bt_items = menu.data[0].buttons;
					else
						bt_items = [];

					msg = menu.data[0].hasOwnProperty('title') ? menu.data[0].title : msg;
				}

				if(message.text!=undefined && message.text!='')
					msg = message.text;

				var buttons = menuctl.getFacebookButtons(bt_items, sender, page_id, data, params);
				facebook_message = fbmessageutil.messageButtons(msg, buttons);

				resolve(facebook_message);
			});
		}
		else if(message.text!=undefined)
		{
			if(!debugutil.attachment_debug && message.hasOwnProperty('attachment_data') && message.text=='attachment')
			{
				var attachement = message.attachment_data;

				if(typeof(attachement)=='string')
					attachement = attachmentctl.getAttachment(attachement);

				facebook_message = fbmessageutil.attachment(attachement.type, attachmentctl.getAttachmentUrl(attachement.url));
			}
			else
				facebook_message.text = message.text;

			resolve(facebook_message);
		}
	});
}

Facebookctl.prototype.messengerEvent = function messengerEvent(data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(data.type!=undefined && data.type=='website')
		{
			var response_event =
			{
				fb_page: false,
				sender: data.sender,
				type: 'message',
				text: data.text,
				id: '',
				lang: false
			}

			resolve(response_event);
		}
		else
		{
			if (data.entry)
			{
				var entries = data.entry;
				var entries_length = entries.length;

				for (var i = 0; i < entries_length; i++)
				{
					var messaging_events = entries[i].messaging;
					if (messaging_events)
					{
						var msg_events_count = messaging_events.length;
						var response_events = [];
						var promises = [];

						for (var j = 0; j < msg_events_count; j++)
						{
							var messaging_event = messaging_events[j];

							if((messaging_event.message && !messaging_event.message.is_echo) || messaging_event.postback)
							{
								var sender = messaging_event.sender.id.toString();
								var recipient = messaging_event.recipient.id.toString();

								promises.push
								(
									pagectl.getFacebookPageInfo(recipient, messaging_event)
									.then(function(response)
									{
										var messaging_event = response.data;

										if(response.page)
										{
											var lang = response.page.language;

											var attachmentType = '';
											var attachmentPayload = '';
											var id = '';
											var type = '';
											var text = '';

											if(messaging_event.message && messaging_event.message.attachments)
											{
												for (var i = 0; i < messaging_event.message.attachments.length; i++)
												{
													var attachment = messaging_event.message.attachments[i];
													attachmentType = attachment.type;
													attachmentPayload = attachment.payload.url;

													if(attachment.payload.hasOwnProperty('sticker_id'))
														id = attachment.payload.sticker_id;
												}
											}

											if(messaging_event.message && messaging_event.message.text)
											{
												type = 'message';
												text = messaging_event.message.text;
											}
											else if(messaging_event.postback && messaging_event.postback.payload)
											{
												type = 'payload';
												text = messaging_event.postback.payload;
											}
											else if(attachmentType!='')
											{
												type = 'attachment';
												text = attachmentPayload;
											}

											if(messaging_event.message && messaging_event.message.quick_reply!=undefined)
											{
												//type = 'quick_reply';
												type = 'payload';
												text = messaging_event.message.quick_reply.payload;
											}

											var response_event =
											{
												fb_page: response.page,
												sender: sender,
												type: type,
												text: text,
												id: id,
												lang: lang
											}
											response_events.push(response_event);
										}
									})
								);
							}
						}

						promise.all(promises)
						.then(function()
						{
						    resolve(response_events);
						});
					}
				}
			}
			else
				resolve(false);
		}
	});
}
