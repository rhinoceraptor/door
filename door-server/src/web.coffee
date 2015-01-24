string_decoder = require('string_decoder').StringDecoder
spawn = require('child_process').spawn
scrypt = require('scrypt')
fs = require('fs')
valid = require('validator')
moment = require('moment')
request = require('request')
sqlite3 = require('sqlite3').verbose()
passport = require('passport')
local_strat = require('passport-local').Strategy

exports.config = (db) ->
  # Configure passport serialization
  passport.serializeUser((user, done) -> done(null, user))
  passport.deserializeUser((user, done) -> done(null, user))

  # Passport user authentication done here
  passport.use(new local_strat((user, passwd, done) ->
    # Check that the username is an alphanumeric string
    if !valid.isAlpha(user)
      return done(null, false)

    check_passwd(user, passwd, db, (auth_status) ->
      if auth_status is true
        return done(null, true)
      else
        return done(null, false)
    )
  ))

# Middleware function to check that the user is logged in
exports.is_authed = (req, res, next) ->
  if req.user
    next()
  else
    res.redirect('/login')

# Render the login page
exports.login = (req, res, msg) ->
  res.render('login', {title: 'Log In', msg: msg})

check_passwd = (user, password, db, callback) =>
  sql = 'SELECT * FROM admins WHERE user = "' + user + '";'
  console.log sql
  db.all(sql, (err, row) =>
    if err
      console.log err
    # If row is empty, the user does not exist. Row is an array.
    if !row[0]? or row[0] is ''
      console.log 'user not found'
      callback(false)
      return
    # If there is more than one admin with the same username, something bad
    # must have happened, so don't allow them to log in.
    else if row.length > 1
      console.log 'more than one user found'
      callback(false)
      return

    # Convert the stored salt back to a hex Buffer
    salt = new Buffer(row[0].salt, 'hex')

    # Hash given password
    key = new Buffer(password)
    params = {'N': 1024, 'r': 8, 'p': 16}
    hash = scrypt.kdf(key, params, 64, salt)

    # Convert the scrypt hash to a hex digeset
    decode = new string_decoder('hex')
    hex_hash = decode.write(hash.hash)

    # If the hex digest of the hash we just computed matches the hex digest in
    # the database, log the admin in.
    if hex_hash is row[0].hash
      callback(true)
      return
    else
      callback(false)
      return
  )

# Log the user associated with req out.
exports.logout = (req, res, db) =>
  req.session.destroy((err) ->
    req.logout()
    res.redirect('/')
  )

# Render the swipe logs page using either the default 7 days, or with the
# requested number of days (coming from a POST to /swipe-logs).
exports.logs = (req, res, db, config) =>
  # Ensure that the requested number of days is an integer, and take the
  # absolute value of it just to be safe.
  if req.body.days? and valid.isInt(req.body.days)
    days = Math.abs(valid.escape(req.body.days))
  else
    days = 7
  # Data will be an array filled from db that is placed in a table by jade
  get_swipe_logs(db, days, (data) =>
    res.render('swipe-logs', {title: 'Swipe Logs', data: data})
  )


get_swipe_logs = (db, days, callback) =>
  # Feed the current date into moment.js, subtract var days number of days
  date_range = moment(new Date().toString()).subtract(days, 'days')
  data = []
  sql = 'SELECT * FROM swipes ORDER BY "swipe_date" DESC;'
  db.serialize(() =>
    db.each(sql, (err, row) =>
      # If the current row is after the date_range, add it to the array
      if moment(row.swipe_date).isAfter(date_range)
        data.push([row.user, row.swipe_date, row.granted])
    , (err, rows) =>
      data.sort(cmp_func)
      callback(data)
    )
  )

# Comparator function for the JavaScript array.sort() function
cmp_func = (a, b) =>
 if moment(a[1]).isAfter(moment(b[1]))
   return -1
 else
   return 1

# Render the reg-user jade view
exports.reg_user = (req, res, db) =>
  res.render('reg-user', {title: 'Register a User'})

# REST endpoint function for registering a card
exports.reg_user_post = (req, res, db, rest) =>
  if !req.body.username? or !req.body.card_desc? or !req.body.registrar?
    res.status(403)
    res.render('error', {title: 'Error', msg: 'Error: enter valid data!'})
  else
    user = valid.escape(req.body.username)
    desc = valid.escape(req.body.card_desc)
    registrar = valid.escape(req.body.registrar)
    console.log 'registration state for ' + user
    rest.set_reg(user, desc, registrar)
    res.status(200)
    res.redirect('/swipe-logs')

# Render the dereg-user.jade view
exports.dereg_user = (req, res, db) =>
  res.render('dereg-user', {title: 'Deregister a User'})

# REST endpoint function for deregistering a card
exports.dereg_user_post = (req, res, db) =>
  console.log 'dereg_user_post'
  if !req.body.user or req.body.user is ''
    console.log 'hi'
    res.render('error', {title: 'Error', msg: 'Error: No username supplied'})
  else
    user = valid.escape(req.body.user)
    sql = 'DELETE FROM users where "user" = "' + user + '";'
    db.serialize(() =>
      db.run(sql)
      res.redirect('/swipe-logs')
    )

# Render card-reg-logs.jade for card registration logs
exports.card_reg_logs = (req, res, db) =>
  # Data will be an array filled from db that is placed in a table by jade
  get_reg_logs(db, (data) =>
    res.render('card-reg-logs', {
      title: 'Card Registration Logs',
      data: data
    })
  )

# Get card registration logs from the database
get_reg_logs = (db, callback) =>
  # Feed the current date into moment.js, subtract var days number of days
  data = []
  sql = 'SELECT * FROM users ORDER BY "reg_date" DESC;'
  db.serialize(() =>
    db.each(sql, (err, row) =>
      # If the current row is after the date_range, add it to the array
      data.push([row.user, row.card_desc, row.reg_date, row.registrar])
    , (err, rows) =>
      callback(data)
    )
  )

