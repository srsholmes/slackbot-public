var slack;
var Browser = require('zombie');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');


function menu(res) {
	var browser = new Browser();
	var d = new Date();
	var days = ['Sunday', 'Monday','Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var day = days[d.getDay()];
	var url = 'http://cafewarwickmenus.co.uk/menus/' + day + '/';

	browser.visit(
		url,
		function() {
			var $ = cheerio.load(browser.html('body'));
			var title = $('.page-title h3')[0].children[0].data;
			var menu = $('#main').html().toString();
			menu = menu.replace(/\t/g, '').replace(/<([^>]+)>/ig, function(match, group) {
				var grp = group.replace(/\//g, '');
				switch (grp) {
					case 'h4':
					case 'strong':
						return '*';
						break;
					case 'p':
						return '_';
						break;
					default:
						return '';
						break;
				}
			});
			// menu = menu.replace(/(<([^>]+)>)/ig,'');
			var response = '*' + title + '*:\n' + menu;
			//console.log(response);
			res.end(response);
		}
	);
}

module.exports = function(s) {
	slack = s;
	return menu;
}