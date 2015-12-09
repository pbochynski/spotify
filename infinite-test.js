var request = require('request');

function appUris(){
	request.get("http://spotify.cfapps.io/vcap",{}, function(err, res, body){
		console.log("%s %s", res.statusCode, body);
	});
}

setInterval(appUris,1000);