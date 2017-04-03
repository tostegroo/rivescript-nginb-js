rivescript-nginb-js
==================

A Rivescript-Node engine to make bots interaction with Facebook Messenger and Databases easier

## Uses

[Rivescript](https://www.rivescript.com)

## Install

```bash
$> npm install --save rivescript-nginb-js
```

## Usage

```bash
var bot = require('rivescript-nginb-js');

var mybot = new bot(
{
	env: 'dev',
	instances:
	[
		{
			language: "en",
			path: path.join(__dirname, "brains/en"),
			config:
			{
				utf8: true,
	            errors:
				{
	                replyNotMatched: "",
	                replyNotFound: "",
	                objectNotFound: "[ERR: Object not found]",
	                deepRecursion: "ERR"
	            },
				unicodePunctuation: new RegExp(/[.,!?;:]/g)
			},
			variables: require('./{{custom_path}}/variables')
		},
		{
			language: "pt",
			path: path.join(__dirname, "brains/pt"),
			config:
			{
				utf8: true,
				unicodePunctuation: new RegExp(/[.,!?;:]/g)
			},
			variables: require('./{{custom_path}}/variables')
		}
	],
	assets_url: environment.ASSETS_URL,
	scripts: scripts,
	attachments: require('./{{custom_path}}/attachments'),
	menus: require('./{{custom_path}}/menus'),
	texts: require('./{{custom_path}}/texts'),
	humanization: require('./{{custom_path}}/humanization'),
	custom_user: require('./{{custom_controllers_path}}/userctl'),
	dispatcher:
	{
		time: '*/10 * * * * *',
		function: {{some function}}
	},
	database:
	{
		config: {{database config}},
		user_table: 'tbl_user',
		pages_table: 'tbl_page',
		storage_table: 'tbl_gamedata'
	},
	facebook:
	{
		send_to: true,
		graph_url: "https://graph.facebook.com",
	    varsion: "v2.8",
	    login_appID: "1212312312323123",
	    login_appSecret: "",
	    verify_token: 'example_is_a_bot',
		pages:
		{
	        "1234567897897897":
	        {
	            language: 'pt',
	            type: 'dev',
	            appID: '556454897897897897',
	            pageToken: 'EAAQcmN4j260BAIcTx6IZCqqPivN6wnAd4uqMWUy58Ik9jxcZBiASda12Nacjkd...',
	        }
	    }
	},
	botconfig:
	{
		use_permanent_bot_user: true,
	    typing_delay: true,
	    typing_time: 30,
	    time_for_typing_on: 3500,
	    humanize: true,
	    humanize_subs: false,
	    typing_error_chance: 0
	}
});
```

## Documentation

You can see the complete documentation [here](https://tostegroo.github.io/rivescript-nginb-js) and in the [template-files](https://github.com/tostegroo/rivescript-nginb-js/tree/master/template-files) folder you can find all files used in configuration

## How to build documentation

This project uses [grunt](https://github.com/gruntjs/grunt), [jsdoc](http://usejsdoc.org) and [toast](https://github.com/tostegroo/toast) jsdoc theme for documentation

If you don't already have Node.js and NPM, go install them. Then, in the folder where you have cloned
the repository, install the build dependencies using npm:

```
$> npm install
```

Then, to build the documentation and watch for modifications, run:

```
$> grunt dev
```

Then, to build the final documentation run:

```
$> grunt dist
```

## Licence
The MIT License (MIT)

Copyright (c) 2017 Fabio Toste

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
