var promise 	= require('bluebird');
var path        = require('path');
var rivescript  = require("rivescript");

var botconfig   = require('../config/botconfig').botconfig;

var botutil 	= require('../utils/botutil');
var stringutil 	= require('../utils/stringutil');
var debugutil 	= require('../utils/debugutil');

exports = module.exports = function(instances)
{
	return new Botctl(instances);
}

function Botctl(instances)
{
    this.bot = {};

    if(instances && instances.length!=undefined)
    {
        for (var i = 0; i < instances.length; i++)
        {
            var bot = instances[i];
            bot.language = bot.language || 'en';
            bot.config = bot.config || {};
            bot.path = bot.path || '';
            bot.variables = bot.variables || {};

            this.bot[bot.language] = {};

            this.bot[bot.language].loaded = false;
            this.bot[bot.language].entities = [];
            this.bot[bot.language].variables = bot.variables;
            this.bot[bot.language].brain = new rivescript(bot.config);

			if(bot.unicodePunctuation)
				this.bot[bot.language].brain.unicodePunctuation = bot.unicodePunctuation;

            this.bot[bot.language].brain.loadDirectory(bot.path, success_handler.bind(null, bot.language, this), error_handler.bind(null, bot.language));
        }
    }
}

Botctl.prototype.setArray = function setArray(name, value, lang)
{
    if (value === void 0)
      return delete this.bot[lang].brain._array[name];
    else
      return this.bot[lang].brain._array[name] = value;
}

Botctl.prototype.setGlobal = function setGlobal(name, value, lang)
{
    return this.bot[lang].brain.setGlobal(name, value);
}

Botctl.prototype.setVariable = function setVariable(name, value, lang)
{
    return this.bot[lang].brain.setVariable(name, value);
}

Botctl.prototype.setUservar = function setUservar(user, name, value, lang)
{
    return this.bot[lang].brain.setUservar(user, name, value);
}

Botctl.prototype.setUservars = function setUservars(user, data, lang)
{
    return this.bot[lang].brain.setUservars(user, data);
}

Botctl.prototype.setSubroutine = function setSubroutine(name, code, lang)
{
    return this.bot[lang].brain.setSubroutine(name, code);
}

Botctl.prototype.setHandler = function setHandler(language_name, obj, lang)
{
    return this.bot[lang].brain.setHandler(language_name, obj);
}

Botctl.prototype.setSubstitution = function setSubstitution(name, value, lang)
{
    return this.bot[lang].brain.setSubstitution(name, value);
}

Botctl.prototype.setPerson = function setPerson(name, value, lang)
{
    return this.bot[lang].brain.setPerson(name, value);
}

Botctl.prototype.getArray = function getArray(lang)
{
    return this.bot[lang].brain._array;
}

Botctl.prototype.getSubstitution = function getSubstitution(lang)
{
    return this.bot[lang].brain._sub;
}

Botctl.prototype.lastMatch = function lastMatch(user, lang)
{
    return this.bot[lang].brain.lastMatch(user);
}

Botctl.prototype.initialMatch = function initialMatch(user, lang)
{
    return this.bot[lang].brain.initialMatch(user);
}

Botctl.prototype.getUserTopicTriggers = function getUserTopicTriggers(user, lang)
{
    return this.bot[lang].brain.getUserTopicTriggers(user);
}

Botctl.prototype.getVariable = function getVariable(user, name, lang)
{
    return this.bot[lang].brain.getVariable(user, name);
}

Botctl.prototype.getUservar = function getUservar(user, name, lang)
{
    return this.bot[lang].brain.getUservar(user, name);
}

Botctl.prototype.getUservars = function getUservars(user, lang)
{
    return this.bot[lang].brain.getUservars(user);
}

//functions
Botctl.prototype.clearUservars = function clearUservars(user, lang)
{
    return this.bot[lang].brain.clearUservars(user);
}

Botctl.prototype.freezeUservars = function freezeUservars(user, lang)
{
    return this.bot[lang].brain.freezeUservars(user);
}

Botctl.prototype.thawUservars = function thawUservars(user, lang)
{
    return this.bot[lang].brain.thawUservars(user);
}

/**
 * Process bot event
 * @param {object} event, an event object, required keys/values: sender, text, lang
 */
Botctl.prototype.processEvent = function processEvent(event)
{
    var self = this;
	return new promise(function(resolve, reject)
	{
		if(!stringutil.isEmail(event.text))
			event.text = stringutil.replaceAll(event.text, '.', '');

		self.bot[event.lang].brain.replyAsync(event.sender, event.text)
        .then(function(response)
        {
            var reply = botutil.getVariablesObjectFromString(response);
            resolve ({reply:reply, event:event});
        })
        .catch(function(error)
        {
            console.log(error);
        });
	});
}

Botctl.prototype.setEntities = function setEntities(entities, lang)
{
    var self = this;
    return new promise(function(resolve, reject)
	{
        entities = entities || [];
        lang = lang || 'en';

		if(self.bot[lang])
		{
	        if(self.bot[lang].loaded)
	        {
	            processEntities(entities, lang)
	            .then(function(response)
	            {
	                resolve(response);
	            });
	        }
	        else
	            self.bot[lang].entities = entities;
		}
    });
}

function success_handler (lang, self)
{
    self.bot[lang].brain.sortReplies();
    self.bot[lang].loaded = true;

    if(self.bot[lang].variables && self.bot[lang].variables.entities)
        processEntities(self,self.bot[lang].variables.entities, lang);

    if(self.bot[lang].entities.length>0)
    {
        processEntities(self, bot[lang].entities, lang);
        self.bot[lang].entities = [];
    }
}

function error_handler (lang, err)
{
	console.log("Error loading brains " + lang + ": " + err + "\n");
}

function processEntities(self, entities, lang)
{
    return new promise(function(resolve, reject)
	{
        var flatentities = JSON.stringify(entities);
        var flatbotarray = JSON.stringify(self.getArray(lang));
        var flatbotsubs = JSON.stringify(self.getSubstitution(lang));

        flatentities += flatbotarray + flatbotsubs;

        for (var i = 0; i < entities.length; i++)
        {
            var entity = entities[i];
            if(entity.hasOwnProperty('name') && entity.hasOwnProperty('entries'))
            {
                var array = [];
                for (var j = 0; j < entity.entries.length; j++)
                {
                    var entry = entity.entries[j];
                    var prefix = entry.hasOwnProperty('prefix') ? entry.prefix + ' ' : '';
                    var vlr = prefix + entry.value;
                    array.push(vlr);

                    if(entry.hasOwnProperty('synonyms'))
                    {
                        for (var s = 0; s < entry.synonyms.length; s++)
                        {
                            var sub = entry.synonyms[s];

                            if(sub!=vlr)
                            {
                                self.setSubstitution(sub, vlr, lang);

                                if(botconfig.humanize_subs)
                                {
                                    for (var c = 0; c < sub.length; c++)
                                    {
                                        var newword = botutil.dropChar(sub, c);

                                        if(flatentities.indexOf('"'+newword+'"')==-1)
                                            self.setSubstitution(newword, vlr, lang);

                                        newword = botutil.switchChar(sub, c);
                                        if(flatentities.indexOf('"'+newword+'"')==-1)
                                            self.setSubstitution(newword, vlr, lang);

                                        //botutil.addTypo(sub, c); will add too much subs
                                    }
                                }
                            }
                        }
                    }
                }

                self.setArray(entity.name, array, lang);
            }
        }
        resolve(true);
    });
}
