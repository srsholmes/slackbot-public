var request = require('request');
var slack;

function define(search, res, req, user) {
	request({
		uri: 'https://mashape-community-urban-dictionary.p.mashape.com/define?term=' + search,
		headers: {
			'X-Mashape-Key' : '{{ MASHAPE_URBAN_DICTIONARY_KEY }}'
		}
	}, function(err, response, body) {
		if (err) res.end('An error occured');

		var json = JSON.parse(body);

		var ret = (user) ? '@' + user + ': ' : '';

		if (json.list && json.list.length > 0) {
			ret += json.list[0].definition;
		} else {
			ret += 'Sorry, can\'t find a result for "' + search + '".';  
		}

		if (user && req) {
			var reply = slack.respond(req.body, function(hook) {
				return {
					text: ret,
					link_names: 1
				};
			});

			res.json(reply);
		} else {
			res.send(ret);
		}

	});
}

module.exports = function(s) {
	slack = s;
	return define;
};