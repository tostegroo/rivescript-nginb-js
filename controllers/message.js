var promise 		= require('bluebird');

var botconfig 		= require('../config/botconfig');

var messagesutil 	= require('../utils/messagesutil');
var debugutil 		= require('../utils/debugutil');
var utility 		= require('../utils/utility');
var botutil 		= require('../utils/botutil');

exports = module.exports = function(userctl, botctl, scriptctl, updatectl, facebookctl)
{
	return new Messagectl(userctl, botctl, scriptctl, updatectl, facebookctl);
}

function Messagectl(userctl, botctl, scriptctl, updatectl, facebookctl)
{
	this.userctl = userctl || require('./user')();
	this.botctl = botctl || require('./bot')();
	this.scriptctl = scriptctl || require('./action')();
	this.updatectl = updatectl || require('./update')();
	this.facebookctl = facebookctl || require('./facebook')();

	this.replyqueue = {};
	this.inputqueue = {};

	//callback functions
	this.onFinishFacebookMessageDispatch = false;
	this.onFinishAllFacebookMessageDispatch = false;
	this.onFinishMessageDispatch = false;
	this.onFinishAllMessageDispatch = false;
	this.onHandleCustomMessageReplyItems = false;
}

/**
 * Sends a message to messenger
 * @param {Object} event object sent by facebook controller
                   {
                     	fb_page   : {Object} page object
                                    {
                                        id      : {String} page id,
                                        token   : {String} page token
                                    },
                     	sender    : {String} user pid,
                     	type      : {String} message, (message|payload|attachment)
                     	text      : {String} message text,
                     	id        : {String} attachment id,
                     	lang      : {String} message language
                   }
 * @param {Object} user_data, if you have a previous loaded userdata, you can send it here
 * @return {Object} a bluebird promisse response
 */
Messagectl.prototype.processMessengeEvent = function processMessengeEvent(event, user_data)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(isCommandFromMessage(event.type, event.text))
			event.text = 'cmdimsmart';

		if(!self.inputqueue.hasOwnProperty(event.sender))
			self.inputqueue[event.sender] = [];

		if(!self.replyqueue.hasOwnProperty(event.sender))
			self.replyqueue[event.sender] = [];

		if(isInInputQueue(self, event.sender, event.text))
			self.inputqueue[event.sender].push(event);

		if(self.inputqueue[event.sender].length<=1)
		{
			if(event.sender!='' && event.fb_page.id!='')
			{
				if(user_data)
				{
					event.userdata = user_data;
					self.dispatchEvent(event)
					.then(function(dispatch_event)
					{
						resolve(dispatch_event);
					});
				}
				else
				{
					self.userctl.getUserData(event.sender, event.fb_page, event.lang)
					.then(function(user_response)
					{
						debugutil.log('user_response', user_response);

						event.userdata = user_response;
						self.dispatchEvent(event)
						.then(function(dispatch_event)
						{
							resolve(dispatch_event);
						});
					});
				}
			}
		}
	});
}

/**
 * Dispatch an event, can dispatch diretctly or using a bot
 * @param {Object} event, an event object
 * @return {Object} a bluebird promisse response
 */
Messagectl.prototype.dispatchEvent = function dispatchEvent(event)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(event.text && event.text.indexOf('<')!=-1 && event.text.indexOf('>')!=-1)
		{
			var messages = botutil.getVariablesObjectFromString(event.text);
			if(messages[0].text==event.text)
			{
				if(event.userdata.status && event.userdata.status>0)
				{
					self.processBotEvent(event)
					.then(function(response)
					{
						resolve(response);
					});
				}
			}
			else
			{
				self.replyqueue[event.sender].push.apply(self.replyqueue[event.sender], messages);
				self.dispatchMessage(messages[0], event);
				resolve({status:1, message:'direct message(s) dispactched', data:messages});
			}
		}
		else
		{
			if(event.userdata.status && event.userdata.status>0)
			{
				self.processBotEvent(event)
				.then(function(response)
				{
					resolve(response);
				});
			}
		}
	});
}

/**
 * Process a bot event
 * @param {Object} event, an event object
 * @return {Object} a bluebird promisse response
 */
Messagectl.prototype.processBotEvent = function processBotEvent(event)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		debugutil.log('event_response', 'page:' + event.fb_page.id, 'sender:' + event.sender, 'type:' + event.type, 'text:' + event.text, 'lang:' + event.lang);

		event.userdata.now = Date.now();
		event.userdata.lang = event.lang;
		self.botctl.setUservars(event.sender, event.userdata, event.lang);

		if(event.type == "attachment")
		{
			if(event.id==369239263222822)
				event.text = "cmdattachmentlike";
			else
				event.text = "cmdattachmentsent";
		}

		self.botctl.processEvent(event)
		.then(function(bot_response)
		{
			dispatch = false;

			if(self.replyqueue[bot_response.event.sender].length==0)
				dispatch = true;

			self.replyqueue[bot_response.event.sender].push.apply(self.replyqueue[bot_response.event.sender], bot_response.reply);

			event.userdata = self.botctl.getUservars(event.sender, event.lang);
			if(dispatch)
				self.dispatchMessage(bot_response.reply[0], event);

			resolve({status:1, message:'bot message(s) dispactched', data:bot_response.reply});
		});
	});
}

