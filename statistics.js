var app = require('express')();
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(5, 1000);
var request = require('request');
var CircuitBreaker = require('circuit-breaker-js');
var breaker = new CircuitBreaker({windowDuration: 3000});

function slow(number, callback) {
	limiter.removeTokens(1, function (err, remainingRequests) {
		if (err) {
			process.nextTick(slow, number, callback);
		}
		callback(null, number);
	});
}

app.get('/slow/:number', function (req, res) {
	slow(req.params.number, function (err, number) {
		res.send({response: number});
	});
});

function latency(time) {
	var diff = process.hrtime(time);
	return (diff[0] * 1e9 + diff[1]) / 1e6;
}

app.get('/statistics/:number', function (req, res) {
	var time = process.hrtime();

	request.get(req.protocol + '://' + req.get('host') + '/slow/' + req.params.number, {},
		function (err, response, body) {
			if (err) {
				var errorRes = {error: err, latency: latency(time)};
				return res.status(500).send(errorRes);
			}
			var json = JSON.parse(body);
			json.latency = latency(time);
			console.log(json);
			res.send(json);
		});

});

exports.statisticsApp = app;



