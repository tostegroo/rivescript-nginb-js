var promise 	= require('bluebird');

var tbl_user =
[
	"sender_id",
	"page_id",
	"facebook_id",
	"email",
	"first_name",
	"last_name",
	"profile_pic",
	"locale",
	"gender",
	"timezone",
	"status"
];

module.exports = function(database_config)
{
	return new Usermodel(database_config);
}

function Usermodel(database_config)
{
	database_config = database_config || false;

    this.mysql = false;

    if(database_config)
        this.mysql = require('easy-mysql-promise')(database_config);
}

Usermodel.prototype.getUser = function (sender_id)
{
	var self = this;
	return new promise(function(resolve)
	{
		var sql = 'SELECT * FROM tbl_user WHERE sender_id="'+sender_id+'";';

		self.mysql.query(sql)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

Usermodel.prototype.getUserById = function (user_id, callback_data)
{
	var self = this;
	return new promise(function(resolve)
	{
		self.mysql.query('SELECT * FROM tbl_user WHERE user_id='+user_id)
		.then(function(response)
		{
			resolve({response:response, data:callback_data});
		});
	});
}

Usermodel.prototype.getUserByName = function (name)
{
	var self = this;
	return new promise(function(resolve)
	{
		self.mysql.query('SELECT * FROM tbl_user WHERE first_name="'+name+'" OR last_name="'+name+'";')
		.then(function(response)
		{
			resolve(response);
		});
	});
}

Usermodel.prototype.getUsers = function (page)
{
	var self = this;
	return new promise(function(resolve)
	{
		page = (page<1) ? 1 : page;
		page = (page-1) * 20;
		var sql = 'SELECT * FROM tbl_user LIMIT '+page+',20;';

		self.mysql.query(sql)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

Usermodel.prototype.updateUser = function (sender_id, data)
{
	var self = this;
	return new promise(function(resolve)
	{
		self.mysql.updateTableDataset('tbl_user', tbl_user, data, 'sender_id="'+sender_id+'"')
		.then(function(response)
		{
			resolve(response);
		});
	});
}

Usermodel.prototype.updateUserById = function (user_id, data)
{
	var self = this;
	return new promise(function(resolve)
	{
		self.mysql.updateTableDataset('tbl_user', tbl_user, data, 'user_id='+user_id)
		.then(function(response)
		{
			resolve(response);
		});
	});
}

Usermodel.prototype.addUser = function (data)
{
	var self = this;
	return new promise(function(resolve)
	{
		self.mysql.addToTableDataset('tbl_user', tbl_user, data)
		.then(function(response)
		{
			resolve(response);
		});
	});
}
