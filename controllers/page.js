var promise     = require('bluebird');

var botconfig   = require('../config/botconfig');
var mysql	= require('easy-mysql-promise')(botconfig.database.config);

exports = module.exports = function()
{
    return new Pagectl();
}

function Pagectl(){}

Pagectl.prototype.isValidPage = function isValidPage(page_id)
{
    return (botconfig.facebook && botconfig.facebook.pages && botconfig.facebook.pages.hasOwnProperty(page_id)) ? true : false;
}

Pagectl.prototype.getFacebookPageInfo = function getFacebookPageInfo(page_id, callback_data)
{
    var self = this;
    return new promise(function(resolve, reject)
	{
        if(self.isValidPage(page_id))
            resolve({page:{id:page_id, token:botconfig.facebook.pages[page_id].pageToken, language:botconfig.facebook.pages[page_id].language}, data:callback_data});
        else
        {
            var sql = 'SELECT * FROM ' + botconfig.database.pages_table + ' WHERE fb_page_id="'+page_id+'";';

    		mysql.query(sql)
    		.then(function(response)
    		{
                if(response)
                {
                    var token = (response.hasOwnProperty('fb_page_token')) ? response.fb_page_token : false;
                    var language = (response.hasOwnProperty('language')) ? response.language : false;

                    response = {page:{id:response.fb_page_id, token:token , language:language}, data:callback_data};
                }

    			resolve(response);
    		});
        }
    });
}

Pagectl.prototype.getFacebookPageToken = function getFacebookPageToken(page_id, callback_data)
{
    var self = this;
    return new promise(function(resolve, reject)
	{
        if(Pagectl.prototype.isValidPage(page_id))
            resolve({token:botconfig.facebook.pages[page_id].pageToken, data:callback_data});
        else
        {
            var sql = 'SELECT * FROM ' + botconfig.database.pages_table + ' WHERE fb_page_id="'+page_id+'";';

    		mysql.query(sql)
    		.then(function(response)
    		{
                if(response)
                    response = (response.hasOwnProperty('fb_page_token')) ? response.fb_page_token : false;

    			resolve({page:response, data:callback_data});
    		});
        }
    });
}

Pagectl.prototype.getFacebookPageLanguage = function getFacebookPageLanguage(page_id, callback_data)
{
    var self = this;
    return new promise(function(resolve, reject)
	{
        if(Pagectl.prototype.isValidPage(page_id))
            resolve({language:botconfig.facebook.pages[page_id].language, data:callback_data});
        else
        {
            var sql = 'SELECT * FROM ' + botconfig.database.pages_table + ' WHERE fb_page_id="'+page_id+'";';

    		mysql.query(sql)
    		.then(function(response)
    		{
                if(response)
                    response = (response.hasOwnProperty('language')) ? response.language : false;;

    			resolve({page:response, data:callback_data});
    		});
        }
    });
}

Pagectl.prototype.getFacebookPageByLanguage = function getFacebookPageByLanguage(language)
{
    var self = this;
    var page_id = false;

    for(k in botconfig.facebook.pages)
    {
        var page_language = botconfig.facebook.pages[k].language;
        var page_type = botconfig.facebook.pages[k].type;

        if(botconfig.env==page_type && language==page_language)
        {
            page_id = k;
            break;
        }
    }

    return page_id;
}
