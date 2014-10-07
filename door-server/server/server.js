/*
 * Set up the REST interface
 */
var express = require('express');
var app = express();
app.listen(10042);

/*
 * Set up Redis
 */
var redis = require('redis');
var client = redis.createClient();

/*
 * Configure the server
 */
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/*
 * Register REST events
 */
app.put('/door', function(req, res){
  res.send('acknowledged');
	console.log(req + '\n');
});

app.get('/door', function(req, res) {

  res.send(door_state);
 /*
  * Set up socket.io
  */
 var socket_io = require('socket.io');
 io = socket_io.listen(10044);
