express = require('express')
http = require('http')
https = require('https')
fs = require('fs')
sqlite3 = require('sqlite3').verbose()

open = 1
closed = 0

# Read config.json, set parameters accordingly
##############################################
config = fs.readFileSync('./config.json')
try
  obj = JSON.parse(config)
  socket_port = obj.socket_port
  rest_port = obj.rest_port
  sql_db = obj.sql_db
  console.log 'server configuration:\n---------------------'
  console.log 'socket_port: ' + socket_port
  console.log 'rest_port: ' + rest_port
  console.log 'sql_db: ' + sql_db
catch err
  console.log 'Error reading config.json!'
  process.exit(1)

db = new sqlite3.Database(sql_db)

db.serialize(() ->
  db.each('SELECT * FROM door', (err, row) ->
    console.log row.state
  )
)


app = express()

app.get('/door', (req, res) ->
  db.serialize(() ->
    db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) ->
      if row.state is open
        res.send('The door is open.\n')
      else
        res.send('The door is closed.\n')
    )
  )
)

app.get('/door-verbose', (req, res) ->
  db.serialize(() ->
    db.each('SELECT * FROM door ORDER BY date DESC LIMIT 1', (err, row) ->
      if row.state is open
        res.send('The door was open as of ' + row.date + '.\n')
      else
        res.send('The door was closed as of ' + row.date + '.\n')
    )
  )
)

app.listen(9001)