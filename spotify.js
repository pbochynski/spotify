var app = require('express')();
var playlists = require("lru-cache")(100); // memory LRU cache for 100 wishlists - replace it with real storage :)
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

tracks = require('./tracks.json');


app.use(bodyParser.json());

app.get('/users/:userId/playlists', function (req, res) {
	var userId = req.params.userId;
	res.send(playlists.values().filter(function (playlist) {
		return playlist.userId === userId
	}));
});
app.post('/users/:userId/playlists', function (req, res) {
	var id = uuid.v4();
	var playlist = req.body;
	playlist.userId = req.params.userId;
	playlist.id = id;
	playlists.set(id, playlist);
	res.send({id: id});
});

function findPlaylist(req, res, next) {
	var id = req.params.playlistId;
	var playlist = playlists.get(id);
	if (!playlist || playlist.userId !== req.params.userId) {
		return res.status(404).send({message: "Playlist not found"});
	}
	req.playlist = playlist;
	next();
}

app.get('/users/:userId/playlists/:playlistId', findPlaylist, function (req, res) {
	res.send(req.playlist);
});


app.put('/users/:userId/playlists/:playlistId', findPlaylist, function (req, res) {
	if (!req.body) {
		return res.status(400).send({message: "Wrong message body"});
	}
	req.body.userId = req.params.userId;
	req.body.id = req.params.playlistId;
	playlists.set(req.params.playlistId, req.body);
	res.send();

});
app.delete('/users/:userId/playlists/:playlistId', findPlaylist, function (req, res) {
	playlists.del(req.params.playlistId);
	res.send();
});

function findTracks(ids) {
	return tracks.filter(function (track) {
		return ids.some(function (id) {
			return track.id == id;
		});
	});
}

app.post('/users/:userId/playlists/:playlistId/tracks', findPlaylist, function (req, res) {
	var tracks = req.playlist.tracks;
	if (!tracks) {
		tracks = [];
	}
	if (req.query.ids) {
		var ids = req.query.ids.split(',');
		req.playlist.tracks = tracks.concat(findTracks(ids));
	}
	res.send();
});

app.delete('/users/:userId/playlists/:playlistId/tracks', findPlaylist, function (req, res) {
	var tracks = req.playlist.tracks;
	if (tracks && req.query.ids) {
		var ids = req.query.ids.split(',');
		req.playlist.tracks = tracks.filter(function (track) {
			return ids.every(function (id) {
				return id !== track.id
			});
		});
	}
	res.send();
});



exports.app = app;