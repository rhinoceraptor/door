fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
prompt = require('prompt')
scrypt = require('scrypt')
decode = require('string_decoder').StringDecoder
body_parser = require('body-parser')
sqlite3 = require('sqlite3').verbose()
squel = require('squel')

# Read config.json synchronously
try
  config = JSON.parse(fs.readFileSync('./config.json'))
catch err
  console.log 'Error reading config.json!'
  process.exit(1)

console.log 'Adding a new admin to the database file: ' + config.sql_db

# Set up sqlite connection
db = new sqlite3.Database(config.sql_db)

# Get username and password from stdin
prompt.start()
prompt.get(['username', 'password'], (err, result) ->
  if err
    console.log err
  if valid.isAlpha(result.username) is false
    console.log 'Invalid username.'
    process.exit(1)

  console.log 'You entered:'
  console.log 'username: ' + result.username
  username = result.username
  console.log 'password: ' + result.password
  password = result.password
  console.log 'Is this correct? (y/n)'

  prompt.get(['correct'], (err, result) =>
    if err
      console.log err
    else if result.correct is 'n'
      process.exit()
    else if result.correct is 'y'

      check_user_reg(username, (reg) =>
        if reg is false
          gen_hash(username, password)
        else
          console.log 'That username already exists.'
      )
  )
)

# Generate the salt and hash, then call db_insert
gen_hash = (username, password) ->
  key = new Buffer(password)
  params = {"N": 1024, "r": 8, "p": 16}
  hash = scrypt.kdf(key, params, 64)
  decoder = new decode('hex')
  hex_hash = decoder.write(hash.hash)
  hex_salt = decoder.write(hash.salt)
  console.log 'username is ' + username
  console.log 'hex_hash is ' + hex_hash
  console.log 'hex_salt is ' + hex_salt
  db_insert(username, hex_salt, hex_hash)

# Check if the requested username is already registered
# Return true is the user is registered, false if not
check_user_reg = (username, callback) =>
  # SELECT * FROM admins WHERE user = 'username';
  sql = squel.select()
    .from('admins')
    .where("user = #{username}").toString()

  db.all(sql, (err, row) ->
    if row? and row.length? and row.length > 0
      callback(true)
    else
      callback(false)
  )

# Insert the username, hash and salt it is given into sqlite
db_insert = (username, salt, hash) =>
  username = valid.escape(username)
  salt = valid.escape(salt)
  hash = valid.escape(hash)

  # INSERT INTO admins (user, salt, hash, reg_date)
  # VALUES(user, salt, hash, reg_date);
  sql = squel.insert()
    .into('admins')
    .set('user', username)
    .set('salt', salt)
    .set('hash', hash)
    .set('reg_date', new Date().toString()).toString()

  db.run(sql)
