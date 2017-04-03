/**
 * @global
 * @mixin Objects
 * @description Some custom objects to be used in NGINB
*/

/**
 * The user response options object
 * @member {Object} UserResponse
 * @instance
 * @memberof Objects
 * @property {Object|Boolean} response - An user object returned by mysql or cache or false if none
 * @property {String} data - The facebook data response
*/

/**
 * The user update response options object
 * @member {Object} UserUpdateResponse
 * @instance
 * @memberof Objects
 * @property {Boolean} status - The status of the response
 * @property {String} data - The user data from the table | cache
*/

/**
 * The bot instance object
 * @member {Object} Bot
 * @instance
 * @memberof Objects
 * @property {String} language - The language of the brain
 * @property {String} path - The path to the rivescript brain files
 * @property {Object} config - A config object to send to {@link https://github.com/aichaos/rivescript-js|rivescript}
 * @property {Object} variables - variables file to fill subs in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/variables.js|template}
*/

/**
 * The options object used for bot configuration
 * @member {Object} Options
 * @instance
 * @memberof Objects
 * @property {String} env - A string with an environment flag
 * @property {Bot[]} instances - Array object with bot instances
 * @property {String} assets_url - The path to assets to be used as attachment,
 * @property {Object} scripts - Scripts object with functions to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/scripts.js|template}
 * @property {Object} attachments - Attachments object with files to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/attachments.js|template}
 * @property {Object} menus - Menus object with menus to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @property {Object} texts - Texts object with text and localization to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/texts.js|template}
 * @property {Object} humanization - Humanization object with text words to be used in rivescript - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/humanization.js|template}
 * @property {Object} custom_user - Custom user object controller to send extra data to rivescript by user_data variables - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/custom_user.js|template}
 * @property {DispatcherConfig} dispatcher - Dispatcher options
 * @property {FacebookConfig} facebook - Facebook options
 * @property {DatabaseConfig} database - Database options
 * @property {BotConfig} botconfig - Bot options
*/

/**
 * The bot options object
 * @member {Object} BotConfig
 * @instance
 * @memberof Objects
 * @property {Boolean} use_permanent_bot_user - A flag to tell the bot if it can use permanent user save or just cache
 * @property {Boolean} typing_delay - A flag to tell the bot if has any delay in bot response
 * @property {Number} typing_time - The time used for calculate the delay time in typing (characters per second)
 * @property {Number} time_for_typing_on - The minimum delay time to show 3 dots in bot responses,
 * @property {Boolean} humanize - The flag to tell the bot if it can humanize it's responses,
 * @property {Boolean} humanize_subs - The flag to tell the bot if it can humanize subs in brains,
 * @property {Number} typing_error_chance - The amount of chance of error in bot response (if humanization is on) - from 0.0 to 1.0
*/

/**
 * The database options object
 * @member {Object} DatabaseConfig
 * @instance
 * @memberof Objects
 * @property {Object} config - A Database config used by {@link https://github.com/martinj/node-mysql-promise|mysql-promise}
 * @property {String} user_table - The name of user table in your database if any
 * @property {String} pages_table - The name of pages table in your database if any
 * @property {String} storage_table - The name of storage table in your database if any
*/

/**
 * The dispatcher options object
 * @member {Object} DispatcherConfig
 * @instance
 * @memberof Objects
 * @property {String} time - time flag to be used in {@link https://github.com/kelektiv/node-cron|node-cron}
 * @property {Function} function - The function to dispatch with cron at given time
*/

/**
 * The facebook options object
 * @member {Object} FacebookConfig
 * @instance
 * @memberof Objects
 * @property {Boolean} send_to - A flag to tell the messenger controller to send responses to facebook
 * @property {String} graph_url - The facebook graph API url
 * @property {String} version - The facebook graph API version
 * @property {String} login_appID - The facebook APP ID used for login
 * @property {String} login_appSecret - The facebook APP Secret used for login
 * @property {String} verify_token - Token used for the facebook challenge on set webhook
 * @property {PageObjectConfig} pages - Object with facebook pages configured in this bot
*/

/**
 * The facebook page object - This object is created with a string as key (page id) and with an object with properties below - Eg: {"123456789789787": {}}
 * @member {Object} PageObjectConfig
 * @instance
 * @memberof Objects
 * @property {String} language - The language of the page
 * @property {String} type - The environment flag of the page
 * @property {String} appID - The facebook APP ID used for this bot
 * @property {String} pageToken - The page token generated by facebook
*/

/**
 * The page object used by the bot to identify the facebook page
 * @member {Object} PageConfig - A facebook config page object
 * @instance
 * @memberof Objects
 * @property {String} id - The id of the page
 * @property {String} token - The token of the page
 * @property {String} language - The language of the page (Optional)
 * @property {Object} data - A callback object (Optional)
 */

/**
 * The event object used by the bot
 * @member {Object} Event - Object sent by facebook controller
 * @instance
 * @memberof Objects
 * @property {PageConfig} fb_page - A page object
 * @property {String} sender - The facebook user pid
 * @property {String} type - The type of the message (message|payload|attachment)
 * @property {String} text - The message text,
 * @property {String} id - The attachment id,
 * @property {String} lang - The message language
 */

/**
 * The word object used by entities
 * @member {Object} WordConfig - Object of entities used for subs in rivescript
 * @instance
 * @memberof Objects
 * @property {String} value - The base word
 * @property {Array} synonyms - The word array with the synonyms
 */

/**
 * The entity object used by the bot
 * @member {Object} EntityConfig - Object of entities used for subs in rivescript
 * @instance
 * @memberof Objects
 * @property {String} name - The name of the entity
 * @property {WordConfig[]} entries - The array of words and it's synonyms
 */
