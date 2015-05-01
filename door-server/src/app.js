
/*
 * app
 * ---
 */

let https = require('https'),
  fs = require('fs'),
  express = require('express'),
  express-session = require('express-session'),
  express-favicon = require('express-favicon'),
  body_parser = require('body-parser'),
  passport = require('passport');

/* Read config.json synchronously */
let config = require('./config.json');

/* Set SSL Options */
let ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
}

/* Configure app express to use jade, add favicon and express.static for CSS */
var app = express();
app.use(express-favicon(__dirname + '/../public/ccowmu.ico'));
app.set('views', './views');
app.set('view engine', 'jade');
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(__dirname + '/../public'));
app.use(
  express-session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* Import our classes */
import {router} from './router';
import {session} from './session';
import {controller} from './controller';

/* Set up routes on app with router */
let app_router = new router(app);

/* Set up app with HTTPS to listen on port config.port */
https.createServer(ssl_opts, app).listen(config.port, function() {
  console.log(`listening on port ${config.port}`);
});

