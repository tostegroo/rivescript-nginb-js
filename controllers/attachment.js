var botconfig	= require('../config/botconfig');
var stringutil 	= require('../utils/stringutil');

exports = module.exports = function(attachments)
{
	return new Attachmentclt(attachments);
}

function Attachmentclt(attachments)
{
	attachments = attachments || false;
	this.attachments = attachments;
}

Attachmentclt.prototype.getAttachment = function getAttachment(name)
{
	var self = this;
	var return_attachment = false;

	if(self.attachments && self.attachments.hasOwnProperty(name))
	{
		return_attachment = self.attachments[name];

		if(return_attachment.hasOwnProperty('url'))
			return_attachment.url = self.getAttachmentUrl(return_attachment.url);
	}

	return return_attachment;
}

Attachmentclt.prototype.getAttachmentUrl = function getAttachmentUrl(url)
{
	var new_url = url;
	return stringutil.replaceAll(new_url, '$assets_path', botconfig.assets_path);
}
