StringDecoder = require('string_decoder').StringDecoder
scrypt = require('scrypt')
fs = require('fs')
sqlite3 = require('sqlite3').verbose()
passport = require('passport')
local_strat = require('passport-local').Strategy

exports.config = (db) ->
  # Configure passport
  passport.serializeUser((user, done) -> done(null, user))
  passport.deserializeUser((user, done) -> done(null, user))
  # Passport user authentication done here
  passport.use(new local_strat((user, passwd, done) ->
    check_passwd(user, passwd, db, (status) ->
      if status is true
        return done(null, true)
      else
        return done(null, false)
    )
  ))

exports.home = (req, res) ->
  res.render('home', {title: 'Door Server'})

exports.login = (req, res) ->
  res.render('login', {title: 'Log In'})

exports.login_success = (req, res) ->
  res.render('login-success', {title: 'Login Success'})

exports.login_failure = (req, res) ->
  res.render('login-failure', {title: 'Login Failure'})

check_passwd = (user, password, db, callback) =>
  sql = 'SELECT * FROM admins WHERE user = "' + user + '" LIMIT 1;'
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
