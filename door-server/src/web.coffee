StringDecoder = require('string_decoder').StringDecoder
scrypt = require('scrypt')
fs = require('fs')
sqlite3 = require('sqlite3').verbose()
passport = require('passport')
local_strat = require('passport-local').Strategy

exports.config = (db) ->
  # Configure passport
  passport.serializeUser((user, done) ->
    console.log 'serializeUser'
    done(null, user)
  )
  passport.deserializeUser((user, done) ->
    console.log 'deserializeUser'
    done(null, user)
  )

  # Passport user authentication done here
  passport.use(new local_strat((user, passwd, done) ->
    check_passwd(user, passwd, db, (auth_status) ->
      if auth_status is true
        console.log 'auth success!'
        return done(null, true)
      else
        console.log 'auth failed!'
        return done(null, false)
    )
  ))

exports.home = (req, res) ->
  res.render('home', {title: 'Door Server'})

exports.login = (req, res) ->
  res.render('login', {title: 'Log In'})

exports.login_failure = (req, res) ->
  res.render('login-failure', {title: 'Login Failure'})

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
  console.log 'logging out'
  req.session.destroy((err) ->

    req.logout()
    res.redirect('/')
  )

exports.logs = (req, res, db) =>
  if req.user
    res.render('logs', {title: 'logs', data: get_data(db, 7)})
  else
    res.redirect('/login')


get_data = (db, days) ->
  rows = new Array()

  sql = 'SELECT * FROM swipes ORDER BY "swipe_date";'
  db.serialize(() =>
    db.each(sql, (err, row) =>
      console.log row
    )
  )

exports.reg_user = (req, res, db) =>
  if req.user
    res.render('reg-user', {title: 'Register a User'})
  else
    res.redirect('/login')


exports.dereg_user = (req, res, db) =>
  if req.user
    res.render('dereg-user', {title: 'Deregister a User'})
  else
    res.redirect('/login')
