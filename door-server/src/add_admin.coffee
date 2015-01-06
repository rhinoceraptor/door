fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
prompt = require('prompt')
scrypt = require('scrypt')
decode = require('string_decoder').StringDecoder
body_parser = require('body-parser')
sqlite3 = require('sqlite3').verbose()

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
      gen_hash(username, password)
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

# Insert the username, hash and salt it is given into sqlite
db_insert = (username, salt, hash) =>
  run_cmd('date', '', (resp) =>
    sql = 'INSERT INTO admins VALUES("' + username + '", "' + salt + '", "' + hash + '", "' + resp + '");'
    console.log sql
    db.run(sql)
  )

# Function for running shell commands. Pass it a callback, it's asynchronous.
# Thank you to cibercitizen1 on Stack Overflow:
# http://stackoverflow.com/questions/14458508/node-js-shell-command-execution
run_cmd = (cmd, args, callback) ->
  child = spawn(cmd, args)
  resp = ''
  child.stdout.on('data', (buffer) -> resp += buffer.toString())
  child.stdout.on('end', () -> callback(resp))
