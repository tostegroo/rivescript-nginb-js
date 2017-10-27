var JSONbig 		= require('json-bigint');

module.exports = function(scripts)
{
	return new Actionctl(scripts);
}

function Actionctl(scripts)
{
	scripts = scripts || false;
	this.scripts = scripts;
}

Actionctl.prototype.getAction = function getAction(name)
{
	var self = this;

	if(typeof self.scripts[name] === 'function')
		return {name:name};
	else if(self.scripts.hasOwnProperty(name))
		return self.scripts[name];
	else
		return false;
}

Actionctl.prototype.getFunctionObject = function getActionObject(string)
{
	var function_object = {};

	if(string!=null && string!='')
	{
		try{function_object = JSONbig.parse(string);}
		catch(err){console.log('get script', err);}

		if(typeof function_object === 'object' && function_object.length==undefined)
			function_object = [function_object];
	}

	return function_object;
}

Actionctl.prototype.processFunction = function(sender, page_id, func, data, params)
{
	var self = this;
	var functions = [];
	var func_return = false;

	if(typeof func === 'string' || typeof func === 'object' && func.length==undefined)
		functions.push(func);
	else
		functions = func;

	for(var i=0; i<functions.length; i++)
	{
		var func_item = functions[i];

		if(typeof func_item === 'string')
			func_item = self.getAction(func_item);

		var sa_return = self.doAction(sender, page_id, func_item, data, params);

		if(sa_return)
			func_return = sa_return;
	}

	return func_return;
}

Actionctl.prototype.doAction = function(sender, page_id, func, data, params)
{
	var self = this;
	var function_return = false;

	if(func.hasOwnProperty('name'))
	{
		if(self.scripts[func.name])
		{
			var func_param = func.hasOwnProperty('param') ? func.param : {};
			var event_data = data!=undefined ? data : {};

			var funcData =
			{
				sender: sender,
				page_id: page_id,
				event_data: event_data,
				param : func_param
			}

			function_return = self.scripts[func.name](funcData, params);
		}
	}

	function_return = function_return || false;

	return function_return;
}
