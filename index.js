/**
 * NGINB - A Rivescript-Node engine to make bots interaction with Facebook Messenger and Databases easier
 * @namespace NGINB
 * @version 0.1.5
 * @author Fabio Toste <tostegroo@gmail.com>
 */

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
var menuctl         = false;

exports = module.exports = createApplication;

/**
 * @constructs NGINB
 * @public
 * @param  {BotOptions} options - Bot options object
 * @return {Object} A bot instance
 */
function createApplication(options)
{
    return new NGINB(options);
}

/**
 * @constructor
 * @class
 * @param  {BotOptions} options - Bot options object
 * @return {Object} A bot instance
 */
function NGINB(options)
{
    var self = this;
    options = options || {};
    options.instances = options.instances || {};

    this.configure(options);

    var scriptctl = require('./controllers/script')(options.scripts);
    var attachmentclt = require('./controllers/attachment')(options.attachments);
    menuctl = require('./controllers/menu')(options.menus, options.texts);
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
 * @public
 * @param  {BotOptions} options - Bot options object
 */
NGINB.prototype.configure = function configure(options)
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
 * Gets the menu controller used in this instance
 * @return {Menu_Controller} A menu controller
 */
NGINB.prototype.getMenuController = function getPageController()
{
    return menuctl;
}

/**
 * Gets the page controller used in this instance
 * @return {Page_Controller} A page controller
 */
NGINB.prototype.getPageController = function getPageController()
{
    return pagectl;
}

/**
 * Gets the facebook controller used in this instance
 * @return {Facebook_Controller} A facebook controller
 *
 */
NGINB.prototype.getFacebookController = function getFacebookController()
{
    return facebookctl;
}

/**
 * Gets the bot controller used in this instance
 * @return {Bot_Controller} A bot controller
 */
NGINB.prototype.getBotController = function getBotController()
{
    return botctl;
}

/**
 * Gets the user controller used in this instance
 * @return {User_Controller} An user controller
 */
NGINB.prototype.getUserController = function getUserController()
{
    return userctl;
}

/**
 * Adds an event listener to the bot messenger controller
 * @public
 * @param {String} listener - A string with one of the listeners:<br>
                              <b>FinishFacebookMessageDispatch</b><br>
                              <b>FinishAllFacebookMessageDispatch</b><br>
                              <b>FinishMessageDispatch</b><br>
                              <b>FinishAllMessageDispatch</b><br>
                              <b>HandleCustomMessageReplyItems</b>
 * @param {Function} callback - The function to be called on event
 */
NGINB.prototype.addEventListener = function(listener, callback)
{
    if(messenger && messenger['on'+listener]!=undefined)
        messenger['on'+listener] = callback;
}

/**
 * Sends a message to messenger
 * @param {Event} event - An event object
 * @param {Object} user_data - If you have a previous loaded userdata, you can send it here
 * @return {Object} A bluebird promisse response
 */
NGINB.prototype.sendMessageEvent = function sendMessageEvent(event, user_data)
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
 * @param {Event} event - An event object
 * @return {Object} A bluebird promisse response
 */
NGINB.prototype.dispatchEvent = function dispatchEvent(event)
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
 * @param {Event} event - An Event object sent by facebook controller
 * @return {Object} A bluebird promisse response
 */
NGINB.prototype.getBotResponse = function getBotResponse(event)
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
 * @param {EntityConfig[]} entities - An object to be transformed to subs in rivescript - see: https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/entities.js
 * @param {String} lang - The brain language to be used to fill the subs
 * @return {Object} A bluebird promisse response
 */
NGINB.prototype.setEntities = function setEntities(entities, lang)
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
 * @private
 * @param  {String} new_config - The config sent
 * @param  {String} default_config - The default config object
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
