/**
 * Scripts object
 * @exports {Object} scripts object
*/
var scripts = {};

/**
 * Scripts action object
 @exports {Object} action object
 */
scripts.action =
{
	"pause": {name: 'pause'}
};

/**
 * Scripts function
 * @exports {FUNCTION} any function to be used in rivescript bot
 * @param {Object} botData - the bot data that comes from bot
 * {
 *		sender: {String} - facebook sender id,
 *		page_id: {String} - facebook page id,
 *		event_data: {Object} - event object
 * }
 * @param {Object} params - params object, used inside rivescript to get some params, can be a json object or an array
 */
scripts.restart = function restart(botData, params)
{
	console.log('restart');
}

module.exports = scripts
