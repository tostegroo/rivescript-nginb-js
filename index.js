var promise 	    = require('bluebird');
var cron            = require('node-cron');

var humanization    = require('./config/humanization');
var botconfig       = require('./config/botconfig');
var stringutil      = require('./utils/stringutil');
var utility         = require('./utils/utility');
var debugutil       = require('./utils/debugutil');

var messenger       = false;
var pagectl         = false;
var userctl         = false;
var facebookctl     = false;
var botctl          = false;

/**
 * Export funciton
 * @param  {Object} options
 {
    env: {String} environment flag,
    instances: {Object.ARRAY} array object with bot instances
    [
        {
            language: {String} language of the brain,
            path: {String} path to the brain files (rivescript),
            config: {Object} config object to send to rivescript - see: https://github.com/aichaos/rivescript-js
            variables: {Object} variables file to fill subs in rivescript - see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/variables.js
        }
    ],
    assets_url: {String} path to assets to be used as attachment,
    scripts: {Object} scripts object with functions to be used in rivescript, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/scripts.js,
    attachments: {Object} attachments object with files to be used in rivescript, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/attachments.js,
    menus: {Object} menus object with menus to be used in rivescript, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/menus.js,
    texts: {Object} texts object with text and localization to be used in rivescript, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/texts.js,
    humanization: {Object} humanization object with text words to be used in rivescript, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/humanization.js,
    custom_user: {Object} custom user object controller to send extra data to rivescript by user_data variables, see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/custom_user.js,
    dispatcher: {Object} dispatcher options
    {
        time: {String} time flag to be used in cron,
        function: {FUNCTION} function to dispatch with cron at given time
    },
    database: {Object} database options
    {
        config: {Object} database config used by mysql-promise,
        user_table: {String} the name of user table in your database if any,
        pages_table: {String} the name of pages table in your database if any,
        storage_table: {String} the name of storage table in your database if any,
    },
    facebook: {Object} facebook options
    {
        send_to: {Boolean} flag to tell the messenger controller to send responses to facebook,
        graph_url: {String} the facebook graph API url,
        varsion: {String} the facebook graph API version,
        login_appID: {String} the facebook APP ID used for login,
        login_appSecret: {String} the facebook APP Secret used for login,
        verify_token: {String} token used for the facebook challenge on set webhook,
        pages: {Object} object with facebook pages configured in this bot
        {
            "1327536480592581": {String} the facebook page id (used as key)
            {
                language: {String} language of the page,
                type: {String} environment flag of the page,
                appID: {String} the facebook APP ID used for this bot,
                pageToken: {String} the page token generated by facebook
            }
    }
    },
    botconfig: {Object} bot options
    {
        use_permanent_bot_user: {Boolean} flag to tell the bot if it can use permanent user save or just cache,
        typing_delay: {Boolean} the flag to tell the bot if has any delay in bot response,
        typing_time: {Number} the time used for calculate the delay time in typing (characters per second),
        time_for_typing_on: {Number} the minimum delay time to show 3 dots in bot responses,
        humanize: {Boolean} the flag to tell the bot if it can humanize it's responses,
        humanize_subs: {Boolean} the flag to tell the bot if it can humanize subs in brains,
        typing_error_chance: {Number} the amount of chance of error in bot response (if humanization is on) - from 0.0 to 1.0
    }
 }
*/
exports = module.exports = createApplication;

function createApplication(options)
{
    return new Application(options);
}

/**
 * Constructor
 * @param  {Object} options
 * @return {Object} bot instance
 */
function Application(options)
{
    var self = this;
    options = options || {};
    options.instances = options.instances || {};

    this.configure(options);

    var scriptctl = require('./controllers/script')(options.scripts);
    var attachmentclt = require('./controllers/attachment')(options.attachments);
    var menuctl = require('./controllers/menu')(options.menus, options.texts);
    var updatectl = require('./controllers/update')();

    pagectl = require('./controllers/page')();
    facebookctl = require('./controllers/facebook')(pagectl, attachmentclt, menuctl);
    userctl = require('./controllers/user')(facebookctl, options.custom_user);
    botctl = require('./controllers/bot')(options.instances);
    messenger = require('./controllers/message')(userctl, botctl, scriptctl, updatectl, facebookctl);

    self.utils = {};
    for (var k in utility)
        self.utils[k] = utility[k];

    for (var k in stringutil)
        self.utils[k] = stringutil[k];

    if(options.dispatcher && options.dispatcher.time && options.dispatcher.function)
    {
        cron.schedule(options.dispatcher.time, function()
    	{
    		options.dispatcher.function();
    	});
    }

    return this;
}

