var evalutil = {};

evalutil.eval = function eval(string)
{
	var regex = /^(.*?[\d|"|'|e]\s?(?:[<|>|=|!]==?|<|>)\s?[\d|"|'|\t|\f].*?)\s?[?]\s?(.*?)\s?[:]\s?(.*)$/gi;
	var matches = regex.exec(string);
	if(matches)
	{
		var operation = matches[1];
		var left = matches[2];
		var right = matches[3];

		if(evalutil.operateGroup(operation))
			return evalutil.eval(left);
		else
			return evalutil.eval(right);
	}
	else
		return evalutil.operateGroup(string);
}

evalutil.operateGroup = function operateGroup(string)
{
	var return_value = true;
	
	var regex = /\(([^(^)]*)\)/gi;
	var matches = regex.exec(string);
	if(matches)
	{
		var replaceable = matches[0];
		var value = matches[1];

		var logivalValue = evalutil.operateLogical(value);
		string = string.split(replaceable).join(logivalValue);

		return_value = evalutil.operateGroup(string);
	}
	else
		return_value = evalutil.operateLogical(string);

	return _normalizeValue(return_value);
}

evalutil.operateLogical = function operateLogical(string)
{
	var return_value = true;

	var regex = /^(.*?)\s?(\|+)\s?(.*)$|^(.*?)\s?(&+)\s?(.*)$/gi;
	var matches = regex.exec(string);
	if(matches)
	{
		var left = matches[1] || matches[4];
		var logical = matches[2] || matches[5];
		var right = matches[3] || matches[6];

		logical = logical.indexOf('|')!=-1 ? '||' : logical;
		logical = logical.indexOf('&')!=-1 ? '&&' : logical;

		left = left.indexOf('&')==-1 && left.indexOf('|')==-1 ? evalutil.operateComparison(left) : evalutil.operateLogical(left);
		right = right.indexOf('&')==-1 && right.indexOf('|')==-1 ? evalutil.operateComparison(right) : evalutil.operateLogical(right);
		
		left = _normalizeValue(left);
		right = _normalizeValue(right);

		switch (logical)
		{
			case "&&":
				return_value = left && right;
				break;
			case "||":
				return_value = left || right;
				break;
		}
	}
	else
		return_value = evalutil.operateComparison(string);

	return return_value;
}

evalutil.operateComparison = function operateComparison(string)
{
	var return_value = true;

	var regex = /^(.*[\d|"|'|e])\s?([=|!]==?|<=?|>=?)\s?([\d|"|'|\t|\f\-+].*)$/gi;
	var matches = regex.exec(string);
	if(matches != null)
	{
		var left = matches[1];
		var comparison = matches[2];
		var right = matches[3];

		left = _normalizeValue(left);
		right = _normalizeValue(right);

		switch (comparison)
		{
			case "==":
				return_value = left == right;
				break;
			case "===":
				return_value = left === right;
				break;
			case "!=":
				return_value = left != right;
				break;
			case "!==":
				return_value = left !== right;
				break;
			case "<=":
				return_value = left <= right;
				break;
			case ">=":
				return_value = left >= right;
				break;
			case "<":
				return_value = left < right;
				break;
			case ">":
				return_value = left > right;
				break;
		}
	}
	else
		return_value = string;

	return return_value;
}

function _normalizeValue(value)
{
	value = value == 'true' || value == '!false' ? true : value;
	value = value == 'false' || value == '!true' ? false : value;

	return value;
}

module.exports = evalutil;