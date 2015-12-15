var request = require('request');

function stat() {
	var iteration = 0;
	setInterval(function() {
		iteration = iteration+1;
		request("http://localhost:3000/statistics/" + iteration, {}, function (err, res, body) {
			console.log(body);

		});
	}, 500)
}

stat();