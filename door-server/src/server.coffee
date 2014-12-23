http = require('http')
https = require('https')
fs = require('fs')
spawn = require('child_process').spawn
express = require('express')
body_parser = require('body-parser')
sqlite3 = require('sqlite3').verbose()

open = 1
closed = 0

# Read config.json, set parameters accordingly
##############################################
config = fs.readFileSync('./config.json')
try
  obj = JSON.parse(config)
  socket_port = obj.socket_port
  rest_port = obj.rest_port
  sql_db = obj.sql_db
  ssl_key = obj.ssl_key
  ssl_cert = obj.ssl_cert
  ssl_ca = obj.ssl_ca
  console.log 'server configuration:\n---------------------'
  console.log 'socket_port: ' + socket_port
  console.log 'rest_port: ' + rest_port
  console.log 'sql_db: ' + sql_db
catch err
  console.log 'Error reading config.json!'
  process.exit(1)

# Set up sqlite connection
db = new sqlite3.Database(sql_db)

# Function for running shell commands. Pass it a callback, it's asynchronous.
run_cmd = (cmd, args, callback) ->
  spawn = require('child_process').spawn
  child = spawn(cmd, args)
  resp = ""
  child.stdout.on('data', (buffer) -> resp += buffer.toString())
  child.stdout.on('end', () -> callback(resp))

# app is our express object
app = express()
options = {
}

# User the body parser middleware for parsing the POST body
app.use(body_parser())

# GET interface for the simple door state
app.get('/door', (req, res) ->
  db.serialize(() ->
    db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) ->
      if row.state is open
        res.send('The door is open.\n')
      else
        res.send('The door is closed.\n')
    )
  )
)

# GET interface for the door state along with the UNIX date command
app.get('/door-verbose', (req, res) ->
  db.serialize(() ->
    db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) ->
      if row.state is open
        res.send('The door was open as of ' + row.date + '.\n')
      else
        res.send('The door was closed as of ' + row.date + '.\n')
    )
  )
)

# POST interface for the raspberry pi to send the door state
# You can post to it like this: 'curl --data "state=0" <ip>:<port>/door-state'
app.post('/door-state', (req, res) ->
  state = req.body.state
  if state isnt '1' and state isnt '0'
    res.send("ya blew it!\n")
    return
  run_cmd("date", "", (resp) ->
    sql = 'INSERT INTO door VALUES(' + state + ', "' + resp.trim() + '");'
    db.serialize(() ->
      db.run(sql)
      res.send('great job!\n')
    )
  )
)

# POST interface for entering card hashes
# You can post to it like this: 'curl --data "state=0" <ip>:<port>/door-state'
app.post('/door-state', (req, res) ->
  state = req.body.state
  if state isnt '1' and state isnt '0'
    res.send("ya blew it!\n")
    return
  run_cmd("date", "", (resp) ->
    sql = 'INSERT INTO door VALUES(' + state + ', "' + resp.trim() + '");'
    db.serialize(() ->
      db.run(sql)
      res.send('great job!\n')
    )
  )
)

# Listen for clients on rest_port
app.listen(rest_port)