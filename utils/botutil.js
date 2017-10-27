var botconfig       = require('../config/botconfig');
var humanization    = require('../config/humanization');

var stringutil      = require('./stringutil');
var utility         = require('./utility');
var mathutil        = require('./mathutil');

var botutil = {};

botutil.getVariablesObjectFromString = function getVariablesObjectFromString(string, data)
{
	string = stringutil.replaceAll(string, '\t', '');
	string = stringutil.replacePath(string, botconfig);

	var return_object = [];
	var return_item = {};
	var return_string = '';
	var string_array = string.split('\n');

	var totallines = string_array.length;
	for(var i=0; i<totallines; i++)
	{
		return_item = {};
		return_string = string_array[i];

		var matches = null;
		var regex = /<nrsp>|<br>|<(save)>|<(.*?) (\{.*?\}|\(.*?\)|".*?"|\[.*?\]|.*?)\s?(\[.*?\]|\{.*?\})?>/gi;
		while ((matches = regex.exec(string_array[i])) != null)
		{
			if(matches!=null)
			{
				var replaceable = matches[0];
				var save = matches[1];
				var key = matches[2];
				key = key=='js' ? 'script' : key;

				var value = matches[3];
				var params = matches[4];

				if(save!=undefined)
				{
					var storageString = stringutil.replaceAll(string_array[i], replaceable, '');
					return_item['storage'] = storageString;

					return_string = stringutil.replaceAll(return_string, replaceable, '');
				}
				else if(key!=undefined && key!='var' && value!=undefined)
				{
					if(value.indexOf('{')!=-1 || value.indexOf('[')!=-1)
					{
						try{value = stringutil.JSONparse(value);}
						catch(err){value = []; console.log('get value error:', err)}
					}

					if(params!=undefined && (params.indexOf('{')!=-1 || params.indexOf('[')!=-1))
					{
						try{params = stringutil.JSONparse(params);}
						catch(err){params = []; console.log('get params error:', err)}

						return_item[key+'_params'] = params;
					}

					if(typeof value === 'string')
						value = value.replace(/^("|')(.*?)("|')$/gi, '$2');

					return_item[key] = value;
					return_string = stringutil.replaceAll(return_string, replaceable, '');
				}
				else
				{
					if(replaceable=='<br>')
						return_string = stringutil.replaceAll(return_string, replaceable, '\n');
					else if(replaceable=='<nrsp>')
						return_string = '';
					else if(key!='var')
						return_string = stringutil.replaceAll(return_string, replaceable, '');
				}
			}
		}

		return_string = return_string.trim();
		return_string = botutil.evaluateConditions(return_string, data);
		
		return_item.text = return_string;
		return_object.push(return_item);
	}

	return return_object;
}

botutil.replaceVariable = function replaceVariable(string, replace_data)
{
	var response = string;

	if(string.indexOf('<var')!=-1)
	{
		var matches = null;
		var regex = /<var (.*?)>/gi;
		while ((matches = regex.exec(string)) != null)
		{
			if(matches!=null)
			{
				var replaceable = matches[0];
				var key = matches[1];
				if(typeof key === 'string')
					key = key.replace(/^("|')(.*?)("|')$/gi, '$2');

				var to_reaplace = '';

				if(replace_data.hasOwnProperty(key))
				{
					to_reaplace = replace_data[key];
					to_reaplace = utility.getMultipleValuesFromString(key, to_reaplace).value;
				}

				response = stringutil.replaceAll(response, replaceable, to_reaplace);
			}
		}
	}

	return response;
}

botutil.evaluateConditions = function evaluateConditions(string, data)
{
	var response = string;

	var matches = null;
	var ifregex = /^({if(?:.*?)\/if})$/gi;
	while ((matches = ifregex.exec(string)) != null)
	{
		if(matches!=null)
		{
			var replaceable = matches[0];

			console.log(replaceable)

			var value = "";
			var cmatches = null;
			var condregex = /{(?:if|else)\s?(.*?)}\s*([\w\d".]*)/gi;
			while ((cmatches = condregex.exec(replaceable)) != null)
			{
				if(cmatches!=null)
				{
					var condition = cmatches[1];
					var vlr = cmatches[2];

					console.log(condition, vlr)

					var comp = condition=='' ? true : utility.if(condition, data);

					if(comp)
					{
						value = vlr;
						break;
					}
				}
			}

			response = stringutil.replaceAll(response, replaceable, value);
		}
	}

	return response;
}

botutil.getTypingDelay = function getTypingDelay(string)
{
	var delay = 0;
	var variation = 0;

	if(string!=undefined)
	{
		var stringLength = string.length;

		stringLength = isNaN(stringLength) ? 0 : stringLength
		variation = 200 + (Math.random() * 300);
		delay = stringLength/botconfig.botconfig.typing_time * 1000;

		return delay + variation;
	}
}

/**
 * Humanize string add typos, letter switch, etc
 * @param {string} string, a string to humanize
 * @param {string} lang, the language that bot will use to make changes
 * @param {number} chance, the chance of error a value from 0 to 1, where 0 is for no error and 1 for maximum error. If not seted use the botconfig value
 * @param {boolean} byword, get error by word from humazine config file
 */
botutil.humanizeString = function humanizeString(string, lang, chance, byword)
{
	var new_string = string;
	byword = byword || false;

	chance = chance || botconfig.botconfig.typing_error_chance;
	chance = (chance<0) ? 0 : chance;
	chance = (chance>1) ? 1 : chance;

	if(chance>0)
	{
		var words = string.split(' ');
		var wordslength = words.length;
		var errors = 0;
		var i = 0;
		var index;

		if(byword)
		{
			errors = mathutil.getBinomial(wordslength, chance);

			for (i = 0; i < errors; i++)
			{
				index = Math.floor(Math.random() * wordslength);
				var word = words[index];
				word = stringutil.normalize(word);

				if(humanization.errorwords[lang]!=undefined && humanization.errorwords[lang].hasOwnProperty(word))
				{
					if(humanization.words[lang][word].length>0)
					{
						var error_index = Math.floor(Math.random() * humanization.words[lang][word].length);
						var errorWord = humanization.words[lang][word][error_index];

						new_string = new_string.replace(word, errorWord);
						words.splice(index, 1);
					}
				}
			}
		}
		else
		{
			errors = mathutil.getPoissonToste(chance);

			new_string = stringutil.accentFold(new_string, chance);
			new_string = botutil.abbreviate(new_string, chance, lang);

			var stringlength = new_string.length;
			for (i = 0; i < errors; i++)
			{
				index = Math.floor(Math.random() * stringlength);
				var kick = Math.floor(Math.random() * 3);

				if(kick==0)
					new_string = botutil.addTypo(new_string, index);
				else if(kick==1)
					new_string = botutil.dropChar(new_string, index);
				else if(kick==2)
					new_string = botutil.switchChar(new_string, index);
			}
		}
	}

	return new_string;
}

botutil.dropChar = function dropChar(string, index)
{
	var new_string = string;
	new_string = new_string.substring(0, index) + '' + new_string.substring(index + 1);

	return new_string;
}

botutil.switchChar = function switchChar(string, index)
{
	var new_string = string;
	var chars = string.substr(index, 2);
	var char0 = (chars[0]) ? chars[0] : '';
	var char1 = (chars[1]) ? chars[1] : '';

	new_string = new_string.substring(0, index) + char1 + char0 + new_string.substring(index + 2);

	return new_string;
}

botutil.addTypo = function addTypo(string, index)
{
	var new_string = string;
	var char = new_string.substr(index, 1);

	var key = char;
	key = (key==" ") ? "spc" : key;
	key = (key=="?") ? "qst" : key;
	key = (key==",") ? "com" : key;
	key = (key==".") ? "dot" : key;

	if(humanization.typos.hasOwnProperty(key))
	{
		var replace_array = humanization.typos[key];
		var replace_length = replace_array.length;

		var idx = Math.pow(Math.random(), 4.1);
		idx = Math.floor(idx * replace_length);

		var toreplace = replace_array[idx];
		toreplace = (toreplace=="caps") ? toreplace.toUppercase() : toreplace;

		new_string = new_string.replace(char, toreplace);
	}

  return new_string;
}

botutil.abbreviate = function abbreviate(string, percentage, lang)
{
	lang = lang || 'en';
	percentage = percentage || 1;

	var new_string = string;

	if(humanization.abbreviations[lang]!=undefined)
	{
		var compare_string = stringutil.normalize(string);
		var words = [];
		var key, index;
		for(var k in humanization.abbreviations[lang])
		{
			key = stringutil.replaceAll(k, '_', ' ');

			index = compare_string.indexOf(key);
			if(index!=-1)
				words.push({data:humanization.abbreviations[lang][k], index:index, length:key.length});
		}

		var wordslength = words.length;
		var wordscount = Math.floor((wordslength * percentage) + (percentage * 1.5 * Math.random()));
		wordscount = (wordscount>wordslength) ? wordslength : wordscount;

		for (var i = 0; i < wordscount; i++)
		{
			index = Math.floor(Math.random() * wordslength);
			var kick = Math.floor(Math.random() * words[index].data.length);

			var abbreviation = words[index].data[kick];
			var str_ini_idx = words[index].index;
			var str_end_idx = words[index].index + words[index].length;
			key = new_string.substring(str_ini_idx, str_end_idx);

			new_string = new_string.replace(key, abbreviation);
		}
	}

  return new_string;
}

module.exports = botutil
