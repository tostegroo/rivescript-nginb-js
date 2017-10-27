var evalutil = require('./evalutil');
var stringutil = require('./stringutil');

var utility = {};

utility.if = function (string, comparation_data, return_boolean) {
	var return_value = true;
	if (string != undefined)
		return_value = _evaluateComparation(string, comparation_data);

	if(return_boolean==true&& typeof return_value !== "boolean")
		return_value = false;

	return return_value;
}

utility.getNormalizeMultipleValues = function getNormalizeMultipleValues(object) {
	for (var key in object) {
		var value = object[key];
		if (typeof (value) == 'string' && value.indexOf('{') != -1) {
			try {
				var obj = stringutil.JSONparse(value);
				for (var k in obj) {
					if (k == 'value')
						object[key] = obj[k];
					else
						object[key + '.' + k] = obj[k];
				}
			}
			catch (err) { console.log(err); }
		}
	}

	return object;
}

utility.getMultipleValuesFromString = function getMultipleValuesFromString(key, string) {
	var return_object = { value: string };

	if (typeof (string) == 'string' && string.indexOf('{') != -1) {
		try {
			var obj = stringutil.JSONparse(string);
			for (var k in obj) {
				if (k == 'value')
					return_object[k] = obj[k];
				else
					return_object[key + '.' + k] = obj[k];
			}
		}
		catch (err) { console.log(err); }
	}

	return return_object;
}

utility.getValueFromKeyString = function getValueFromKeyString(key, string) {
	var return_value = string;

	if (typeof (string) == 'string' && string.indexOf('{') != -1) {
		try {
			var obj = stringutil.JSONparse(string);
			for (var k in obj) {
				if (k == key) {
					return_value = obj[k];
					break;
				}
			}
		}
		catch (err) { console.log(err); }
	}

	return return_value;
}

/*** Private Funcitons */
function _evaluateComparation(string, comparation_data) 
{
	var comparation_string = _getComparationString(string, comparation_data);

	console.log(comparation_string);
	return evalutil.eval(comparation_string);
}

function _getComparationString(string, comparation_data)
{
	if(comparation_data==undefined)
		return string;

	var regex = /([\w\d".]*)([<>!=]?=|[<>])([\w\d".]*)/g;
	var return_string = string;

	var matches = null;
	while ((matches = regex.exec(string)) != null)
	{
		if(matches!=null)
		{
			var replaceable = matches[1];
			var value = matches[1];
			var compareValue = value;

			if(value.indexOf('"')==-1&&isNaN(value))
			{
				value = _getDataValue(value, comparation_data);

				compareValue = parseInt(value);
				compareValue = isNaN(compareValue) ? '"'+value+'"' : compareValue;
				return_string = stringutil.replaceAll(return_string, replaceable, compareValue);
			}

			value = matches[3];
			if(value.indexOf('"')==-1&&isNaN(value))
			{
				replaceable = value;
				compareValue = value;

				value = _getDataValue(value, comparation_data);

				compareValue = parseInt(value);
				compareValue = isNaN(compareValue) ? '"'+value+'"' : compareValue;
				return_string = stringutil.replaceAll(return_string, replaceable, compareValue);
			}

		}
	}

	return return_string;
}

function _getDataValue(key, data)
{
	if(key.indexOf('.')!=-1 && data.hasOwnProperty(key))
		return data.key;

	var key_array = key.split('.');
	var baseKey = key_array[0];
	var paramKey = 'value';

	if(key_array.length>1)
		paramKey = key_array[1];

	if(data.hasOwnProperty(baseKey))
		return utility.getValueFromKeyString(paramKey, data[baseKey]);

	return key;
}

module.exports = utility
