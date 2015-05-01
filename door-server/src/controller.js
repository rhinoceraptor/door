let string_decoder = require('string_decoder').StringDecoder,
  spawn = require('child_process').spawn
  scrypt = require('scrypt')
  fs = require('fs')
  valid = require('validator')
  moment = require('moment')
  request = require('request')
  sqlite3 = require('sqlite3').verbose()
  squel = require('squel')
  passport = require('passport')
  local_strat = require('passport-local').Strategy

class controller {

  /* Render the login page */
  static login(req, res, msg) {
    res.render('login', {title: 'Log In', msg: msg});
  }



}
