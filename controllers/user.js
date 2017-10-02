var promise 		= require('bluebird');
var JSONbig 		= require('json-bigint');
var botconfig 		= require('../config/botconfig');
var usermodel 		= require('../models/user')(botconfig.database.config);
var customuserctl 	= false;
var facebookctl 	= false;

module.exports = function(facebookcontroller, customusercontroller)
{
	return new Userctl(facebookcontroller, customusercontroller);
}

/**
 * @constructs User_Controller
 * @public
 * @param {Object} facebookcontroller - A NGINB facebook controller
 * @param {Object} customusercontroller - A custom user controller - {@link https://github.com/tostegroo/rivescript-nginb-js/blob/master/template-files/userctl.js|template}
 */
function Userctl(facebookcontroller, customusercontroller)
{
	this.user_cache = {};

	customuserctl = customusercontroller || false;
	facebookctl = facebookcontroller || false;
}

/**
 * Gets the user data from bot local user data plus custom user data
 * @param {String} sender_id - The facebook sender id
 * @param {PageConfig} page - A PageConfig object
 * @param {String} lang - The language of the menu for multilanguage menus
 * @return {Object|Boolean} A bluebird promise response object with user data or false if none
 */
Userctl.prototype.getUserData = function getUserData(sender_id, page, lang)
{
	var _this = this;
	return new promise(function(resolve)
	{
		_this.getUser(sender_id, page)
		.then(function(user_response)
		{
			if(user_response)
			{
				if(customuserctl!=false && customuserctl.getUserData!=undefined)
				{
					customuserctl.getUserData(user_response, sender_id, page, lang)
					.then(function(final_user_response)
					{
						resolve(final_user_response);
					});
				}
				else
					resolve(user_response);
			}
			else
				resolve(false);
		});
	});
}

/**
 * Gets the user data from bot local user data
 * @param {String} sender_id - The facebook sender id
 * @param {PageConfig} page - A PageConfig object
 * @return {Object|Boolean} A bluebird promise response object with user data or false if none
 */
Userctl.prototype.getUser = function getUser(sender_id, page)
{
	var _this = this;
	return new promise(function(resolve)
	{
		if(usermodel)
		{
			usermodel.getUser(sender_id)
			.then(function(user)
			{
				if(user)
					resolve(user);
				else
				{
					_this.addUser(sender_id, page)
					.then(function(new_user)
					{
						if(new_user.response)
							resolve(new_user.response);
						else
						{
							if(_this.user_cache[sender_id]==undefined)
								_this.user_cache[sender_id] = new_user.data;

							resolve(_this.user_cache[sender_id]);
						}
					});
				}
			});
		}
		else
			resolve(false);
	});
}

/**
 * Gets the user data from bot local user data by a given name
 * @param {String} name - The name of the user
 * @return {Object|Boolean} A bluebird promise response object with user data or false if none
 */
Userctl.prototype.getUserByName = function getUsers(name)
{
	var _this = this;
	return new promise(function(resolve)
	{
		if(usermodel)
		{
			usermodel.getUserByName(name)
			.then(function(user)
			{
				if(user)
				{
					if(user.length!=undefined)
						resolve(user[0]);
					else
						resolve(user);
				}
				else
				{
					var curr_user = false;
					for (var key in _this.user_cache)
					{
						var cache_user = _this.user_cache[key];
						if(user.first_name.toLowerCase() == name.toLowerCase() || cache_user.last_name.toLowerCase() == name.toLowerCase())
						{
							curr_user = cache_user;
							break;
						}
					}

					resolve(curr_user);
				}
			});
		}
		else
			resolve(false);
	});
}

/**
 * Adds an user by a given data set
 * @param {String} sender_id - The facebook sender id
 * @param {PageConfig} page - A PageConfig object
 * @param {Object} data - The data object with pairs of key values to add to user data
 * @return {UserResponse} A bluebird promise response user object with user data
 */
