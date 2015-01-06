http = require('http')
https = require('https')
fs = require('fs')
express = require('express')
express_session = require('express-session')
favicon = require('express-favicon')
body_parser = require('body-parser')

rest = require('./rest')
rest.rest()
web = require('./web')

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  rest_port = config.rest_port
catch err
  console.log 'Error reading config.json from server.coffee!'
  console.log err
  process.exit(1)



# app is our express object
app = express()
app.use(favicon(__dirname + '/../public/ccowmu.ico'))
app.set('views', './views')
app.set('view engine', 'jade')

# User the body parser middleware for parsing the POST body
app.use(body_parser())
app.use(express.static(__dirname + '/../public'))
console.log __dirname + '/../public'

# Register enpooints on app for raspberry pi
app.get('/door', (req, res) -> rest.door_get(req, res))
app.post('/door', (req, res) -> rest.door_post(req, res))
app.post('/door-auth', (req, res) -> rest.door_auth(req, res))

# Register endpoints on app for web app
app.get('/', (req, res) ->
  console.log '/'
  web.home(req, res))
app.get('/login', (req, res) ->
  console.log '/login'
  web.login(req, res))

# Listen for clients on rest_port
app.listen(config.rest_port, () -> console.log 'listening on port ' + config.rest_port)
