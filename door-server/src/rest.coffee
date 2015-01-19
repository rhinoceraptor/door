fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
express = require('express')
scrypt = require('scrypt')
sqlite3 = require('sqlite3')
string_decoder = require('string_decoder').StringDecoder
body_parser = require('body-parser')

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  open = parseInt(config.door_open, 10)
  closed = parseInt(config.door_closed, 10)
catch err
  console.log 'Error reading config.json from web.coffee!'
  process.exit(1)

registration = false

# Check that the client is presenting a client certificate signed by the CA
# of the server. This middleware function is used to verify the RPi identity.
exports.ssl_auth = (req, res, next) =>
  if req.client.authorized
    next()
  else
    res.status(401)
    res.send('ya blew it')
    return

# GET interface for the door state
exports.door_get = (req, res, db) =>
  db.serialize(() =>
    # Search the door table, order by last row by date, and limit to one result
    db.each('SELECT * FROM door ORDER BY timestamp DESC LIMIT 1', (err, row) =>
      if row.state is open
        res.send('The door was open as of ' + row.timestamp + '.\n')
      else if row.state is closed
        res.send('The door was closed as of ' + row.timestamp + '.\n')
      else
        res.send('ya blew it!\n')
    )
  )

# POST interface for the raspberry pi to send the door state
# You can post to it like this: 'curl --data "state=0" <ip>:<port>/door'
exports.door_post = (req, res, db) =>
  state = req.body.state
  # We allow '1' or '0' only, this prevents SQL injection and bad data
  if state isnt '1' and state isnt '0'
    res.status(403)
    res.send('ya blew it!\n')
    return

  sql = 'INSERT INTO door VALUES(' + state + ', "' + new Date().toString() + '");'
  db.serialize(() =>
    db.run(sql)
    # Send CREATED 201 HTTP status code
    res.status(201)
    res.send('great job!\n')
  )

# POST interface for checking card hashes
# You can post to it like this: 'curl --data "hash=<hash>" <ip>:<port>/door-auth'
# TODO: The registration variable will be set when an admin initiates a user
# registration event, the rpi doesn't know the difference and will post as usual
exports.door_auth = (req, res, db) =>
  hash = req.body.hash
  if !hash? or hash is ''
    # Send forbidden 403 HTTP header
    res.status(403)
    res.send('ya blew it!\n')

    # Log the blank hash event by the ip address
    ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    sql = 'INSERT INTO swipes VALUES("' + new Date().toString() + '", "N/A", "false", "' + ip + '");'
    console.log sql
    db.run(sql)
    return
  # Make sure that the hash we are going to test against the database is
  # actually a hex string, to prevent SQL injection.
  else if valid.isHexadecimal(hash) is false
    # Send forbidden 403 HTTP header
    res.status(403)
    res.send('ya blew it!\n')
    return

  # If registration is false, then this is a normal auth
  if registration is false
    sql = 'SELECT * FROM users WHERE hash = "' + hash + '" LIMIT 1;'

    db.serialize(() =>
      db.each(sql, (err, row) =>
        if err
          console.log err
          # Send internal error 500 HTTP header
          res.status(500)
          res.send('ya blew it!\n')
        else if row?
          console.log 'authenticated ' + row.user
          res.status(200)
          res.send('great job!\n')
          # Log the successful card swipe
          sql = 'INSERT INTO swipes VALUES("' + new Date().toString() + '", "' + hash +'", "true", "' + row.user + '");'
          console.log sql
          db.run(sql)
      # Completion callback, called when the query is done
      , (err, rows) =>
        # If number of returned rows is 0, then attempt has failed
        if rows is 0
          # Send unauthorized 401 HTTP header
          res.status(401)
          res.send('ya blew it!\n')
          # Log the unsuccessful card swipe by ip address
          ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
          sql = 'INSERT INTO swipes VALUES("' + new Date().toString() + '", "' + hash + '", "false", "' + ip + '");'
          console.log sql
          db.run(sql)
      )
    )

  # If registration is true, than we are registering a card to the sqlite db
  else if registration is true
    console.log 'spooked ya'
