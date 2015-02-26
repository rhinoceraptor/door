https = require('https')
fs = require('fs')
express = require('express')
session = require('express-session')
favicon = require('express-favicon')
body_parser = require('body-parser')
passport = require('passport')
sqlite3 = require('sqlite3').verbose()
local_strat = require('passport-local').Strategy

# Read config.json synchronously
try
  config = require('./config.json')
  open = module.exports = parseInt(config.door_open, 10)
  closed = module.exports = parseInt(config.door_closed, 10)
  db = new sqlite3.Database(config.sql_db)
catch err
  console.log 'Error reading config.json from web.coffee!'
  process.exit(1)

# Set SSL Options
ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
}

rest = require('./rest')
web = require('./web')
web.config(db)

# Configure app express to use jade, add favicon and express.static for CSS
app = express()
app.use(favicon(__dirname + '/../public/ccowmu.ico'))
app.set('views', './views')
app.set('view engine', 'jade')
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(express.static(__dirname + '/../public'))
app.use(session({
  secret: config.secret
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

# Register endpoints on app for web app
app.get('/', (req, res) -> web.login(req, res))
app.get('/open-door', web.is_authed, (req, res) -> web.open_door(req, res, db, config))
app.get('/swipe-logs', web.is_authed, (req, res) -> web.logs(req, res, db, config))
app.post('/swipe-logs', web.is_authed, (req, res) -> web.logs(req, res, db, config))
app.get('/reg-user', web.is_authed, (req, res) -> web.reg_user(req, res, db))
app.post('/reg-user', web.is_authed, (req, res) -> web.reg_user_post(req, res, db, rest))
app.get('/dereg-user', web.is_authed, (req, res) -> web.dereg_user(req, res, db))
app.post('/dereg-user', web.is_authed, (req, res) -> web.dereg_user_post(req, res, db, rest))
app.get('/card-reg-logs', web.is_authed, (req, res) -> web.card_reg_logs(req, res, db))
app.get('/login', (req, res) -> web.login(req, res, 'Log In'))
app.get('/logout', web.is_authed, (req, res) -> web.logout(req, res, db))
app.get('/login-failure', (req, res) -> web.login(req, res, 'Login Failed! Try again.'))
app.post('/login', passport.authenticate('local', {
  successRedirect: '/swipe-logs',
  failureRedirect: '/login-failure'
}))

# Register endpoints on app for raspberry pi
# POST /door and /door-auth are guarded using the ssl_auth middleware function
# to check that the client has an SSL certificate signed by our CA.
# GET /door is still over SSL so that the web app can load it in the pages.
app.get('/door', (req, res) -> rest.door_get(req, res, db))
app.post('/door', rest.ssl_auth, (req, res) -> rest.door_post(req, res, db))
app.post('/door-auth', rest.ssl_auth, (req, res) -> rest.door_auth(req, res, db))

# Set up app with HTTPS to listen on port config.port
https.createServer(ssl_opts, app).listen(config.port, () ->
  console.log 'listening on port ' + config.port
)

