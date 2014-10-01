var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var Slack = require('node-slack'),
	slack = new Slack('{{ SLACK_DOMAIN }}', '{{ SLACK_API_KEY }}');

var define = require('./modules/define')(slack);
var tube = require('./modules/tube')(slack);
var gif = require('./modules/gif')(slack);
var menu = require('./modules/menu')(slack);
var draw = require('./modules/draw')(slack);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.post('/command', function(req, res){

	switch (req.body.command) {
		case '/define':
			var search = req.body.text || req.params.text || req.query.text;
			define(search, res);
			break;
		case '/menu':
			menu(res);
			break;
		case '/draw':
			var user = req.body.user_name || req.params.user_name || req.query.user_name;
			var cmd = req.body.text || req.params.text || req.query.text;
			if ( /^start/g.exec(cmd) ) {
				res.end(draw.drawStart(user));
			} else if ( /^add/g.exec(cmd) ) {
				cmd = cmd.replace(/^add\s/, '');
				res.end(draw.drawAdd.apply(
					this, 
					[user].concat(
						cmd.match(
							/([^,?\s?]+)/g
						)
					)
				));
			}  
			break;
	}

	
});

app.post('/outgoing', function(req, res){

	var user = req.body.user_name;
	var search;

	switch (req.body.trigger_word) {
		case '!define':
			search = /!define\s(.+)/g.exec(req.body.text)[1];
			define(search, res, req, user);
			break;
		case '!gif':
			search = /!gif\s(.+)/g.exec(req.body.text)[1];
			gif(search, res, req, user);
			break;
		case '!tube':
			if (/!tube\s(.+)/g.exec(req.body.text)) search = /!tube\s(.+)/g.exec(req.body.text)[1];
			tube(search, res, req, user);
			break;
		case '!draw':
			if (/!draw\s(.+)/g.exec(req.body.text)) search = /!draw\s(.+)/g.exec(req.body.text)[1];
			draw.drawPick(search, res, req, user);
			break;		
	}
	
});

app.listen(4000);
console.log('server listening on port 4000');