/**
 * Dispatch a message
 * @param {Object} message, an object with message params, the text key is required
 * @param {Object} event, an event object to send to next line, if needed
 * @return {Object} a bluebird promisse response
 */
Messagectl.prototype.dispatchMessage = function dispatchMessage(message, event)
{
	var self = this;
	debugutil.log('message_dispatched', message);

	var dispatch_message = true;
	var dispatch_next = true;
	var dispatch_data = {action:false, update:false};

	if(message.storage)
		self.updatectl.processUpdate(event.sender, event.fb_page.id, {[botconfig.botconfig.storagetable]: {storage: message.storage}});

	//if it has an if, execute a comparation and if false, skip the line
	if(message.if)
		dispatch_message = utility.if(message.if, event.userdata);

	//if it has an ifbreak, execute a comparation and if false, break the queue
	if(message.ifbreak)
	{
		dispatch_message = utility.if(message.ifbreak, event.userdata);
		dispatch_next = false;
	}

	if(dispatch_message)
	{
		if(message.text)
			message.text = botutil.replaceVariable(message.text, event.userdata);

		//if it has some scripts do the scripts
		if(message.script)
		{
			var params = message.hasOwnProperty('script_params') ? message.script_params : false;
			dispatch_data.script = self.scriptctl.processFunction(event.sender, event.fb_page.id, message.script, event, params);
		}

		//if it has some updates, so update
		if(message.update)
		{
			self.updatectl.processUpdate(event.sender, event.fb_page.id, message.update, event.userdata);
			dispatch_data.update = true;
		}

		//if it has next call to bot, call bot again
		if(message.next)
		{
			if(typeof(message.next)=='String')
			{
				event.text = message.next;
				self.processBotEvent(event);
			}
			else if(typeof(message.next)=='object' && message.next.length!=undefined)
			{
				for(var i=0; i<message.next.length; i++)
				{
					event.text = message.next[i];
					self.processBotEvent(event);
				}
			}
		}

		if(message.attachment)
		{
			if(typeof(message.attachment)=='String')
			{
				var message_attachment =
				{
					text: 'attachment',
					attachment_data: message.attachment
				};

				if(message.text=='' && !message.hasOwnProperty('quickreply'))
					message = message_attachment;
				else
				{
					if(self.replyqueue[event.sender])
						self.replyqueue[event.sender].splice(1, 0, message_attachment);
				}
			}
			else if(typeof(message.attachment)=='object')
			{
				var attachments = [];

				if(message.attachment.length==undefined)
					attachments.push(message.attachment);
				else
					attachments = message.attachment;

				for(var i=0; i<attachments.length; i++)
				{
					var message_attachment =
					{
						text: 'attachment',
						attachment_data: attachments[i]
					};

					if(i==0 && message.text=='' && !message.hasOwnProperty('quickreply'))
						message = message_attachment;
					else
					{
						if(self.replyqueue[event.sender])
							self.replyqueue[event.sender].splice(1 + i, 0, message_attachment);
					}
				}
			}
		}

		if(self.onHandleCustomMessageReplyItems)
			dispatch_data.action = self.onHandleCustomMessageReplyItems(message, event);

		dispatch_data.action = (dispatch_data.action==undefined) ? false : dispatch_data.action;

		if(message.text!=undefined)
		{
			var delay = (message.delay) ? Number(message.delay) * 1000 : 0;
			delay = (isNaN(delay)) ? 0 : delay;

			if(botconfig.botconfig.humanize && message.text!='attachment')
			{
				var chance = (event.userdata.hasOwnProperty('error_chance')) ? event.userdata.error_chance : botconfig.botconfig.typing_error_chance;
				var byword = (event.userdata.hasOwnProperty('error_byword')) ? event.userdata.error_byword : false;

				message.text = botutil.humanizeString(message.text, event.lang, chance, byword);
			}

			if(botconfig.botconfig.typing_delay)
				delay += botutil.getTypingDelay(message.text);

			if(botconfig.facebook.send_to)
			{
				var fb_page = event.fb_page;
				var sender = event.sender;

				self.facebookctl.getFacebookMessage(event.sender, fb_page.id, message, event.lang, event.userdata)
				.then(function(facebook_message)
				{
					if(!message.delay && delay>botconfig.botconfig.time_for_typing_on)
						self.facebookctl.sendAction(fb_page, sender, 'typing_on');

					promise.delay(delay).then(function()
					{
						var gotonext = true;

						debugutil.log('facebook_send_object', JSON.stringify(facebook_message));

						if(facebook_message.text!='')
						{
							gotonext = false;
							self.facebookctl.sendMessage(fb_page, sender, facebook_message, event)
							.then(function(fb_response)
							{
								debugutil.log('facebook_response', fb_response.data.body);

								var last = self.replyqueue[event.sender].length==1 ? true : false;

								if(self.onFinishFacebookMessageDispatch)
									self.onFinishFacebookMessageDispatch({fb_response:fb_response, event:event, dispatch_data:dispatch_data});

								if(last && self.onFinishAllFacebookMessageDispatch)
									self.onFinishAllFacebookMessageDispatch({fb_response:fb_response, event:event, dispatch_data:dispatch_data});

								self.dispatchNextResponse(fb_response.callback_data, dispatch_data);
							});
						}

						if(message.template)
						{
							gotonext = false;
							self.facebookctl.getFacebookTemplate(event.sender, fb_page.id, message, event.lang, event.userdata)
							.then(function(facebook_template)
							{
								debugutil.log('facebook_template_object', JSON.stringify(facebook_template));

								self.facebookctl.sendMessage(fb_page, sender, facebook_template, event)
								.then(function(fb_response)
								{
									debugutil.log('facebook_response', fb_response.data.body);

									if(message.text=='')
									{
										var last = self.replyqueue[event.sender].length==1 ? true : false;

										if(self.onFinishFacebookMessageDispatch)
											self.onFinishFacebookMessageDispatch({fb_response:fb_response, event:event, dispatch_data:dispatch_data});

										if(last && self.onFinishAllFacebookMessageDispatch)
											self.onFinishAllFacebookMessageDispatch({fb_response:fb_response, event:event, dispatch_data:dispatch_data});

										self.dispatchNextResponse(fb_response.callback_data, dispatch_data);
									}
								});
							});
						}

						if(gotonext)
							self.dispatchNextResponse(event, dispatch_data);
					});
				});
			}
			else
				self.dispatchNextResponse(event, dispatch_data);
		}
		else
			self.dispatchNextResponse(event, dispatch_data);
	}
	else
	{
		if(dispatch_next)
			self.dispatchNextResponse(event, dispatch_data);
		else
		{
			if(self.replyqueue.hasOwnProperty(event.sender))
				self.replyqueue[event.sender] = [];

			self.dispatchNextResponse(event, dispatch_data);
		}
	}
}

