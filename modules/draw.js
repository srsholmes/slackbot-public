
var slack;
var fs = require('fs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getArrayFromFile(username) {
	var contents = fs.readFileSync('userfiles/' + username + '.txt').toString();
	contents = contents.slice(1, contents.length - 1);
	return contents.split(',');
}

function writeArrayBackToFile(username, arr) {
	fs.writeFileSync('userfiles/' + username + '.txt', '>' + arr.join(',') + (arr.length > 0 ? ',' : ''), { flags: 'w' });
	return;
}

function checkDrawExists(username) {
	return fs.existsSync('userfiles/' + username + '.txt');
}

function drawStart(username) {
	fs.writeFileSync('userfiles/' + username + '.txt', '>', { flags: 'w' });
	return 'Successfully set up a new draw';
}

function drawAdd(username) {
	if (!checkDrawExists(username)) return 'You need to set up a draw before adding names.';
	var args = [].slice.call(arguments, 1);
	args.forEach(function(person) {
		fs.appendFileSync('userfiles/' + username + '.txt', person + ',');
	});
	return 'Successfully added names: ' + args.join(', ');
}

function drawPick(cmd, res, req, username) {
	var text;
	if (!checkDrawExists(username)) {
		text = 'You haven\'t set up a draw yet.';
		return respond(res, req, '@' + username + ': ' + text);
	} 
	var arr = getArrayFromFile(username);
	if (arr.length === 0 || arr[0] === '') {
		text = 'There\'s no one left in your draw';
		return respond(res, req, '@' + username + ': ' + text);	
	} 
	var index = getRandomInt(0, arr.length - 1);
	var name = arr[index];
	arr.splice(index, 1);
	writeArrayBackToFile(username, arr);
	return respond(res, req, name);
}

function respond(res, req, text){
	var reply = slack.respond(req.body, function(hook) {
		return {
			username: 'draw-bot',
			text: text,
			link_names: 1
		}
	});

	res.json(reply);
}

module.exports = function(s) {
	slack = s;
	return {
		drawStart : drawStart,
		drawAdd : drawAdd,
		drawPick : drawPick
	}
};