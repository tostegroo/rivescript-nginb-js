/** @mixin Rivescript_Tags
 * @description Some custom tags use {@link https://developers.facebook.com/docs/messenger-platform/send-api-reference|Facebook Messenger API} format to send messages directly from rivescript
*/

/**
 * @description Adds a facebook button in response line - If the menu has an title, the menu title will be used, if not the title will be the line text<br>
 * <h5>{@link https://developers.facebook.com/docs/messenger-platform/send-api-reference/generic-template|Facebook Reference}</h5>
 * @var template
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <template String|Array|Object Object|Array>
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <template ["Left", "Right"]>
 *
 * //if you only send an array of strings, all payloads will be cmdr(x) where x is the array index + 1, Eg. cmdr1, cmdr2 and so on...
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <template ["Left", "Right", "Maybe"] [1, 0, 1]>
 *
 * //The second param can be an array with integers and is for conditional show of the template, where 1 will hide and 0 shows the template
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <template menu_from_file [1, 0, 1]>
 *
 * //You can call a menu from menu object file, if configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 * ^ <template [\s
 * ^    {\s
 * ^       title: "item 1",\s
 * ^       subtitle: "description 1",\s
 * ^       image_url: "item 1 image",\s
 * ^       buttons:\s
 * ^       [\s
 * ^            {\s
 * ^                title:"button 1",\s
 * ^                webview_height_ratio: "tall",\s
 * ^                messenger_extensions: true,\s
 * ^                send_id: true,\s
 * ^                encode_id: true,\s
 * ^                url: "url"\s
 * ^            }\s
 * ^        ]\s
 * ^     },\s
 * ^     {\s
 * ^        title: "item 2",\s
 * ^        subtitle: "description 2",\s
 * ^        image_url: "item 2 image",\s
 * ^        buttons:\s
 * ^        [\s
 * ^            {\s
 * ^                title:"button 2",\s
 * ^                payload: "cmdopen"\s
 * ^             }\s
 * ^        ]\s
 * ^     }\s
 * ^ ]>\s
 *
 * //This will print the template directly from rivescript
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <template {facebook_id:"1234567891010"} [0, 0, 1]>
 *
 * //You can get a template from a script - the first param can be an object with pair of key/value to pe passed to the function getMenu on menus object configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 */

/**
 * @description Adds a facebook button in response line - If the menu has an title, the menu title will be used, if not the title will be the line text<br>
 * <h5>{@link https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template|Facebook Reference}</h5>
 * @var button
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <button String|Array|Object Object|Array>
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <button ["Left", "Right"]>
 *
 * //if you only send an array of strings, all payloads will be cmdr(x) where x is the array index + 1, Eg. cmdr1, cmdr2 and so on...
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <button ["Left", "Right", "Maybe"] [1, 0, 1]>
 *
 * //The second param can be an array with integers and is for conditional show of the button, where 1 will hide and 0 shows the button
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <button menu_from_file [1, 0, 1]>
 *
 * //You can call a menu from menu object file, if configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 * ^ <button [\s
 * ^    {\s
 * ^        title: "Title",\s
 * ^        webview_height_ratio: "tall",\s
 * ^        messenger_extensions: true,\s
 * ^        url: "https://google.com.br"\s
 * ^    },\s
 * ^    {\s
 * ^        title: "Fly",\s
 * ^        payload: "cmdfly"\s
 * ^    }\s
 * ^ ]>\s
 *
 * //This will print the button directly from rivescript
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <button {facebook_id:"1234567891010"} [0, 0, 1]>
 *
 * //You can get a button from a script - the first param can be an object with pair of key/value to pe passed to the function getMenu on menus object configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 */

/**
 * @description Adds a facebook quickreply in response line, if you use more lines after that, will break the buttons - If the menu has an title, the menu title will be used, if not the title will be the line text
 * <h5>{@link https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies|Facebook Reference}</h5>
 * @var quickreply
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <quickreply String|Array|Object Object|Array>
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <quickreply ["Left", "Right"]>
 *
 * //if you only send an array of strings, all payloads will be cmdr(x) where x is the array index + 1, Eg. cmdr1, cmdr2 and so on...
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <quickreply ["Left", "Right", "Maybe"] [1, 0, 1]>
 *
 * //The second param can be an array with integers and is for conditional show of the button, where 1 will hide and 0 shows the button
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <quickreply menu_from_file [1, 0, 1]>
 *
 * //You can call a menu from menu object file, if configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 * ^ <quickreply [\s
 * ^    {\s
 * ^        content_type: "text",\s
 * ^        title: "Left",\s
 * ^        payload: "Leftcmd"\s
 * ^    },\s
 * ^    {\s
 * ^        content_type: "text",\s
 * ^        title: "Right",\s
 * ^        payload: "rightcmd"\s
 * ^    }\s
 * ^ ]>\s
 *
 * //This will print the quickreply directly from rivescript
 * @example
 * + You can go there
 * - Ok, but what side I must choose?\n
 *  <quickreply {facebook_id:"1234567891010"} [0, 0, 1]>
 *
 * //You can get a quickreply from a script - the first param can be an object with pair of key/value to pe passed to the function getMenu on menus object configured - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/menus.js|template}
 */

