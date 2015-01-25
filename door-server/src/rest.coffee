fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
express = require('express')
scrypt = require('scrypt')
sqlite3 = require('sqlite3')
squel = require('squel')
string_decoder = require('string_decoder').StringDecoder
body_parser = require('body-parser')

date = () -> new Date().toString()

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
  open = parseInt(config.door_open, 10)
  closed = parseInt(config.door_closed, 10)
catch err
  console.log 'Error reading config.json from web.coffee!'
  process.exit(1)

# Registration state data, access through the get/set functions
reg_data = {
  registration: false,
  reg_time: '',
  user: '',
  card_desc: '',
  registrar: ''
}

# Set up registration state
exports.set_reg = (username, description, reg_admin) =>
  console.log 'setting registration state'
  reg_data.registration = true
  reg_data.reg_time = Date.now()
  reg_data.user = username
  reg_data.card_desc = description
  reg_data.registrar = reg_admin

# Unset registration state
unset_reg = () =>
  console.log 'unsetting registration state'
  reg_data.registration = false
  reg_data.reg_time = ''
  reg_data.user = ''
  reg_data.card_desc = ''
  reg_data.registrar = ''

# Check that registration state is still valid
get_reg = () =>
  if reg_data.registration is false
    return false
  # If the current time is less than two minutes since registration was set
  # set registration back to false, and return true
  else if Date.now() - reg_data.reg_time < 120000
    console.log 'registration is valid'
    return true
	# If the time has expired, set registration to false and return false
  else
    console.log 'registration is invalid'
    unset_reg()
    return false

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
    # SELECT * FROM door ORDER BY id DESC LIMIT 1
    sql = squel.select()
      .from('door')
      .order('id', false)
      .limit(1).toString()
    console.log sql

    db.each(sql, (err, row) =>
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
  state = valid.escape(req.body.state)
  # We allow '1' or '0' only, this prevents SQL injection and bad data
  if state isnt '1' and state isnt '0'
    res.status(403)
    res.send('ya blew it!\n')
    return

  # INSERT INTO door (state, timestamp) VALUES(state, timestamp);
  sql = squel.insert()
    .into('door')
    .set('state', state)
    .set('timestamp', date()).toString()
  console.log sql

  db.serialize(() =>
    db.run(sql)
    # Send CREATED 201 HTTP status code
    res.status(201)
    res.send('great job!\n')
  )


# POST interface for checking card hashes
exports.door_auth = (req, res, db) =>
  hash = valid.escape(req.body.hash)
  if !hash? or hash is ''
    log_invalid_card(req, res, db, 'N/A')
  # Make sure that the hash is actually a valid hex string
  else if valid.isHexadecimal(hash) is false
    log_invalid_card(req, res, db, hash)

  # If get_reg() is false, then this is a normal auth.
  # Get the row from the database that corresponds to the given hash.
  else if get_reg() is false
    # SELECT * FROM users WHERE hash = 'hash';
    sql = squel.select()
      .from('users')
      .where("hash = '#{hash}'")
      .limit(1).toString()
    console.log sql

    db.get(sql, (err, row) =>
      # If no row was returned, the card is not registered in the database
      if !row then log_invalid_card(req, res, db, hash)
      # If row returned, and user's card is valid, open the door and log this event
      else if row? and row.valid is 'true'
        log_valid_card(req, res, db, row.user, hash)
      # If a row was returned, but the user's card is invalid, log this attempt
      else if row? and row.valid is 'true'
        log_invalid_card(req, res, db, hash)
    )
  # If get_reg() is true, than we are registering a card to the sqlite db
  else
    register_card(req, res, db, hash)

# Logs a valid card swipe
log_valid_card = (req, res, db, user, hash) =>
  console.log 'authenticated ' + row.user
  res.status(200)
  res.send('great job!\n')

  # Log the successful card swipe
  # INSERT INTO swipes (swipe_date, hash, granted, user)
  # VALUES(swipe_date, hash, granted, user);
  sql = squel.insert()
    .into('swipes')
    .set('swipe_date', date())
    .set('hash', hash)
    .set('granted', 'true')
    .set('user', user).toString()
  console.log sql
  db.run(sql)

# Logs an invalid card swipe, and informs the party responsible of this fact
log_invalid_card = (req, res, db, hash) =>
  # Send forbidden 403 HTTP header
  res.status(403)
  res.send('ya blew it!\n')

  # Log the blank hash event by the ip address
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  ip = valid.escape(ip)

  # INSERT INTO swipes (swipe_date, hash, granted, user)
  # VALUES(swipe_date, hash, granted, user);
  sql = squel.insert()
    .into('swipes')
    .set('swipe_date', date())
    .set('hash', hash)
    .set('granted', 'false')
    .set('user', ip).toString()
  console.log sql
  db.run(sql)

# Register the user in the database, and then call log_valid_card() to log it
register_card = (req, res, db, hash) =>
  # INSERT INTO users (user, hash, card_desc, reg_date, registrar)
  # VALUES(user, hash, card_desc, reg_date, registrar);
  sql = squel.insert()
    .into('users')
    .set('user', reg_data.user)
    .set('hash', hash)
    .set('card_desc', reg_data.card_desc)
    .set('reg_date', date())
    .set('registrar', reg_data.registrar).toString()
    .set('valid', 'true')
  console.log sql

  db.run(sql)
  log_valid_card(req, res, db, reg_data.user, hash)
  unset_reg()
