var messagesutil = {}

messagesutil.getMessage = function(error, response, body, custom_message)
{
	var message = {status:false};
	custom_message = custom_message || 'Error';
	if (error)
	{
		message = {
			status: false,
			error_code: 0000,
			error: custom_message,
            data: error
		};
	}
	else
	{
		message = {
			status: true,
            message: 'Response',
			data:
			{
				body: response.body
			}
		};
	}

	return message;
}

messagesutil.getDefaultErrorMessage = function()
{
	return {
		status: false,
		error_code: 0000,
		error: 'Missing entries'
	}
}

module.exports = messagesutil
