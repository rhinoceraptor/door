

date = () -> new Date().toString()

exports.config = (db) ->
# Hash the password using scrypt
hash_passwd = (password, salt) ->
  # Convert the stored salt from the database to a hex Buffer
  salt = new Buffer(salt, 'hex')

  # Hash given password
  key = new Buffer(password)
  params = {'N': 1024, 'r': 8, 'p': 16}
  hash = scrypt.kdf(key, params, 64, salt)

  # Convert the scrypt hash to a hex digest
  decode = new string_decoder('hex')
  hex_hash = decode.write(hash.hash)
  return hex_hash

# Middleware function to check that the user is logged in. Passport's
# middleware injects the 'user' attribute on req if the user has been
# authenticated using the local strategy.
exports.is_authed = (req, res, next) ->
  if req.user
    next()
  else
    res.redirect('/login')

# Render the login page
exports.login = (req, res, msg) ->
  res.render('login', {title: 'Log In', msg: msg})

# Log the user associated with req out.
exports.logout = (req, res, db) =>
  req.session.destroy((err) ->
    req.logout()
    res.redirect('/')
  )

# Open the door. The web client will call this rest endpoint, and then here we
# call to /door-open on the raspberry pi.
exports.open_door = (req, res, db, config) ->
  url = 'https://' + config.rpi_url + ':' + config.rpi_port + config.rpi_open
  console.log 'url: ' + url
  opts =  {
    url: url,
    method: 'GET',
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert),
    rejectUnauthorized: false
  }

  request.get(opts, (err, resp, body) =>
    if err then console.log err
    if body then console.log body
    res.send('great job!\n')
    res.end()
  )

  # Log the door opening by the admin's user name
  # INSERT INTO swipes (swipe_date, hash, granted, user)
  # VALUES('date()', 'N/A', 'true', 'user')
  sql = squel.insert()
    .into('swipes')
    .set('swipe_date', date())
    .set('hash', 'N/A')
    .set('granted', 'true')
    .set('user', valid.escape(req.user.user)).toString()
  console.log sql
  db.run(sql)

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

  # SELECT * FROM swipes ORDER BY swipe_date DESC;
  sql = squel.select()
    .from('swipes')
    .order('swipe_date', false).toString()

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
  # Check if the user sent us valid data to store for registration
  if !req.body.username? or !req.body.card_desc? or !req.body.registrar?
    res.status(403)
    res.render('error', {title: 'Error', msg: 'Error: enter valid data!'})
  else
    user = valid.escape(req.body.username)
    desc = valid.escape(req.body.card_desc)
    registrar = valid.escape(req.user.user)
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

    # UPDATE users SET valid = 'false', registrar = 'admin'
    # WHERE user = 'user';
    sql = squel.update()
      .table('users')
      .set('valid', 'false')
      .set('registrar', req.user.user)
      .where("user = '#{user}'").toString()
    db.run(sql)
    res.redirect('/swipe-logs')

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

  # SELECT * FROM users ORDER BY reg_date DESC;
  sql = squel.select()
    .from('users')
    .order('reg_date', false).toString()

  db.serialize(() =>
    db.each(sql, (err, row) =>
      # If the current row is after the date_range, add it to the array
      data.push([row.user, row.card_desc, row.reg_date, row.registrar])
    , (err, rows) =>
      callback(data)
    )
  )
