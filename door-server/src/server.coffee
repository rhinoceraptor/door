http = require('http')
https = require('https')
fs = require('fs')
express = require('express')
session = require('express-session')
favicon = require('express-favicon')
body = require('body-parser')
passport = require('passport')
sqlite3 = require('sqlite3').verbose()
local_strat = require('passport-local').Strategy

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  open = module.exports = parseInt(config.door_open, 10)
  closed = module.exports = parseInt(config.door_closed, 10)
  db = new sqlite3.Database(config.sql_db)
catch err
  console.log 'Error reading config.json from web.coffee!'
  process.exit(1)

rest = require('./rest')
web = require('./web')
web.config(db)

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  rest_port = config.rest_port
catch err
  console.log 'Error reading config.json from server.coffee!'
  console.log err
  process.exit(1)

# Configure express to use jade, add favicon and express.static for CSS
app = express()
app.use(favicon(__dirname + '/../public/ccowmu.ico'))
app.set('views', './views')
app.set('view engine', 'jade')
app.use(body())
app.use(express.static(__dirname + '/../public'))
app.use(session({secret: config.secret}))
app.use(passport.initialize())
app.use(passport.session())



# Register endpoints on app for web app
app.get('/', (req, res) -> web.login(req, res))
app.get('/logs', (req, res) -> web.logs(req, res, db))
app.post('/logs', (req, res) -> web.logs(req, res, db))
app.get('/reg-user', (req, res) -> web.reg_user(req, res, db))
app.get('/dereg-user', (req, res) -> web.dereg_user(req, res, db))
app.get('/login', (req, res) -> web.login(req, res))
app.get('/logout', (req, res) -> web.logout(req, res, db))
app.get('/login-failure', (req, res) -> web.login_failure(req, res))
app.post('/login', passport.authenticate('local', {
  successRedirect: '/logs',
  failureRedirect: '/login-failure'
}))


# Register endpoints on app for raspberry pi
app.get('/door', (req, res) -> rest.door_get(req, res, db))
app.post('/door', (req, res) -> rest.door_post(req, res, db))
app.post('/door-auth', (req, res) -> rest.door_auth(req, res, db))

# Listen for clients on rest_port
app.listen(config.rest_port, () -> console.log 'listening on port ' + config.rest_port)
