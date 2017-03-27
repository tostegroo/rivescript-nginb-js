/**
 * Menus object
 * @exports {Object} menus object
   {
        menus.data = {Object} menus data object
		{
			menu_name: {Key} the name of the menu_name
			{
				type: {String} the type of the menu (fixed|template|button|quick_reply) - fixed is used for sandwich menu
				data: {Object.ARRAY} {Objects} menu data
				[
					{
						title: {String} the title that will be used in menu (template only),
						subtitle: {String} the subtitle that will be used in menu (template only),
						image_url: {String} the image url that will be used in menu (template only),
						buttons:
						[
							{
								if: "(first_name=='Fabio')", //conditional for buttons, if user data don't fill the requirements the button will not be displayed
								title: {String} the title of the button,
								webview_height_ratio: {String} the size of webview, if is used (full|tall|compact),
								messenger_extensions: {Bollean} sets if the webview will use facebook messenger extensions,
								send_id: {Bollean} sets it will send the sender_id and page_id on url as param,
								encode_id: {Bollean} sets it will send the params encoded,
								url: {String} the url of the webview
							},
							{
								title: {String} the title of the button,
								payload: {String} the payload of the button
							}
						]
					}
				]
			}
		}
    }
 */

var menus = {};
menus.data =
{
	persistent_menu:
	{
		type: 'persistent_menu',
		data:
		[
			{
				locale: "default",
				composer_input_disabled:true,
				call_to_actions:[
				{
					title: "My Account",
					type: "nested",
					call_to_actions:[
						{
							title:"Pay Bill",
							type:"postback",
							payload:"PAYBILL_PAYLOAD"
						},
						{
							title:"History",
							type:"postback",
							payload:"HISTORY_PAYLOAD"
						}]
					},
					{
						type:"web_url",
						title:"Latest News",
						url:"http://petershats.parseapp.com/hat-news",
						webview_height_ratio:"full"
					}
				]
			},
			{
				locale:"zh_CN",
				composer_input_disabled:false
			}
		]
	},

	price_menu:
	{
		type: 'template',
		data:
		[
			{
				title: '$title',
				subtitle: '$subtitle',
				image_url: '$image_url',
				buttons:
				[
					{
						title:'$title',
						webview_height_ratio: 'tall',
						messenger_extensions: true,
						send_id: true,
						encode_id: true,
						url: 'url'
					}
					{
						title:'$title',
						payload: 'payload'
					}
				]
			}
		]
	}
}

/**
 * Function to process and get menus from any source you want (database, for example)
 * @param {String|Object} params - Any param you want
 */
menus.getMenu = function(params)
{
	return new promise(function(resolve, reject)
	{
		var menu = false;
		resolve(menu);
	});
}

module.exports = menus