/**
 * @description Adds a facebook attachment as a response line - Can be an image, audio or video
 * @var attachment
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <attachment String|Array>
 * @example
 * + Send me a picture
 * - Ok\n
 * ^ <attachment nude>
 *
 * //This will get an attachment named nude from attachment object file
 * @example
 * + Send me some pictures
 * - Ok\n
 * ^ <attachment ["nude", "car", "apple"]>
 *
 * //This will get some attachments from attachment object file
 * @example
 * + Send me some pictures
 * - Ok\n
 * ^ <attachment [\s
 * ^    {\s
 * ^        type: "image",\s
 * ^        url: "http://www.images.com.br/image.jpg"\s
 * ^    },\s
 * ^    {\s
 * ^       type: "audio",\s
 * ^       url: "http://lh5.ggpht.com/audio.mp3"\s
 * ^    }\s
 * ^ ]>\s
 *
 * //This will get some attachments from attachment object file - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/attachments.js|template}
 */



/**
 * @description If statement to be used for conditional words inside rivescript replies
 * @var if
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: {if conditional}String{else conditional}String{/if}
 * @example
 * + What is your gender?
 * - {if gender=="male"}Male{else gender=="what"}?{else}Female{/if}
 */

/**
 * @variation 1
 * @description If statement to be used for conditional a single line
 * @var if
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * usage: <if conditional>
 * @example
 * + What is your status?
 * - <if (health>5&sanity>3|stamina<3)>Ok\n
 * ^ But not so good!
 *
 * //The bot will respond only "But not so good!" If conditions are false and Ok, But not so good! and conditions are true
 */

/**
 * @description If statement to be used for conditional lines, but if the condition is false no more lines will be returned after that
 * @var ifbreak
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * usage: <ifbreak conditional>
 * @example
 * + What is your status?
 * - <ifbreak (health>5&sanity>3|stamina<3)>Ok\n
 * ^ Please Helpe me!
 *
 * //The bot will respond nothing if conditions are false
 */

/**
 * @description Delays a bot response line by a given number of seconds
 * @var delay
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <delay Number>
 * @example
 * + Can you get me a bottle?
 * - Whait...\n
 * ^ <delay 30>I get it! here
 */

/**
 * @description Saves the entire line and pass as variable to be reused
 * @var save
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <save>
 * @example
 * + What is your status?
 * - Good <save>
 *
 * + What is your status again?
 * - <get storage>
 */

/**
 * @description Returns an empty string (can be used for pauses in text)
 * @var nrsp
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <nrsp>
 * @example
 * + What is your status?
 * - <nrsp>
 */

/**
 * @description Custom variable to be used after rivescript response, if you have some data that isn't sent by user data
 * @var var
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <var String>
 * @example
 * + What is your name?
 * - <var first_name>
 */

/**
 * @description Call a bot again from one to X times can be used to redirect after do something on a database, for exemple
 * @var next
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <next String|Array>
 * @example
 * + What is your name?
 * - <next ["nextline", "lastline"]>
 *
 * + nextline
 * - I do not know
 *
 * + lastline
 * - Can you help me remember?
 * @example
 * + What is your name?
 * - <next nextline>
 *
 * + nextline
 * - Mike
 */

/**
 * @description Updates a table with the given data - The object has the keys as the tables names and value as an object with the fields
 * @var update
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <update Object>
 * @example
 * + You can use the health kit
 * - Thanks! <update {tbl_character: {health: "+3", "sanity: "/2","hunger: "*2"}, tbl_user:{email: "besta@gmail.com"}}>
 */

/**
 * @description Calls an external script
 * @var script
 * @instance
 * @memberof Rivescript_Tags
 * @example
 * Usage: <script String|Object|Array Object> or <js String|Object|Array Object>
 * @example
 * + Give some information
 * - OK! <script getDataFromDataBase>
 *
 * //Outside the rivescript
 * function getDataFromDataBase(botData, params)
 * {
 *      //do all the stuff
 * }
 * @example
 * + Give some information about id #
 * - OK! <script getDataFromDataBase {id:"<star>"}>
 *
 * //Outside the rivescript
 * function getDataFromDataBase(botData, params)
 * {
 *      var id = params.id;
 *      //do all the stuff
 * }
 * @example
 * + Give some information and update
 * - OK! <script ["getDataFromDataBase", "updateUserData"]>
 *
 * //Outside the rivescript
 * function getDataFromDataBase(botData, params)
 * {
 *      //do all the stuff
 * }
 * function updateUserData(botData, params)
 * {
 *      //do all the stuff
 * }
 * @example
 * + Give some information
 * - OK! <script [{name: "pause", param:{id:"id", title:"title"}}, {name: "start"}]>
 *
 * //Outside the rivescript
 * function pause(botData, params)
 * {
 *      var id = botData.param.id;
 *      var title = botData.param.title;
 *      //do all the stuff
 * }
 * function start(botData, params)
 * {
 *      //do all the stuff
 * }
 */
