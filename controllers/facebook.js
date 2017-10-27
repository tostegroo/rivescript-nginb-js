var promise 			= require('bluebird');
var request 			= require('request');
var JSONbig 			= require('json-bigint');

var botconfig   	= require('../config/botconfig');

var fbmessageutil = require('../utils/fbmessageutil');
var messagesutil 	= require('../utils/messagesutil');
var debugutil 		= require('../utils/debugutil');
var strinutil			= require('../utils/stringutil');
var crypto 				= require('crypto');

var pagectl				= false;
var menuctl				= false;
var attachmentctl	= false;

module.exports = function(pagectl, attachmentctl, menuctl)
{
	return new Facebookctl(pagectl, attachmentctl, menuctl);
}

/**
 * @constructs Facebook_Controller
 * @public
 * @param {Page_Controller} page_controller - A NGINB page controller
 * @param {Attachment_Controller} attachment_controller - A NGINB attachment controller
 * @param {Menu_Controller} menu_controller - A NGINB menu controller
 */
function Facebookctl(page_controller, attachment_controller, menu_controller)
{
	pagectl = page_controller || require('./page')();
	attachmentctl = attachment_controller || require('./attachment')();
	menuctl = menu_controller || require('./menu')();
}

/**
 * Check if the signature from the header is ok
 * @param {Array|String} data - A request data body to make the signature
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.isValidSignature = function isValidSignature(req)
{
	if(botconfig && botconfig.facebook && botconfig.facebook.bypass_signature)
		return true;

	var payload = '';
	if(req.rawBody){
		payload = req.rawBody;
	}
	else{
		payload = (typeof (req.body) !== "string") ? JSON.stringify(req.body) : req.body;
		payload = strinutil.unicodeEscape(payload);
	}
	
	var hmac = crypto.createHmac('sha1', botconfig.app_key);
	hmac.update(payload, 'utf-8');
	var expectedSignature = 'sha1=' + hmac.digest('hex');
	var isvalid = req.body.hasOwnProperty('headers') && req.body.headers.hasOwnProperty('x-hub-signature') && req.body.headers['x-hub-signature'] === expectedSignature;
	
	return isvalid;
}

/**
 * Sets the greetings text of the facebook messenger bot
 * @param {PageConfig} page - A PageConfig object
 * @param {Array|String} greetings - A String or an Array with greetings messages and locations
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.setGreetingText = function setGreetingText(page, greetings)
{
	var _this = this;
	return new promise(function(resolve)
	{
		greetings = (greetings.length!=undefined) ? greetings : [greetings];

		var json =
		{
			greeting: greetings
		}

		_this.setMessengerProfile(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

/**
 * Enables the start button for facebook bot
 * @param {PageConfig} page - A PageConfig object
 * @param {String} payload - A String with the paylod of the start button
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.setStartButton = function setStartButton(page, payload)
{
	var _this = this;
	return new promise(function(resolve)
	{
		var json =
		{
			get_started: {"payload": payload}
		}

		_this.setMessengerProfile(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

/**
 * Enables the facebook persistent menu (sandwich)
 * @param {PageConfig} page - A PageConfig object
 * @param {String} menu - The menu name to gets from menus object file, if configured
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.setPersistentMenu = function setPersistentMenu(page, menu)
{
	var _this = this;
	return new promise(function(resolve)
	{
		var menu_data = (menu.data!=undefined && menu.data.length!=undefined && menu.data.length>0) ? menu.data : [];
		var json = {persistent_menu:[]};

		if(menu.type!=undefined)
		{
			if(menu.type=='fixed')
			{
				var menu_buttons = (menu_data.hasOwnProperty('buttons') && menu_data.buttons.length>0) ? menu_data.buttons : [{"type":"postback", "title":"OK", "payload":"ok"}];
				var buttons = menuctl.getFacebookButtons(menu_buttons);

				json = {persistent_menu: buttons}
			}
			else if(menu.type=='persistent_menu')
			{
				json = {persistent_menu: menu_data}
			}

			_this.setMessengerProfile(page, json)
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

/**
 * Adds a domain or an array of domains to the facebooks domain whitelist
 * @param {PageConfig} page - A PageConfig object
 * @param {String} domainArray - The array of domais do add (can be only one item)
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.domainWhitelisting = function domainWhitelisting(page, domainArray)
{
	var _this = this;
	return new promise(function(resolve)
	{
		domainArray = domainArray.length!=undefined ? domainArray : [domainArray];
		var json = {whitelisted_domains: domainArray};

		_this.setMessengerProfile(page, json)
		.then(function(result)
		{
			resolve(result);
		});
	});
}

/**
 * Sets a messenger profile from a given json object - See {@link https://developers.facebook.com/docs/messenger-platform/messenger-profile|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {Object} json - The json object to set
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.setMessengerProfile = function setMessengerProfile(page, json)
{
	return new promise(function(resolve)
	{
		request(
		{
			method: 'POST',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/messenger_profile?access_token=" + page.token,
			json: json
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			resolve(message);
		});
	});
}

/**
 * Deletes a messenger profile from a given field - See {@link https://developers.facebook.com/docs/messenger-platform/messenger-profile|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {String} fields - The fields to delete
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.deleteMessengerProfile = function setMessengerProfile(page, fields)
{
	return new promise(function(resolve)
	{
		request(
		{
			method: 'DELETE',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/messenger_profile?access_token=" + page.token,
			json: {fields:fields}
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			resolve(message);
		});
	});
}

/**
 * Gets a messenger profile from a given field - See {@link https://developers.facebook.com/docs/messenger-platform/messenger-profile|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {String} fields - The fields to get info from
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.getMessengerProfile = function setMessengerProfile(page, fields)
{
	return new promise(function(resolve)
	{
		request(
		{
			method: 'GET',
			uri: botconfig.facebook.graph_url + "/" + botconfig.facebook.version + "/me/messenger_profile?fields="+fields+"&access_token=" + page.token
		},
		function (error, response, body)
		{
			var message = messagesutil.getMessage(error, response, body, 'Set Thread Settings Error');
			resolve(message);
		});
	});
}

/**
 * Subscribes a messenger page to receive bot messages - See {@link https://developers.facebook.com/docs/messenger-platform/webhook-reference#subscribe|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.doSubscribeRequest = function doSubscribeRequest(page)
{
	return new promise(function(resolve)
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

/**
 * Does a facebook login - See {@link https://developers.facebook.com/docs/facebook-login|Facebook documentation}
 * @param {Object} req - A request object from express
 * @param {Object} res - A response object from express
 * @param {String} redirect_url - The redirect url to be used by facebook API
 * @param {String} scope - The scope of facebook auth request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.facebookLogin = function functionName(req, res, redirect_url, scope)
{
	var facebookUrl = "https://www.facebook.com";

	if (req.device.type!='desktop')
		facebookUrl = "https://m.facebook.com";

	var url = facebookUrl+'/'+botconfig.facebook.version+'/dialog/oauth?';
	var params = 'client_id='+botconfig.facebook.login_app_id+'&redirect_uri='+encodeURIComponent(redirect_url)+'&scope='+scope;

	res.redirect(url+params);
}

/**
 * Gets the facebook token by a given code - See {@link https://developers.facebook.com/docs/facebook-login|Facebook documentation}
 * @param {String} code - A code returned by facebook login page
 * @param {String} redirect_url - The redirect url to be used by facebook API
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.getFacebookToken = function getFacebookToken(code, redirect_url, callback_data)
{
	return new promise(function(resolve)
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

/**
 * Gets the facebook user data by a given code - See {@link https://developers.facebook.com/docs/facebook-login|Facebook documentation}
 * @param {String} code - A code returned by facebook login page
 * @param {String} redirect_url - The redirect url to be used by facebook API
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.getFacebookUserDataByCode = function requestUserData(code, redirect_url, callback_data)
{
	var _this = this;
	return new promise(function(resolve)
	{
		_this.getFacebookToken(code, redirect_url, callback_data)
		.then(function(token_response)
		{
			var data = token_response.data.body;

			if(typeof data === 'string')
				data = JSONbig.parse(data);

			_this.getFacebookUserData(data.access_token, token_response.callback_data)
			.then(function(fb_response)
			{
				var fb_data = fb_response.data.body;

				if(typeof fb_data === 'string')
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

/**
 * Gets a facebook user data by a valid access_token - See {@link https://developers.facebook.com/docs/facebook-login|Facebook documentation}
 * @param {String} access_token - A code returned by facebook login page
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.getFacebookUserData = function requestUserData(access_token, callback_data)
{
	return new promise(function(resolve)
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

/**
 * Gets the facebook user data by a given page/sender_id - See {@link https://developers.facebook.com/docs/facebook-login|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {String} sender_id - The facebook sender id
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.requestUserData = function requestUserData(page, sender_id, callback_data)
{
	return new promise(function(resolve)
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


/**
 * Sends a facebook messenger message - See {@link https://developers.facebook.com/docs/messenger-platform/send-api-reference|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {String} sender - The facebook sender id
 * @param {Object} message_data - A facebook message formated data
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.sendMessage = function sendMessage(page, sender, message_data, callback_data)
{
	return new promise(function(resolve)
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

/**
 * Sends a facebook messenger action - See {@link https://developers.facebook.com/docs/messenger-platform/send-api-reference/sender-actions|Facebook documentation}
 * @param {PageConfig} page - A PageConfig object
 * @param {String} sender - The facebook sender id
 * @param {Object} action - A facebook action (mark_seen|typing_on|typing_off)
 * @param {Object} callback_data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook response object
 */
