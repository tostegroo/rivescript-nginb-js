var promise 		= require('bluebird');

var botconfig   = require('../config/botconfig');
var debugutil   = require('../utils/debugutil');
var stringutil   = require('../utils/stringutil');
var mysql				= require('easy-mysql-promise')(botconfig.database.config);

module.exports = function()
{
	return new Updatectl();
}

function Updatectl(){}

Updatectl.prototype.processUpdate = function processUpdate(sender, page_id, update, current_data)
{
  return new promise(function(resolve)
	{
		if(mysql && typeof update === 'object')
		{
			for (var key in update)
			{
				var table = key;
				var update_data = update[key];

				if(current_data!=undefined)
					update_data = getUpdateValue(update_data, current_data);

				mysql.updateTable(table, update_data, 'sender_id="'+sender+'" AND page_id="'+page_id+'"')
				.then(function(response)
				{
					debugutil.log('update_response', response);
					resolve(response);
				});
			}
		}
		else
			resolve(false);
});
}

function getUpdateValue(update_data, current_data, return_type)
{
	return_type = return_type || 'object';
	var to_update = {};

	for (var k in update_data)
	{
		var key_array = k.split('.');
		var base_key = key_array[0];
		var parm_key = (key_array.length>1) ? key_array[1] : 'value';

		var update_string = update_data[k].toString();
		var current_value = parseInt(update_data[k]);
		current_value = isNaN(current_value) ? update_string : current_value;

		var update_value = current_value;

		if(current_data!=undefined && current_data.hasOwnProperty(base_key))
		{
			current_value = current_data[base_key];
			var newvalue = false;
			
			if(typeof current_value === 'string' && current_value.indexOf('{')!=-1)
			{
				try
				{
					var obj = stringutil.JSONparse(current_value);
					if(obj.hasOwnProperty(parm_key))
					{
						newvalue = getNewValueFromString(update_string, obj[parm_key], update_value);
						obj[parm_key] = newvalue;
					}

					to_update[base_key] = JSON.stringify(obj);
				}
				catch(err)
				{
					to_update[base_key] = current_value;
				}
			}
			else
			{
				newvalue = getNewValueFromString(update_string, current_value, update_value);
				to_update[base_key] = newvalue;
			}
    }
	}

	if(return_type=='string')
		to_update = JSON.stringify(to_update);

	return to_update;
}

function getNewValueFromString(string, current_value, update_value)
{
	var new_value = current_value;

	if(typeof update_value === 'number')
	{
		if(string.indexOf('+')!=-1 || string.indexOf('-')!=-1)
			new_value += update_value;
		else if(string.indexOf('*')!=-1)
			new_value *= update_value;
		else if(string.indexOf('/')!=-1)
			new_value /= update_value;
		else
			new_value = update_value;
	}
	else
		new_value = update_value;

	return new_value;
}
