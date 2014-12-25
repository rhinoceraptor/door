http = require('http')
https = require('https')
fs = require('fs')
express = require('express')
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
app.use(body_parser())

# Register REST interfaces on app
app.get('/door', (req, res) -> rest.door_get(req, res))
app.post('/door', (req, res) -> rest.door_post(req, res))
app.post('/door-auth', (req, res) -> rest.door_auth(req, res))

# Listen for clients on rest_port
app.listen(config.rest_port)
