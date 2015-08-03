
/*
 * app
 * ---
 * The file contains the main setup for the application
 */

/* External dependancies */
const http = require('http'),
  fs = require('fs'),
  express = require('express'),
  express_session = require('express-session'),
  express_favicon = require('express-favicon'),
  body_parser = require('body-parser'),
  knex = require('knex'),
  book_shelf = require('bookshelf'),
  passport = require('passport');

/* Set up the database and configuration */
const db_config = knex(require('../knexfile').development),
  bookshelf = book_shelf(db_config),
  config = require('../config'),
  session = require('./session');

/* Set SSL Options */
const ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
}

/* Configure app express to use jade, add favicon and express.static for CSS */
const app = express();
app.use(express_favicon(__dirname + '/../public/ccowmu.ico'));
app.set('views', './views');
app.set('view engine', 'jade');
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(__dirname + '/../public'));
app.use(
  express_session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
  })
);
/* Initialize passport for admin authentication */
app.use(passport.initialize());
app.use(passport.session());

/* Set up routes on app with router */
const router = require('./router');
app.use('/', router);

const port = process.env.PORT || config.web_port;

/* Set up app with HTTPS to listen on port config.port */
http.createServer(app).listen(port, function() {
  console.log(`listening on port ${port}`);
});
