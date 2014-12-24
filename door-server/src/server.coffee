http = require('http')
https = require('https')
fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
express = require('express')
body_parser = require('body-parser')
sqlite3 = require('sqlite3').verbose()

registration = false

# Read config.json, set parameters accordingly
config = fs.readFileSync('./config.json')
try
  obj = JSON.parse(config)
  socket_port = obj.socket_port
  rest_port = obj.rest_port
  open = parseInt(obj.door_open, 10)
  closed = parseInt(obj.door_closed, 10)
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
# Thank you to cibercitizen1 on Stack Overflow:
# http://stackoverflow.com/questions/14458508/node-js-shell-command-execution
run_cmd = (cmd, args, callback) ->
  spawn = require('child_process').spawn
  child = spawn(cmd, args)
  resp = ''
  child.stdout.on('data', (buffer) -> resp += buffer.toString())
  child.stdout.on('end', () -> callback(resp))

# app is our express object
app = express()

# User the body parser middleware for parsing the POST body
app.use(body_parser())

# GET interface for the door state along with the UNIX date command
app.get('/door', (req, res) ->
  db.serialize(() ->
    # Search the door table, order by last row by date, and limit to one result
    db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) ->
      console.log row.state
      if row.state is open
        res.send('The door was open as of ' + row.date + '.\n')
      else if row.state is closed
        res.send('The door was closed as of ' + row.date + '.\n')
      else
        res.send('ya blew it!\n')
    )
  )
)

# POST interface for the raspberry pi to send the door state
# You can post to it like this: 'curl --data "state=0" <ip>:<port>/door'
# TODO: SSL only for rpi authentication (Using self generated CA)
app.post('/door', (req, res) ->
  state = req.body.state
  # We allow '1' or '0' only, this prevents SQL injection and bad data
  if state isnt '1' and state isnt '0'
    res.send('ya blew it!\n')
    return
  run_cmd('date', '', (resp) ->
    sql = 'INSERT INTO door VALUES(' + state + ', "' + resp.trim() + '");'
    db.serialize(() ->
      db.run(sql)
      res.send('great job!\n')
    )
  )
)

# POST interface for checking card hashes
# You can post to it like this: 'curl --data "hash=<hash>" <ip>:<port>/door-auth'
# TODO: SSL only for rpi authentication (Using self generated CA)
# TODO: The registration variable will be set when an admin initiates a user
# registration event, the rpi doesn't know the difference and will post as usual
app.post('/door-auth', (req, res) ->
  hash = req.body.hash
  if !hash?
    res.send('ya blew it!\n')
    return
  # Make sure that the hash we are going to test against the database is
  # actually a hex string, to prevent SQL injection.
  else if valid.isHexadecimal(hash) is false
    res.send('ya blew it!\n')
    return

  run_cmd('date', '', (resp) ->
    # If registration is false, then this is a normal auth
    if registration is false
      sql = 'SELECT * FROM users WHERE hash = "' + hash + '";'

      db.serialize(() ->
        db.each(sql, (err, row) ->
          if err
            console.log err
            res.send('ya blew it!\n')
          else if row?
            console.log 'authenticated ' + row.user
            res.send('great job!\n')
          else
            console.log 'user does not exist'
            res.send('ya blew it!\n')
        )
      )


    # If registration is true, than we are registering a card to the sqlite db
    else if registration is true
      console.log 'spooked ya'
  )
)

# Listen for clients on rest_port
app.listen(rest_port)