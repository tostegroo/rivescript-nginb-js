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
 * @param {Object} actionData
 * @param {Object} params
 */
scripts.restart = function restart(actionData, params)
{
	console.log('restart');
}

module.exports = scripts
