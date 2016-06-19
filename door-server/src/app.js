'use strict'

const https = require('https'),
  fs = require('fs'),
  express = require('express'),
  express_session = require('express-session'),
  express_favicon = require('express-favicon'),
  body_parser = require('body-parser'),
  passport = require('passport')

const config = require('./config')

const ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
}

var app = express()
app.use(express_favicon(__dirname + '/../public/ccowmu.ico'))
app.set('views', './views')
app.set('view engine', 'jade')
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(express.static(__dirname + '/../public'))
app.use(
  express_session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.get('/',
app.get('/web/log-in',

// Must be authenticated for all /web endpoints from here on
app.use('/web', session.authCheck)
app.get('/web/open-door',
app.get('/web/logs/swipe'
app.post('/web/logs/swipe'
app.get('/web/logs/card-registration'
app.get('/web/card-reg-logs',
app.get('/web/user/register',
app.post('/web/user/register',
app.get('/web/user/deregister'
app.post('/web/user/deregister'
app.get('/web/log-in/failure'
app.post('/web/log-in', passport.authenticate('local', {
  successRedirect: '/web/swipe-logs',
  failureRedirect: '/web/log-in-failure'
}))

app.get('/api/door',

// Must use SSL client key for all /api endpoints from here on
app.use('/api', session.ssl_check)
app.post('/api/door',
app.post('/api/door-auth',

/* Set up app with HTTPS to listen on port config.port */
https.createServer(ssl_opts, app).listen(config.port, function() {
  console.log(`listening on port ${config.port}`)
})
