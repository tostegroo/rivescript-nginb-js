var stringutil = {};

stringutil.isEmail = function isEmail(string)
{
	var pattern = /^.*?@.*?$/i;
	return pattern.test(string);
}

stringutil.unicodeEscape = function unicodeEscape(string) 
{
	return string.replace(/[\u007f-\uffff]/g,
		function(c) { 
			return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
		}
	);
}

stringutil.replacePath = function replacePath(string, config)
{
	var regex = /\{\$(.*?)_path\}/gi;
	var return_string = string;
	var matches = null;
	
	while ((matches = regex.exec(string)) != null)
	{
		if(matches!=null)
		{
			var replaceable = matches[0];
			var key = matches[1];

			if(config[key+'_path']!=undefined)
				return_string = stringutil.replaceAll(return_string, replaceable, config[key+'_path']);
		}
	}

	return return_string;
}

stringutil.makeKey = function makeKey(string)
{
	var newstring = "";
	if(string)
	{
		newstring = stringutil.normalize(string);
		newstring = stringutil.replaceAll(newstring, '+', ' ');
		newstring = stringutil.replaceAll(newstring, ' ', '_');
	}

	return  newstring;
}

stringutil.JSONparse = function JSONparse(string, returnParsed)
{
	returnParsed = returnParsed || true;

	string = string.replace(/([^:\s][\n\t\r\s*{[]\s*?)([\d\w])(.*?):/gi, '$1 "$2$3":');
	string = stringutil.replaceAll(string, 'False', 'false');
	string = stringutil.replaceAll(string, 'True', 'true');
	
	if(returnParsed)
	{
		return JSON.parse(string);
	}
	else
		return string;
}

stringutil.getStringFromArray = function getStringFromArray(string)
{
	if(typeof string !== 'string')
		return string;

	if(string.indexOf('[')==-1)
		return string;
	else
	{
		try
		{
			var obj = stringutil.JSONparse(string);
			if(obj.length!=undefined)
			{
				var kick = Math.floor(Math.random() * obj.length);
				return obj[kick];
			}
			else
				console.log('Error parsing the string');
				return '';
		}
		catch(err)
		{
			return '';
		}
	}
}

stringutil.getStringValue = function getStringValue(value)
{
	var return_value = '';
	switch(typeof value)
	{
		case 'string':
			return_value = "'" + value + "'";
			break;

		case 'number':
			return_value = value;
			break;

		case 'object':
			if(value==null)
				return_value = value;
			else
			{
				var valuestring = JSON.stringify(value);
				return_value = "'" + valuestring + "'";
			}
			break;

		default:
			return_value = "'" + value + "'";
			break;
	}

  return return_value;
}

stringutil.replaceAll = function replaceAll(string, target, replacement)
{
	return string.split(target).join(replacement);
};

stringutil.normalize = function normalize(string)
{
	var newstring = "";
	if(string)
	{
		string = string.toString();
		newstring = string.toLowerCase();
		newstring = newstring.trim();
		newstring = stringutil.accentFold(newstring);
	}

	return  newstring;
}

stringutil.makeSlug = function makeSlug(string)
{
	var newstring = "";
	if(string)
	{
		newstring = stringutil.normalize(string);
		newstring = stringutil.replaceAll(newstring, '+', ' ');
		newstring = stringutil.replaceAll(newstring, ' ', '-');
		newstring = stringutil.replaceAll(newstring, '//', '/');
	}

	return  newstring;
}

stringutil.accentFold = function accentFold(string, percentage)
{
	percentage = percentage || 1;

	var ret = '';
	var accent_map =
	{
		'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', // a
		'ç': 'c',                                                   // c
		'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',                     // e
		'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',                     // i
		'ñ': 'n',                                                   // n
		'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', // o
		'ß': 's',                                                   // s
		'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',                     // u
		'ÿ': 'y'                                                    // y
	};

	if (!string) { return ''; }

	if(percentage < 1)
	{
		ret = string;
		var i = 0;
		var toreplace = [];
		for (i = 0; i < string.length; i++)
		{
			if(accent_map[string.charAt(i)])
				toreplace.push({char:string.charAt(i), replace:accent_map[string.charAt(i)]});
		}

		var charlength = toreplace.length;
		var vlr = (charlength * percentage) + (percentage * 1.5 * Math.random());
		var charcount = Math.floor(vlr);
		charcount = (charcount>charlength) ? charlength : charcount;

		for (i = 0; i < charcount; i++)
		{
			var index = Math.floor(Math.random() * charlength);
			var char = toreplace[index].char;
			var replace = toreplace[index].replace;

			ret = ret.replace(char, replace);
		}
	}
	else
	{
		for (i = 0; i < string.length; i++)
			ret += accent_map[string.charAt(i)] || string.charAt(i);
	}

	return ret;
}

stringutil.isURL = function isURL(string)
{
	var pattern = /^(?:(?:https?|ftp):\/\/)/gi;
	return pattern.test(string);
}

stringutil.getFileType = function getFileType(string)
{
	var file_map = 
	{
		mp3: "audio", ogg: "audio", m4a: "audio", mpc: "audio", aac: "audio", aiff: "audio", wav: "audio",
		mp4: "video", mkv: "video", flv: "video", avi: "video", m4v: "video", rm: "video", m4p: "video", mov: "video", f4v: "video",
		jpg: "image", jpeg: "video", gif: "video", png: "image", tiff: "image"
	}

	var matches = null;
	var pattern = /\.([0-9a-z]*)$|(^data:(.*)\/)/gi;
	while ((matches = pattern.exec(string)) != null)
	{
		if(matches!=null)
		{
			var ext = matches[1];
			var data = matches[2];
			var type = matches[3];

			if(data)
				return type;
			else if(ext)
			{
				if(file_map[ext])
					return file_map[ext];
			}
		}
	}

	return false;
}

stringutil.tcEncode = function tcEncode(string)
{
	var response = '';
	var encode_map =
	{
		'1': 'c',
		'2': 'G',
		'3': 'A',
		'4': 's',
		'5': 'J',
		'6': 'k',
		'7': 'l',
		'8': 'U',
		'9': 'f',
		'0': 'H'
	};

	for (var i = 0; i < string.length; i++)
		response += encode_map[string.charAt(i)] || string.charAt(i);

	return response;
}

stringutil.tcDecode = function tcDecode(string)
{
	var response = '';
	var decode_map =
	{
		'c': '1',
		'G': '2',
		'A': '3',
		's': '4',
		'J': '5',
		'k': '6',
		'l': '7',
		'U': '8',
		'f': '9',
		'H': '0'
	};

	for (var i = 0; i < string.length; i++)
		response += decode_map[string.charAt(i)] || string.charAt(i);

	return response;
}

module.exports = stringutil
