var debug_enabled = true;

var debugutil =
{
	sqlerror: false,
	dispatchcomplete: false,
	userdataupdate: false,
	attachment_debug: false,
	event_response: false,
	user_response: false,
	message_dispatched: false,
	facebook_send_object: false,
	facebook_template_object: false,
	facebook_response: false,
	update_response: false,
	bot_userdata: false,
};

debugutil.accept_commands_from_user = false;

debugutil.debug = function(key)
{
	var response = {haskey: false, canlog: true};

	if(debugutil.hasOwnProperty(key))
	{
		response.haskey = true;
		response.canlog =  debugutil[key];
	}

	return response;
}

debugutil.info = function(key)
{
	var debug = debugutil.debug(key);
	if(debug_enabled && debug.canlog)
	{
		var args = Array.prototype.slice.call(arguments);

		if(debug.haskey)
			args.shift();

		console.info.apply(console, args);
	}
}

debugutil.log = function(key)
{
	var debug = debugutil.debug(key);
	if(debug_enabled && debug.canlog)
	{
		var args = Array.prototype.slice.call(arguments);

		if(debug.haskey)
			args.shift();

		console.log.apply(console, args);
	}
}

debugutil.warn = function(key)
{
	var debug = debugutil.debug(key);
	if(debug_enabled && debug.canlog)
	{
		var args = Array.prototype.slice.call(arguments);

		if(debug.haskey)
			args.shift();

		console.warn.apply(console, args);
	}
}

debugutil.error = function(key)
{
	var debug = debugutil.debug(key);
	if(debug_enabled && debug.canlog)
	{
		var args = Array.prototype.slice.call(arguments);

		if(debug.haskey)
			args.shift();

		console.warn.apply(console, args);
	}
}

module.exports = debugutil;
