var app = require('express')();
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(5, 1000);
var CircuitBreaker = require('circuit-breaker-js');
var request = require('request');
var breaker = new CircuitBreaker({windowDuration:3000});

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
	var fallback = function () {
		var json = {fallback: req.params.number, latency: latency(time)};
		res.send(json);
	};

	var command = function (success, failure) {
		request.get(req.protocol + '://' + req.get('host') + '/slow/' + req.params.number, {timeout:500},
			function (err, response, body) {
				if (err) {
					var errorRes = {error: err, latency: latency(time)};
					res.status(500).send(errorRes);
					return failure();
				}
				var json = JSON.parse(body);
				json.latency = latency(time);
				console.log(json);
				res.send(json);
				success();
			});
	};

	breaker.run(command, fallback);
});

exports.statisticsApp = app;