Userctl.prototype.addUser = function addUser(sender_id, page, data)
{
	var _this = this;
	return new promise(function(resolve)
	{
		if((!data || data==undefined) && page!=undefined)
		{
			if(facebookctl)
			{
				facebookctl.requestUserData(page, sender_id)
				.then(function(response)
				{
					var facebook_data = {};

					if(response.hasOwnProperty('data') && response.data.hasOwnProperty('body') && !response.data.body.hasOwnProperty('error'))
							facebook_data = response.data.body;

					if(typeof(facebook_data)=='string')
						facebook_data = JSONbig.parse(facebook_data);

					facebook_data.status = 1;

					if(botconfig.botconfig.use_permanent_bot_user)
					{
						facebook_data.page_id = page.id;
						facebook_data.sender_id = sender_id;

						usermodel.addUser(facebook_data)
						.then(function(user)
						{
							if(user && user.affectedRows!=undefined && user.affectedRows>0)
							{
								_this.getNewUser(facebook_data)
								.then(function(new_user)
								{
									resolve({response:new_user, data:facebook_data});
								});
							}
							else
								resolve({response:user, data:facebook_data});
						});
					}
					else
						resolve({response:false, data:facebook_data});
				});
			}
			else
				resolve({response:false, data:{}});
		}
		else if(data)
		{
			data.sender_id = sender_id;

			if(usermodel)
			{
				usermodel.addUser(data)
				.then(function(user)
				{
					if(user && user.affectedRows!=undefined && user.affectedRows>0)
					{
						_this.getNewUser(data)
						.then(function(new_user)
						{
							resolve({response:new_user, data:data});
						});
					}
					else
						resolve({response:user, data:data});
				});
			}
			else
				resolve({response:false, data:false});
		}
		else
			resolve({response:false, data:false});
	});
}

/**
 * Gets the user from database
 * @param {Object} data - The data object with at least sender id key on it
 * @return {Object|Boolean} A bluebird promise mysql object with user data or false if none
 */
Userctl.prototype.getNewUser = function getNewUser(data)
{
	return new promise(function(resolve)
	{
		if(usermodel)
		{
			usermodel.getUser(data.sender_id)
			.then(function(user)
			{
				resolve(user);
			});
		}
		else
			resolve(false);
	});
}

/**
 * Updates an user by a given data set
 * @param {String} sender_id - The facebook sender id
 * @param {Object} data - The data object with pairs of key values to update user data
 * @return {UserUpdateResponse} A bluebird promise response user object with user data
 */
Userctl.prototype.updateUser = function updateUser(sender_id, data)
{
	var _this = this;
	return new promise(function(resolve)
	{
		if(usermodel)
		{
			usermodel.updateUser(sender_id, data)
			.then(function(user)
			{
				if(user && user.hasOwnProperty('affectedRows') && user.affectedRows>0)
					resolve({status:true, data:user});
				else
				{
					if(_this.user_cache[sender_id]!=undefined)
					{
						for (var k in data)
						{
							if (data.hasOwnProperty(k) && _this.user_cache[sender_id].hasOwnProperty(k))
								_this.user_cache[sender_id][k] = data[k];
						}

						resolve({status:true, data:_this.user_cache[sender_id]});
					}
					else
						resolve({status:false, data:false});
				}
			});
		}
		else
			resolve({response:false, data:false});
	});
}

/**
 * Gets the list of all the users, paged from 20 by 20
 * @param {Numner} page - The page of the list
 * @return {Object} A bluebird promise response user object with the list of users
 */
Userctl.prototype.getUsers = function getUsers(page)
{
	var _this = this;
	return new promise(function(resolve)
	{
		var ppg = 20;
		page = (page<1) ? 1 : page;
    page = (page-1) * ppg;

		if(usermodel)
		{
			usermodel.getUserCount()
			.then(function(response)
			{
				if(response&&response.count)
				{
					page = response.count<ppg ? 0 : page;

					usermodel.getUsers(page, ppg)
					.then(function(userlist)
					{
						var totalpage = 0;
						if(userlist)
						{
							if(userlist.length==undefined)
								userlist = [userlist]

							resolve({total_count:response.count, page_count:userlist.length, entries:userlist});
						}
						else
						{
							totalpage = _this.user_cache.length!=undefined ? _this.user_cache.length : 0;
							resolve({total_count:response.count, page_count:totalpage, entries:_this.user_cache});
						}
					});
				}
				else
					resolve(false);
			});
		}
		else
			resolve(false);
	});
}
