var promise 		= require('bluebird');

var botconfig   = require('../config/botconfig');

var fbmessageutil 	= require('../utils/fbmessageutil');
var stringutil 		= require('../utils/stringutil');
var utility 		= require('../utils/utility');

exports = module.exports = function(menus)
{
	return new Menuctl(menus);
}

/**
 * @constructs Menu_Controller
 * @public
 * @param {Object} menus - Menus object with menus to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @param {Object} texts - Texts object with text and localization to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/texts.js|template}
 */
function Menuctl(menus, texts)
{
	texts = texts || false;
	menus = menus || false;

	this.texts = texts;
	this.menus = menus;
}

/**
 * Gets the menu object by a given menu name and localization
 * @param {String} menu - The name of the menu
 * @param {String} lang - The language of the menu for multilanguage menus
 * @return {Object} A bluebird promise menu object
 */
Menuctl.prototype.getMenu = function getMenu(menu, lang)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		if(self.menus && typeof(menu)=='string' && self.menus.data.hasOwnProperty(menu))
		{
			var return_menu = false;
			var string_menu = JSON.stringify(self.menus.data[menu]);
			string_menu = stringutil.replacePath(string_menu, botconfig);

			if(self.texts)
			{
				for(k in self.texts)
				{
					var value = self.texts[k][lang];
					var k_string = '$'+k;

					if(value!=undefined)
					{
						if(typeof(value)=='object')
						{
							value = JSON.stringify(value);
							value = stringutil.replaceAll(value, '[', '');
							value = stringutil.replaceAll(value, ']', '');

							k_string = '"' + k_string + '"';
						}
						string_menu = stringutil.replaceAll(string_menu, k_string, value);
					}
				}
			}

			try{return_menu = JSON.parse(string_menu);}
			catch(err){console.log('menu error:', err)}

			resolve(return_menu);
		}
		else
		{
			if(self.menus.getMenu && typeof(self.menus.getMenu)=='function')
				resolve(self.menus.getMenu(menu));
			else
				resolve(false);
		}
	});
}

/**
 * Gets the facebook menu object
 * @param {Object} menu - The menu object - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @param {String} sender - The facebook sender id
 * @param {String} page_id - The facebook page id
 * @param {Object} data - The data object used for comparations, if any (Eg. userdata object)
 * @param {Object} params - The params object to determine if a nutton will be used (an array of integers)
 * @return {Object} A facebook formatted menu object
 */
Menuctl.prototype.getFacebookMenu = function getFacebookMenu(menu, sender, page_id, data, params)
{
	var self = this;

	data = data || {};
	params = params || [];

	var response = {text: ''};
	if(menu!=undefined)
	{
		if(menu.type!=undefined && (menu.type=='template' || menu.type=='button' || menu.type=='quick_reply'))
		{
			var menu_data = (menu.data!=undefined && menu.data.length!=undefined && menu.data.length>0) ? menu.data : {};

			if(menu.type=='button')
			{
				menu_data = menu_data[0];
				var title = (menu_data.hasOwnProperty('title')) ? menu_data.title : 'Menu';
				var menu_buttons = (menu_data.hasOwnProperty('buttons') && menu_data.buttons.length>0) ? menu_data.buttons : [{"title":"OK", "payload":"ok"}];
				var buttons = self.getFacebookButtons(menu_buttons, sender, page_id, data, params);

				response = fbmessageutil.messageButtons(title, buttons);
			}
			else if(menu.type=='template')
			{
				var elements = [];
				for (var i = 0; i < menu_data.length; i++)
				{
					var menu_item = menu_data[i];

					var menu_buttons = (menu_item.hasOwnProperty('buttons') && menu_item.buttons.length>0) ? menu_item.buttons : [{"title":"OK", "payload":"ok"}];
					menu_item.buttons = self.getFacebookButtons(menu_buttons, sender, page_id, data, params);

					elements.push(fbmessageutil.genericTemplateElement(menu_item, menu_item.buttons));
				}

				response = fbmessageutil.genericTemplate(elements);
			}
			else if(menu.type=='quick_reply')
			{
				var params = {};
				menu_data = menu_data[0];

				var quick_replies = (menu_data.hasOwnProperty('quick_replies') && menu_data.quick_replies.length>0) ? menu_data.quick_replies : [{"title":"OK", "payload":"ok"}];
				quick_replies = self.getFacebookButtons(quick_replies, sender, page_id, data, params);

				params.text = (menu_data.hasOwnProperty('text')) ? menu_data.text : 'menu';

				if(menu_data.hasOwnProperty('attachment'))
					params.attachment = menu_data.attachment;

				response = fbmessageutil.quickReply(params, quick_replies);
			}
		}
	}

	return response;
}

/**
 * Gets the facebook buttons object
 * @param {Object} base_buttons - The base buttons object, normaly an simplyfied version of facebook button object
 * @param {String} sender - The facebook sender id
 * @param {String} page_id - The facebook page id
 * @param {Object} data - The data object used for comparations, if any (Eg. userdata object)
 * @param {Object} params - The params object to determine if a nutton will be used (an array of integers)
 * @return {Object} An array of facebook formatted button objects
 */
Menuctl.prototype.getFacebookButtons = function getFacebookButtons(base_buttons, sender, page_id, data, params)
{
	data = data || {};
	params = params || [];
	var paramslength = (params.length!=undefined) ? params.length : 0;

	var buttons = [];
	for (var i = 0; i < base_buttons.length; i++)
	{
		var button = base_buttons[i];

		if(typeof(button)=='string')
			button = {title: button, payload: "cmdr" + (i + 1)};

		var putId = false;
		var encodeId = false;
		var usebutton = true;

		if(button.hasOwnProperty('if'))
		{
			usebutton = utility.if(button.if, data);
			delete button.if;
		}
		else if(paramslength>i)
			usebutton = (params[i] == 0) ? false : true;

		if(usebutton)
		{
			if(button.hasOwnProperty('encode_id'))
			{
				encodeId = button.encode_id;
				delete button.encode_id;
			}

			if(button.hasOwnProperty('send_id'))
			{
				putId = button.send_id;
				delete button.send_id;
			}

			if(!button.hasOwnProperty('type'))
			{
				if(button.hasOwnProperty('url'))
					button.type = "web_url";
				else
					button.type = "postback";
			}
			else
			{
				if(button.type=='web_url')
					button = fbmessageutil.urlButton(button.title, button.url, button.webview_height_ratio);
				else if(button.type=='postback')
					button = fbmessageutil.postbackButton(button.title, button.payload);
				else if(button.type=='phone_number')
					button = fbmessageutil.callButton(button.title, button.payload);
				else if(button.type=='element_share')
					button = fbmessageutil.shareButton();
				else if(button.type=='payment')
					button = fbmessageutil.buyButton(button.title, button.payload, {});
			}

			if(putId && sender!=undefined && sender!='' && button.type=='web_url')
			{
				var pre = (button.url.indexOf('?')==-1) ? '?' : '&';
				var pid = page_id || '';

				if(encodeId)
					button.url += pre+'s='+ stringutil.tcEncode(sender) + '&p=' + stringutil.tcEncode(pid);
				else
					button.url += pre+'s='+sender + '&p=' + pid;

			}

			if(button.type=='web_url' && button.url.indexOf('$')!=-1)
				button.url = stringutil.replacePath(button.url, botconfig);

			buttons.push(button);
		}
	}

	return buttons;
}