/**
 * Configures the bot instance, if you need to change something after the instance is created
 * @param  {Object} options
 */
Application.prototype.configure = function configure(options)
{
    setConfigs(options, botconfig);

    this.config = botconfig;

    if(options.humanization)
    {
        if(options.humanization.words)
            humanization.words = options.humanization.words;

        if(options.humanization.errorwords)
            humanization.errorwords = options.humanization.errorwords;

        if(options.humanization.abbreviations)
            humanization.abbreviations = options.humanization.abbreviations;
    }

    if(options.debug)
    {
        debugutil.debug_enabled = true;
        for (var k in options.debug)
        {
            if(debugutil.hasOwnProperty(k))
                debugutil[k] = options.debug[k];
        }
    }

    if(options.accept_commands_from_user)
        debugutil.accept_commands_from_user = options.accept_commands_from_user;
}

/**
 * Gets the page controller used in this instance
 * @return {Object} page controller
 */
Application.prototype.getPageController = function getPageController()
{
    return pagectl;
}

/**
 * Gets the facebook controller used in this instance
 * @return {Object} facebook controller
 */
Application.prototype.getFacebookController = function getFacebookController()
{
    return facebookctl;
}

/**
 * Gets the bot controller used in this instance
 * @return {Object} bot controller
 */
Application.prototype.getBotController = function getBotController()
{
    return botctl;
}

/**
 * Gets the user controller used in this instance
 * @return {Object} user controller
 */
Application.prototype.getUserController = function getUserController()
{
    return userctl;
}

/**
 * Adds an event listener to the bot messenger controller
 * @param {String} listener name
 *                 {
                      FinishFacebookMessageDispatch
                      FinishAllFacebookMessageDispatch
                      FinishMessageDispatch
                      FinishAllMessageDispatch
                      HandleCustomMessageReplyItems
                   }
 * @param {FUNCTION} the function to be called
 */
Application.prototype.addEventListener = function(listener, func)
{
    if(messenger && messenger['on'+listener]!=undefined)
        messenger['on'+listener] = func;
}

/**
 * Sends a message to messenger
 * @param {Object} event object sent by facebook controller
                   {
                     	fb_page   : {Object} page object
                                    {
                                        id      : {String} page id,
                                        token   : {String} page token
                                    },
                     	sender    : {String} user pid,
                     	type      : {String} message, (message|payload|attachment)
                     	text      : {String} message text,
                     	id        : {String} attachment id,
                     	lang      : {String} message language
                   }
 * @param {object} user_data, if you have a previous loaded userdata, you can send it here
 * @return {Object} a bluebird promisse response
 */
Application.prototype.sendMessengeEvent = function sendMessengeEvent(event, user_data)
{
    return new promise(function(resolve, reject)
	{
        messenger.processMessengeEvent(event, user_data)
        .then(function(response)
        {
            resolve(response);
        });
    });
}

/**
 * Dispatch an event, can dispatch diretctly or using a bot
 * @param {object} event, an event object
 * @return {Object} a bluebird promisse response
 */
Application.prototype.dispatchEvent = function dispatchEvent(event)
{
    return new promise(function(resolve, reject)
	{
        messenger.dispatchEvent(event)
        .then(function(response)
        {
            resolve(response);
        });
    });
}

/**
 * Sends a message diretctly to the bot
 * @param {Object} event object sent by facebook controller
 * @return {Object} a bluebird promisse response
 */
Application.prototype.getBotResponse = function getBotResponse(event)
{
    return new promise(function(resolve, reject)
	{
        botctl.processEvent(event)
        .then(function(response)
        {
            resolve(response);
        });
    });
}

/**
 * Sets the entities as subs to be used by rivescript
 * @param {Object} entities object to be transformed to subs in rivescript - see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/exemple-files/entities.js
 * @param {String} the brain language to be used to fill the subs
 * @return {Object} a bluebird promisse response
 */
Application.prototype.setEntities = function setEntities(entities, lang)
{
    return new promise(function(resolve, reject)
	{
        botctl.setEntities(entities, lang)
        .then(function(response)
        {
            resolve(response);
        });
    });
}

/**
 * A private function to set the bot default config file by a given config sent
 * @param  {String} new_config - The config sent to bot
 * @param  {String} default_config - The config pre seted bu the bot
 */
function setConfigs(new_config, default_config)
{
    for (var k in new_config)
    {
        if (new_config.hasOwnProperty(k) && default_config.hasOwnProperty(k))
        {
            if(typeof(default_config[k])=='object' && typeof(new_config[k])=='object' && k!='pages')
            {
                setConfigs(new_config[k], default_config[k]);
            }
            else
            {
                default_config[k] = new_config[k];
            }

        }
    }
}
