'use strict'

const https = require('https'),
  fs = require('fs'),
  path = require('path'),
  express = require('express'),
  helmet = require('helmet'),
  morgan = require('morgan'),
  expressSession = require('express-session'),
  expressFavicon = require('express-favicon'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  handlebars = require('express-handlebars'),
  localStrategy = require('passport-local').Strategy

const config = require('./config'),
  adminModel = require('./models/admin')

const sslOptions = {
  key: fs.readFileSync(config.sslKey),
  cert: fs.readFileSync(config.sslCert),
  ca: fs.readFileSync(config.sslCa),
  requestCert: true,
  rejectUnauthorized: false
}

var app = express()
app.use(expressFavicon(path.join(__dirname, './public/ccowmu.ico')))
app.use(helmet())
app.use(morgan('tiny'))
app.set('views', './views')
app.engine('hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', '.hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(expressSession({
  secret: config.secret,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(adminModel.serializePassport)
passport.deserializeUser(adminModel.deserializePassport)
passport.use(new localStrategy(adminModel.authenticatePassport))

const session = require('./middleware/session'),
  ssl = require('./middleware/ssl')

app.get('/web/user/log-in', require('./controllers/web/user').getLogIn)
app.get('/web/user/log-in/failure', require('./controllers/web/user').getLogIn)

// Must be authenticated for all /web endpoints from here on
app.use('/web', session)

app.get('/', (req, res) => res.render('home'));
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

https.createServer(sslOptions, app).listen(config.port, () => {
  console.log(`listening on port ${config.port}`)
})

