var fbmessageutil = {};

//Accepts mark_seen, typing_on, typing_off
fbmessageutil.senderAction = function (action)
{
	return {sender_action: action};
}

//Sends a regular text message
fbmessageutil.textMessage = function(text)
{
	return {text: text};
}

//send attachment
//Types: image, auido, video, file
fbmessageutil.attachment = function(type, url)
{
	return {
		attachment:
		{
			type: type,
			payload:
			{
				url: url
			}
		}
	};
}

//Send generic template (image carrousel + buttons)
fbmessageutil.genericTemplate = function (elements)
{
	return {
		attachment:
		{
			type: "template",
			payload:
			{
				template_type: "generic",
				elements: elements
			}
		}
	};
}

//Generate elements for the image carrousel
//title has a 80 character limit
//subtitle has a 80 character limit
//buttons is limited to 3
//Image ratio is 1.91:1
fbmessageutil.genericTemplateElement = function (params, buttons)
{
	buttons = buttons || [];

	var title = (params.hasOwnProperty('title')) ? params.title : '';
	var itemUrl = (params.hasOwnProperty('item_url')) ? params.item_url : '';
	var imageUrl = (params.hasOwnProperty('image_url')) ? params.image_url : '';
	var subtitle = (params.hasOwnProperty('subtitle')) ? params.subtitle : '';

	return {
		title: title,
		item_url: itemUrl,
		image_url: imageUrl,
		subtitle: subtitle,
		buttons: buttons
	};
}

/***Generate buttons for the elements***/
//Types: web_url, postback, phone_number, element_share, payment

//URL Button
//title. 20 character limit.
//url: This URL is opened in a mobile browser when the button is tapped
//webview : Height of the Webview. Valid values: compact, tall, full.
//extensions: user messenger extensions: true or false;
fbmessageutil.urlButton = function(title, url, webview, extensions, fallback_url)
{
	webview = (webview==undefined || webview=='') ? "full" : webview;

	var response = {
		type: "web_url",
		url: url,
		title: title,
		webview_height_ratio: webview
	}

	if(extensions!=undefined)
		response.messenger_extensions = extensions;

	if(fallback_url!=undefined)
		response.fallback_url = fallback_url;

	return response;
}

//Postback Button
//title. 20 character limit.
//payload: This data will be sent back to your webhook. 1000 character limit.
fbmessageutil.postbackButton = function(title, payload)
{
	return {
		type: "postback",
		title: title,
		payload: payload
	}
}

//Call Button
//title. 20 character limit.
//payload: Format must have "+" prefix followed by the country code, area code and local number. For example, +16505551234.
fbmessageutil.callButton = function(title, payload)
{
	return {
		type: "phone_number",
		title: title,
		payload: payload
	}
}

//Share Button
fbmessageutil.shareButton = function()
{
	return {type: "element_share"}
}

//Buy Button
//The Buy Button only works with the Generic Template and it must be the first button.
//title. Title of Buy Button. Must be "buy".
//payload: Format must have "+" prefix followed by the country code, area code and local number. For example, +16505551234.
fbmessageutil.buyButton = function(title, payload, paymentSummary)
{
	return {
		type: "payment",
		title: title,
		payload: payload,
		payment_summary: paymentSummary
	}
}

//Payment Summary Element
//currency: Currency for price.
//paymentType: Must be FIXED_AMOUNT or FLEXIBLE_AMOUNT.
//merchantName: Name of merchant.
//userInfo: (Array) of information requested from person that will render in the dialog. Valid values: shipping_address, contact_name, contact_phone, contact_email.
//priceList: (Array) List of objects used to calculate total price. Each label is rendered as a line item in the checkout dialog.
fbmessageutil.paymentSummary = function(currency, paymentType, merchantName, userInfo, priceList)
{
	return {
		currency: currency,
		payment_type: paymentType,
		merchant_name: merchantName,
		requested_user_info: userInfo,
		price_list: priceList
	}
}

fbmessageutil.price = function(label, amount)
{
	return {
		label: label,
		amount: amount
  }
}
/***Generate buttons for the elements***/

//Sends a menu with up to 3 buttons
fbmessageutil.messageButtons = function (text, buttons)
{
	buttons = buttons || [];

	return {
		attachment:
		{
			type: "template",
			payload:
			{
				template_type: "button",
				text: text,
				buttons: buttons
			}
		}
	};
}

//Sends a Quick reply template
//quickreplies tem limite de 10
//params: text or attachment;
fbmessageutil.quickReply = function (params, quickreplies)
{
	quickreplies = quickreplies || [];
	params = params || {};

	var response = {quick_replies: quickreplies};

	if(params.hasOwnProperty('text'))
		response.text = params.text;

	if(params.hasOwnProperty('attachment') && typeof params.attachment !== 'string')
		response.attachment = params.attachment;

	return response;
}

//Sends a Quick reply template
//title tem limite de 20 caracteres
//payload tem limite de mil caracteres
fbmessageutil.quickReplyItem = function (title, payload)
{
	return {
		content_type: "text",
		title: title,
		payload: payload
	}
}

fbmessageutil.quickReplyItems = function(items)
{
	var qr_items = [];

	for (var i = 0; i < items.length; i++)
	{
		var item = items[i];

		var title = (item.title!=undefined) ? item.title : '';
		var payload = (item.payload!=undefined) ? item.payload : '';
		var type = (item.type!=undefined) ? item.type : 'text';
		var image_url = (item.image_url!=undefined) ? item.image_url : '';

		qr_items.push(fbmessageutil.quickReplyItem(title, payload, type, image_url));
	}

	return qr_items;
}

fbmessageutil.payloadFromObject = function (object)
{
	return JSON.stringify(object);
}

module.exports = fbmessageutil;
