var botconfig	= require('../config/botconfig');
var stringutil 	= require('../utils/stringutil');

module.exports = function(attachments)
{
	return new Attachmentclt(attachments);
}

/**
 * @constructs Attachment_Controller
 * @public
 * @param {Object} attachments - Attachments object with files to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/attachments.js|template}
 */
function Attachmentclt(attachments)
{
	attachments = attachments || false;
	this.attachments = attachments;
}

/**
 * Gets the attachment object by a given name
 * @param {String} name - The name of the attachment
 * @return {Object} An attachment object
 */
Attachmentclt.prototype.getAttachment = function getAttachment(attachment)
{
	var _this = this;
	var return_attachment = false;

	if(_this.attachments && _this.attachments.hasOwnProperty(attachment))
	{
		return_attachment = _this.attachments[attachment];

		if(return_attachment.hasOwnProperty('url'))
			return_attachment.url = _this.getAttachmentUrl(return_attachment.url);
	}

	var file_type = stringutil.getFileType(attachment);
	if(file_type)
	{
		var url = _this.getAttachmentUrl(attachment);
		if(stringutil.isURL(url))
		{
			return_attachment = 
			{
				type: file_type,
				url : url
			}
		}
	}
	return return_attachment;
}

/**
 * Replaces the $assets_url and get the attachment url configured with correct path
 * @param {String} url - The attachment url
 * @return {Object} An attachment object
 */
Attachmentclt.prototype.getAttachmentUrl = function getAttachmentUrl(url)
{
	return stringutil.replacePath(url, botconfig);
}