/**
 * Verify if response queue has next message and dispatch
 * @param {Object} event, an event object
 */
Messagectl.prototype.dispatchNextResponse = function dispatchNextResponse(event, dispatch_data)
{
	var self = this;
	var last = self.replyqueue[event.sender].length==1 ? true : false;

	if(self.onFinishMessageDispatch)
		self.onFinishMessageDispatch({event:event, dispatch_data:dispatch_data});

	if(last && self.onFinishAllMessageDispatch)
		self.onFinishAllMessageDispatch({event:event, dispatch_data:dispatch_data});

	if(event)
	{
		if(self.replyqueue.hasOwnProperty(event.sender))
		{
			//remove sent message from array
			if(self.replyqueue[event.sender].length>0)
				self.replyqueue[event.sender].splice(0, 1);

			//if array has more messages to dispatch, so dispatch
			if(self.replyqueue[event.sender].length>0)
				self.dispatchMessage(self.replyqueue[event.sender][0], event);
			else
				self.dispatchNextInput(event);
		}
		else
			self.dispatchNextInput(event);
	}
}

/**
 * Verify if input queue has next message and dispatch
 * @param {Object} event, an event object
 */
Messagectl.prototype.dispatchNextInput = function dispatchNextInput(event)
{
	var self = this;

	if(self.inputqueue.hasOwnProperty(event.sender))
	{
		//remove input message from array
		self.inputqueue[event.sender].splice(0, 1);

		//if array has more messages to dispatch, so dispatch
		if(self.inputqueue[event.sender].length>0)
		{
			if(event.hasOwnProperty('userdata'))
				self.inputqueue[event.sender][0].userdata = event.userdata;

			self.dispatchEvent(self.inputqueue[event.sender][0]);
		}
	}
}

/**
 * Private function to verify if a message is in input queue
 * @param {String} sender, user pid
 * @param {String} text, text message sent
 */
function isInInputQueue(self, sender, text)
{
	var response = false;

	if(self.inputqueue.hasOwnProperty(sender))
	{
		response = true;
		for(var i=0; i<self.inputqueue[sender].length; i++)
		{
			if(self.inputqueue[sender][i].text==text)
			{
				response = false;
				break;
			}

		}
	}

	return response;
}

/**
 * Private function to verify a message contains any command
 * @param {String} event_type, the type of the event
 * @param {String} event_text, the text of the event
 */
function isCommandFromMessage(event_type, event_text)
{
	var response = false;

	if(!debugutil.accept_commands_from_user && event_type!='payload')
	{
		var regex = /cmd\s*([^\n\r]*)/g;
		var matches = regex.exec(event_text);

		if(matches)
			response = true;
	}

	return response;
}
