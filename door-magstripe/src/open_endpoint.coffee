fs = require('fs')
exec = require('exec')
https = require('https')
express = require('express')

config = JSON.parse(fs.readFileSync('config.json'))

ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
}

app = express()
console.log 'ready'
ssl_auth = (req, res, next) ->
  if req.client.authorized
    console.log 'client authorized'
    next()
  else
    res.status(401)
    res.send('ya blew it\n')
    console.log 'client not authorized'
    return

app.get('/open-door', ssl_auth, (req, res) ->
  console.log 'open the door!'
  res.status(200)
  res.send('great job!\n')
  exec('./open', (err, stdout, stderr) ->
    if err then console.log err
  )
)

# Set up app with HTTPS to listen on port config.port
https.createServer(ssl_opts, app).listen(config.self_port, () ->
  console.log 'listening on port ' + config.self_port
)

