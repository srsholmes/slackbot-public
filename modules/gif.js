var request = require('request');
var slack;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gif(search, res, req, user) {
	request({
		uri: 'http://api.giphy.com/v1/gifs/search?q=' + search + '&limit=100&api_key=dc6zaTOxFJmzC'
	}, function(err, response, body) {
		var json = JSON.parse(body);

		var ret = (user) ? '@' + user + ': ' : '';

		if (req.body.channel_name !== 'random' && req.body.channel_name !== 'dev') {
			ret += 'I only work in #random';
		} else if (json.data && json.data.length > 0) {
			var max = json.data.length;

			var rnd = getRandomInt(1, max) - 1;

			ret += json.data[rnd].images.original.url;
		} else {
			ret += 'Sorry, can\'t find a result for "' + search + '".';
		}

		if (user && req) {
			var reply = slack.respond(req.body, function(hook) {
				return {
					username: 'gif-bot',
					text: ret,
					link_names: 1
				}
			});

			res.json(reply);
		} else {
			res.send(ret);
		}
	});
}

module.exports = function(s) {
	slack = s;
	return gif;
};