Facebookctl.prototype.sendAction = function sendAction(page, sender, action, callback_data)
{
	return new promise(function(resolve)
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

/**
 * Formats a bot message to a facebook template object
 * @param {String} page_id - the facebook page id
 * @param {String} sender - The facebook sender id
 * @param {Object} message - A message object returned by bot controller
 * @param {String} lang - The language of the template to be passed to menu configuration
 * @param {Object} data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook template object
 */
Facebookctl.prototype.getFacebookTemplate = function getFacebookTemplate(sender, page_id, message, lang, data)
{
	return new promise(function(resolve)
	{
		var facebook_message = false;
		var menu_params = false;
		var params = (message.button_params) ? message.button_params : [];

		if(message.template)
		{
			if(typeof message.template === 'string' || (typeof message.template === 'object' && message.template.length==undefined))
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

/**
 * Formats a bot message to a facebook message
 * @param {String} page_id - the facebook page id
 * @param {String} sender - The facebook sender id
 * @param {Object} message - A message object returned by bot controller
 * @param {String} lang - The language of the template to be passed to menu configuration
 * @param {Object} data - A callback object data to be passed after the request
 * @return {Object} A bluebird promise facebook message object
 */
Facebookctl.prototype.getFacebookMessage = function getFacebookMessage(sender, page_id, message, lang, data)
{
	return new promise(function(resolve)
	{
		var facebook_message = {text: ''};
		var menu_params = false;
		var msg = false;
		var params = [];

		if(message.quickreply)
		{
			var rpl_items = message.quickreply;
			msg = {text: ''};
			params = (message.quickreply_params) ? message.quickreply_params : [];
			
			if(typeof message.quickreply === 'string' || (typeof message.quickreply === 'object' && message.quickreply.length==undefined))
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
			msg = '';
			params = (message.button_params) ? message.button_params : [];
			
			if(typeof message.button === 'string' || (typeof message.button === 'object' && message.button.length==undefined))
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

				if(typeof attachement === 'string')
					attachement = attachmentctl.getAttachment(attachement);

				facebook_message = fbmessageutil.attachment(attachement.type, attachmentctl.getAttachmentUrl(attachement.url));
			}
			else
				facebook_message.text = message.text;

			resolve(facebook_message);
		}
	});
}

/**
 * Takes a facebook message and transform into a NGINB event formated
 * @param {Object} data - A facebook messenger data object
 * @return {Event} A bluebird promise NGINB event object
 */
Facebookctl.prototype.messengerEvent = function messengerEvent(data)
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
						var referral = {};

						for (var j = 0; j < msg_events_count; j++)
						{
							var messaging_event = messaging_events[j];

							if((messaging_event.message && !messaging_event.message.is_echo) || messaging_event.postback || messaging_event.referral)
							{
								var sender = messaging_event.sender.id.toString();
								var recipient = messaging_event.recipient.id.toString();

								promises.push(
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
												referral = messaging_event.postback.referral || referral;
											}
											else if(messaging_event.referral)
											{
												type = 'referral';
												text = '';
												referral = messaging_event.postback.referral || referral;
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
												page: response.page,
												sender: sender,
												type: type,
												text: text,
												id: id,
												data: referral,
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
