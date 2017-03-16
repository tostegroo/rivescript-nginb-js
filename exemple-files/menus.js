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
 * @param {string} menu_name, name of the menu
 */
menus.getMenu = function(menu_name)
{
	return new promise(function(resolve, reject)
	{
		var menu = false;
		resolve(menu);
	});
}

module.exports = menus
