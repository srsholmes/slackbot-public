var request = require('request');
var parseString = require('xml2js').parseString;
var slack;

function tube(search, res, req, user) {
	request({
		uri: 'http://cloud.tfl.gov.uk/TrackerNet/LineStatus'
	}, function(err, response, body) {
		parseString(body, function(err, result) {
			var resArr;
			var lines = result.ArrayOfLineStatus.LineStatus.map(function(line) {
				return {
					name: line.Line[0]['$'].Name,
					status: line.Status[0]['$'].Description,
					details: line['$'].StatusDetails

				};
			});

			if (search) {
				resArr = lines.filter(function(line) {
					return line.name.toLowerCase() === search.toLowerCase();
				});
			} else {
				resArr = lines;
			}

			var ret = (user) ? '@' + user + ':\n' : '';
			resArr.forEach(function(line) {
				ret += line.name + ' : ' + (search && line.details !== '' ? line.details : line.status) + '\n';
			});

			ret = ret.slice(0, -1);

			if (user && req) {
				var reply = slack.respond(req.body, function(hook) {
					return {
						username: 'tube-bot',
						text: ret,
						link_names: 1
					}
				});

				res.json(reply);
			}

		});
	});
}

module.exports = function(s) {
	slack = s;
	return tube;
};