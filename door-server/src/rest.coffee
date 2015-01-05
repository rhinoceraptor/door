fs = require('fs')
spawn = require('child_process').spawn
valid = require('validator')
express = require('express')
scrypt = require('scrypt')
decode = require('string_decoder').StringDecoder
body_parser = require('body-parser')
sqlite3 = require('sqlite3').verbose()
passport = require('passport-local')


class rest
  constructor: () ->
    # Read config.json synchronously
    try
      config = JSON.parse(fs.readFileSync('./config.json'))
      @open = parseInt(config.door_open, 10)
      @closed = parseInt(config.door_closed, 10)
    catch err
      console.log 'Error reading config.json!'
      process.exit(1)

    # Set up sqlite connection
    @db = new sqlite3.Database(config.sql_db)

    # Set up passport
    passport.use(new LocalStrategy(username, password, done) ->

    )

  # GET interface for the door state
  door_get: (req, res) =>
    @db.serialize(() =>
      # Search the door table, order by last row by date, and limit to one result
      @db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) =>
        if row.state is @open
          res.send('The door was open as of ' + row.date + '.\n')
        else if row.state is @closed
          res.send('The door was closed as of ' + row.date + '.\n')
        else
          res.send('ya blew it!\n')
      )
    )

  # POST interface for the raspberry pi to send the door state
  # You can post to it like this: 'curl --data "state=0" <ip>:<port>/door'
  # TODO: SSL only for rpi authentication (Using self generated CA)
  door_post: (req, res) =>
    state = req.body.state
    # We allow '1' or '0' only, this prevents SQL injection and bad data
    if state isnt '1' and state isnt '0'
      res.status(403)
      res.send('ya blew it!\n')
      return
    @run_cmd('date', '', (resp) =>
      sql = 'INSERT INTO door VALUES(' + state + ', "' + resp.trim() + '");'
      @db.serialize(() =>
        @db.run(sql)
        # Send CREATED 201 HTTP status code
        res.status(201)
        res.send('great job!\n')
      )
    )

  # POST interface for checking card hashes
  # You can post to it like this: 'curl --data "hash=<hash>" <ip>:<port>/door-auth'
  # TODO: SSL only for rpi authentication (Using self generated CA)
  # TODO: The registration variable will be set when an admin initiates a user
  # registration event, the rpi doesn't know the difference and will post as usual
  door_auth: (req, res) =>
    hash = req.body.hash
    if !hash? or hash is ''
      # Send forbidden 403 HTTP header
      res.status(403)
      res.send('ya blew it!\n')

      # Log the blank hash event by the ip address
      ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      date = @run_cmd('date', '', (resp) =>
        sql = 'INSERT INTO swipes VALUES("' + date + '", "N/A", "false", "' + ip + '");'
        console.log sql
        @db.run(sql)
      )
      return
    # Make sure that the hash we are going to test against the database is
    # actually a hex string, to prevent SQL injection.
    else if valid.isHexadecimal(hash) is false
      # Send forbidden 403 HTTP header
      res.status(403)
      res.send('ya blew it!\n')
      return

    @run_cmd('date', '', (resp) =>
      # If registration is false, then this is a normal auth
      if registration is false
        sql = 'SELECT * FROM users WHERE hash = "' + hash + '" LIMIT 1;'

        @db.serialize(() =>
          @db.each(sql, (err, row) =>
            if err
              console.log err
              # Send internal error 500 HTTP header
              res.status(500)
              res.send('ya blew it!\n')
            else if row?
              console.log 'authenticated ' + row.user
              res.status(200)
              res.send('great job!\n')
              # Log the successful card swipe
              date = @run_cmd('date', '', (resp) =>
                sql = 'INSERT INTO swipes VALUES("' + date + '", "' + hash +'", "true", "' + row.user + '");'
                console.log sql
                @db.run(sql)
              )
          # Completion callback, called when the query is done
          , (err, rows) =>
            # If number of returned rows is 0, then attempt has failed
            if rows is 0
              # Send unauthorized 401 HTTP header
              res.status(401)
              res.send('ya blew it!\n')
              # Log the unsuccessful card swipe by ip address
              date = @run_cmd('date', '', (resp) =>
                ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
                sql = 'INSERT INTO swipes VALUES("' + date + '", "' + hash + '", "false", "' + ip + '");'
                console.log sql
                @db.run(sql)
              )
          )
        )

      # If registration is true, than we are registering a card to the sqlite db
      else if registration is true
        console.log 'spooked ya'
    )


  # Gets the hex digest salt from the database, and converts it to a hex buffer
  get_salt: (username) ->
    sql = 'SELECT salt FROM admins WHERE user = ' + username
    db.get(sql, (err, row) ->
      if err

  hash_passwd: (password, salt) ->
    hash =

  # Function for running shell commands. Pass it a callback, it's asynchronous.
  # Thank you to cibercitizen1 on Stack Overflow:
  # http://stackoverflow.com/questions/14458508/node-js-shell-command-execution
  run_cmd: (cmd, args, callback) ->
    child = spawn(cmd, args)
    resp = ''
    child.stdout.on('data', (buffer) -> resp += buffer.toString())
    child.stdout.on('end', () -> callback(resp))

module.exports = rest
