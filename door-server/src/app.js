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

const session = require('./middleware/session'),
  ssl = require('./middleware/ssl')

app.get('/',
app.get('/web/user/log-in', require('./controllers/web/user').getLogIn)
app.get('/web/user/log-in/failure', require('./controllers/web/user').getLogIn)

// Must be authenticated for all /web endpoints from here on
app.use('/web', session)

app.get('/web/user/register', require('./controllers/web/user').getRegister)
app.post('/web/user/register', require('./controllers/web/user').postRegister)
app.get('/web/user/deregister', require('./controllers/web/user').getDeregister)
app.post('/web/user/deregister', require('./controllers/web/user').postDeregister)
app.post('/web/user/log-in', passport.authenticate('local', {
  successRedirect: '/web/logs/swipe',
  failureRedirect: '/web/log-in/failure'
}))

app.get('/web/door/open', require('./controllers/web/door').getOpen)

app.get('/web/logs/swipe', require('./controllers/web/logs').getSwipe)
app.post('/web/logs/swipe', require('./controllers/web/logs').postSwipe)
app.get('/web/logs/card-registration', require('./controllers/web/logs').getCardRegistration)

app.get('/api/door', require('./controllers/api/door').getDoor)

// Must use SSL client key for all /api endpoints from here on
app.use('/api', ssl)
app.post('/api/door', require('./controllers/api/door').postDoor)
app.post('/api/door/auth', require('./controllers/api/door').postAuth)

/* Set up app with HTTPS to listen on port config.port */
https.createServer(ssl_opts, app).listen(config.port, function() {
  console.log(`listening on port ${config.port}`)
})

