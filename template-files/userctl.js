var promise 		= require('bluebird');

var userctl = {};

/*
	variables to set if you want
	{number}  error_chance, use for chance of error on humazine string, if seted
	{boolean} error_byword, use true to humanize string from humanize config file
	and any custom data you want
*/

/**
 * Function to get put some information on user_data send to rivescript bot
 * @param {Object} user_data - User_data sent by the bot
 * @param {string} lang - The language of the bot
 * @return {Promisse} A bluebird promise response
 */
userctl.getUserData = function (user_data, lang)
{
	return new promise(function(resolve)
	{
		user_data.error_chance = 0;
		console.log(lang);
		resolve(user_data);
	});
}

module.exports = userctl;
