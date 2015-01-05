http = require('http')
https = require('https')
fs = require('fs')
express = require('express')
cookie_parser = require('cookie-parser')
express_session = require('express-session')
body_parser = require('body-parser')

rest = require('./rest')

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  rest_port = config.rest_port
catch err
  console.log 'Error reading config.json!'
  process.exit(1)

# Set up rest_interfaces class
rest = new rest()

# app is our express object
app = express()

# User the body parser middleware for parsing the POST body
app.user(cookie_parser())
app.use(body_parser())


# Register REST interfaces on app
app.get('/door', (req, res) -> rest.door_get(req, res))
app.get(''
app.post('/door', (req, res) -> rest.door_post(req, res))
app.post('/door-auth', (req, res) -> rest.door_auth(req, res))
#app.post('/create-admin', (req, res) -> rest.create_admin(req, res))
#app.post('/del-admin', (req, res) -> rest.del_admin(req, res))
#app.post('/reset-passwd', (req, res) -> rest.reset_passwd(req, res))
app.post('/login', passport.authenticate('local', {
  successRedirect: '/logged-in',
  failureRedirect: '/bad-login'})
#app.post('/add-user', (req, res) -> rest.add_user(req, res))
#app.post('/del-user', (req, res) -> rest.del_user(req, res))
#app.post('/get-log', (req, res) -> rest.get_log(req, res))

# Listen for clients on rest_port
app.listen(config.rest_port)
