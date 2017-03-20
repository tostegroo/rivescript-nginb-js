/**
 * Attachment object
 * @exports {Object} attachments object
   {
        type: {String} the type of the attachment (image|audio|video)
        url : {String} the url of the atachment ($assets_path will be substituted by assets path configured in bot initialization)
    }
 */
module.exports =
{
    attachment:
    {
        type: "image",
        url : "{$assets_path}/images/image.png"
    }
}
