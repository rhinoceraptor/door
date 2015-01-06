StringDecoder = require('string_decoder').StringDecoder
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
  # Configure passport
  passport.serializeUser((user, done) -> done(null, user))
  passport.deserializeUser((user, done) -> done(null, user))

  # Passport user authentication done here
  passport.use(new local_strat((user, passwd, done) ->
    check_passwd(user, passwd, db, (auth_status) ->
      if auth_status is true
        return done(null, true)
      else
        return done(null, false)
    )
  ))

exports.home = (req, res) ->
  res.render('home', {title: 'Door Server'})

exports.login = (req, res, msg) ->
  res.render('login', {title: 'Log In', msg: msg})

check_passwd = (user, password, db, callback) =>
  sql = 'SELECT * FROM admins WHERE user = "' + user + '";'
  db.serialize(() =>
    db.each(sql, (err, row) =>
      # Convert the stored salt back to a hex Buffer
      salt = new Buffer(row.salt, "hex")

      # Hash given password
      key = new Buffer(password)
      params = {"N": 1024, "r": 8, "p": 16}
      hash = scrypt.kdf(key, params, 64, salt)

      # Convert the scrypt hash to a hex digeset
      decode = new StringDecoder('hex')
      hex_hash = decode.write(hash.hash)

      if hex_hash is row.hash
        callback(true)
      else
        callback(false)
    )
  )

exports.logout = (req, res, db) =>
  req.session.destroy((err) ->

    req.logout()
    res.redirect('/')
  )

exports.logs = (req, res, db, config) =>
  if req.user
    if req.body.days? and valid.isInt(req.body.days)
      days = Math.abs(req.body.days)
    else
      days = 7
    # Data will be an array filled from db that is placed in a table by jade
    get_swipe_logs(db, days, (data) =>
      res.render('swipe-logs', {
        title: 'Swipe Logs',
        data: data
      })
    )
  else
    res.redirect('/login')


get_swipe_logs = (db, days, callback) =>
  run_cmd('date', '', (resp) =>
    # Feed the current date into moment.js, subtract var days number of days
    date_range = moment(resp).subtract(days, 'days')
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
  )

cmp_func = (a, b) =>
 if moment(a[1]).isAfter(moment(b[1]))
   return -1
 else
   return 1

exports.reg_user = (req, res, db) =>
  if req.user
    res.render('reg-user', {title: 'Register a User'})
  else
    res.redirect('/login')

# REST endpoint function for registering a card
exports.reg_user_post = (req, res, db) =>

# Render the dereg-user.jade view
exports.dereg_user = (req, res, db) =>
  if req.user
    res.render('dereg-user', {title: 'Deregister a User'})
  else
    res.redirect('/login')

# REST endpoint function for deregistering a card
exports.dereg_user_post = (req, res, db) =>


# Render card-reg-logs.jade for card registration logs
exports.card_reg_logs = (req, res, db) =>
  if req.user
    # Data will be an array filled from db that is placed in a table by jade
    get_reg_logs(db, (data) =>
      res.render('card-reg-logs', {
        title: 'Card Registration Logs',
        data: data
      })
    )
  else
    res.redirect('/login')

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

# Function for running shell commands. Pass it a callback, it's asynchronous.
# Thank you to cibercitizen1 on Stack Overflow:
# http://stackoverflow.com/questions/14458508/node-js-shell-command-execution
run_cmd = (cmd, args, callback) ->
  child = spawn(cmd, args)
  resp = ''
  child.stdout.on('data', (buffer) -> resp += buffer.toString())
  child.stdout.on('end', () -> callback(resp))