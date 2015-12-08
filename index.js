var basicAuth = require('basic-auth-connect');
var express = require('express');
var path = require('path');
var config = require('config');
var app = express();
var spotifyApp = require('./spotify').app;

if (process.env.BASIC_AUTH_PASS)
app.use(basicAuth(function (user, pass) {
	return process.env.BASIC_AUTH_PASS === pass || process.env.BASIC_AUTH_PASS2 === pass;
}));

app.use(express.static(path.join(__dirname, 'public')));

function basePath(req) {
	var externalPathValue = req.header("hybris-external-path");

	if (externalPathValue) {
		//remove trailing slash, if any
		return externalPathValue.replace(/\/$/, "");
	} else {
		return "";
	}
}
app.get('/', function (req, res) {
	res.redirect(basePath(req) + "/api-console/");
});

app.use(spotifyApp);



var port = process.env.PORT || config.get('defaultPort');
app.listen(port);
console.log('Listening on port %s',port);
