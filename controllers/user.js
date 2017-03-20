var promise 		= require('bluebird');
var JSONbig 		= require('json-bigint');
var botconfig 		= require('../config/botconfig');
var usermodel 		= require('../models/user')(botconfig.database.config);
var customuserctl 	= false;
var facebookctl 	= false;

exports = module.exports = function(facebookcontroller, customusercontroller)
{
	return new Userctl(facebookcontroller, customusercontroller);
}

function Userctl(facebookcontroller, customusercontroller)
{
	this.user_cache = {};

	customuserctl = customusercontroller || false;
	facebookctl = facebookcontroller || false;
}

Userctl.prototype.getUserData = function getUserData(sender_id, page, lang)
{
	var self = this;
	return new promise(function(resolve, reject)
	{
		self.getUser(sender_id, page)
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

Userctl.prototype.getUser = function getUser(sender_id, page)
{
	var self = this;
	return new promise(function(resolve, reject)
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
					self.addUser(sender_id, page)
					.then(function(new_user)
					{
						if(new_user.response)
							resolve(new_user.response);
						else
						{
							if(self.user_cache[sender_id]==undefined)
								self.user_cache[sender_id] = new_user.data;

							resolve(self.user_cache[sender_id]);
						}
					});
				}
			});
		}
		else
			resolve(false);
	});
}

Userctl.prototype.getUserByName = function getUsers(name)
{
	var self = this;
	return new promise(function(resolve, reject)
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
					for (var key in self.user_cache)
					{
						var user = self.user_cache[key];
						if(user.first_name.toLowerCase()==name.toLowerCase() || user.last_name.toLowerCase()==name.toLowerCase())
						{
							curr_user = user;
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

Userctl.prototype.addUser = function addUser(sender_id, page, data)
{
	var self = this;
	return new promise(function(resolve, reject)
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
								userctl.getNewUser(facebook_data)
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
						userctl.getNewUser(data)
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

Userctl.prototype.getNewUser = function getNewUser(data)
{
	var self = this;
	return new promise(function(resolve, reject)
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

Userctl.prototype.updateUser = function updateUser(sender_id, data)
{
	var self = this;
	return new promise(function(resolve, reject)
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
					if(self.user_cache[sender_id]!=undefined)
					{
						for (var k in data)
						{
							if (data.hasOwnProperty(k) && self.user_cache[sender_id].hasOwnProperty(k))
								self.user_cache[sender_id][k] = data[k];
						}

						resolve({status:true, data:self.user_cache[sender_id]});
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

Userctl.prototype.getUsers = function getUsers(page)
{
	var self = this;
	return new promise(function(resolve, reject)
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
							totalpage = self.user_cache.length!=undefined ? self.user_cache.length : 0;
							resolve({total_count:response.count, page_count:totalpage, entries:self.user_cache});
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
