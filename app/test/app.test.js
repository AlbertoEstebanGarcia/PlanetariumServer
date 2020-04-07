const app = require('../../server');
var request = require('supertest');

describe('GET /', function(){
   it('Returns documentation', function(done){
     request(app)
       .get('/')
       .expect(200)
       .end(function(err, res){
         if (err) return done(err);
         done()
       });
   })
 });

describe('Test GET /InvalidURL', function(){  
  it('Returns a 404 error', function(done){
    request(app)
      .get('/InvalidURL')
      .set('Accept', 'application/json')
      .expect(404)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
  })
});


describe('Test GET /planets', function(){
  this.timeout(20000);
  it('Returns list of planets', function(done){
    request(app)
      .get('/planets')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
  })
});

describe('Test POST /planets', function(){
  it('Fails to add a new planet due to invalid parameters', function(done){
    request(app)
      .post('/planets')
      .send({"name":"PlanetTest", "gravity": "10"})
      .set('Accept', 'application/json')
      .expect(400)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
  })
});

describe('Test POST, PUT and DELETE /planets', function() {
  let planetId;

  it('Adds a new planet', function(done) {
    request(app)
      .post('/planets')
      .send({"name":"PlanetTest", "gravity": "10", "distance": "1000", "satellites": "1", "radius": "1000" ,"imageUrl": "http://imageUrl.com"})
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) {
          return done(err);
        }
        planetId = res.body._id;
        done()
      });
  });

  it('Updates the new planet', function(done) {
    request(app)
      .put('/planets/' + planetId)
      .send({"name":"PlanetTestUpdated", "gravity": "10", "distance": "1000", "satellites": "1", "radius": "1000" ,"imageUrl": "http://imageUrl.com"})
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) {
          return done(err);
        }
        done()
      });
  });

  it('Deletes the new planet', function(done) {
    request(app)
      .delete('/planets/' + planetId)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) {
          return done(err);
        }
        done()
      });
  }); 
});