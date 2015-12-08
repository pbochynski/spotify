var request = require('supertest');
var should = require('should');
var app = require('../spotify').app;


describe('Spotify contract test', function(){
	var listId;
	it('should create new playlist', function(done){
		request(app)
			.post('/users/1/playlists')
			.send({name: "MyList", "public": "true"})
			.expect(200)
			.end(function (err, res){
				if (err) throw err;
				listId = res.body.id;
				done();
			})
	});
	it('should get example playlist', function(done){
		request(app)
			.get('/users/1/playlists/'+listId)
			.expect(200)
			.end(function (err, res){
				if (err) throw err;
				res.body.should.have.property('id',listId);
				res.body.should.have.property('name',"MyList");
				done();
			})
	});
	it('should update playlist', function(done){
		request(app)
			.put('/users/1/playlists/'+listId)
			.send({"public":true,name:"MyList2"})
			.expect(200, done);
	});
	it('should get updated playlist', function(done){
		request(app)
			.get('/users/1/playlists/'+listId)
			.expect(200)
			.end(function (err, res){
				if (err) throw err;
				res.body.should.have.property('id',listId);
				res.body.should.have.property('public',true);
				res.body.should.have.property('name','MyList2');
				done();
			})
	});
	it('should add tacks', function(done){
		request(app)
			.post('/users/1/playlists/'+listId+'/tracks?ids=1,2,3')
			.send()
			.expect(200, done);
	});
	it('should get playlist with 3 tracks', function(done){
		request(app)
			.get('/users/1/playlists/'+listId)
			.expect(200)
			.end(function (err, res){
				if (err) throw err;
				res.body.should.have.property('tracks');
				if (res.body.tracks.length!=3)
					throw 'Should have 3 tracks';
				done();
			})
	});
	it('should remove tracks', function(done){
		request(app)
			.delete('/users/1/playlists/'+listId+'/tracks?ids=3')
			.send()
			.expect(200, done);
	});
	it('should get playlist with 2 tracks', function(done){
		request(app)
			.get('/users/1/playlists/'+listId)
			.expect(200)
			.end(function (err, res){
				if (err) throw err;
				if (res.body.tracks.length!=2)
					throw 'Should have 2 tracks';
				done();
			})
	});
	it('should delete wishlist', function(done){
		request(app)
			.del('/users/1/playlists/'+listId)
			.expect(200, done);
	});
	it('should return 404 for not existing wishlist', function(done){
		request(app)
			.get('/users/1/playlists/'+listId)
			.expect(404, done);
	});

});