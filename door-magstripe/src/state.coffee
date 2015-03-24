request = require('request')
fs = require('fs')
exec = require('exec')
interval = ""
config = JSON.parse(fs.readFileSync('config.json'))

update_freq = parseInt(config.update_freq, 10)

# Handle ctrl-c cleanly
process.on('SIGINT', () ->
  # If interval is a setInterval object, clear it
  if interval._idleTimeout?
    clearInterval(interval)
)

read_state = ->
  exec('./state', (err, stdout, stderr) ->
    if err then console.log err
    if stdout is '1' then value = '1'
    else if stdout is '0' then value = '0'

    url = 'https://' + config.node_url + ':' + config.rest_port + config.door_path
    opts = {
      url: url,
      method: 'POST',
      path: '/door',
      key: fs.readFileSync(config.ssl_key),
      cert: fs.readFileSync(config.ssl_cert),
      rejectUnauthorized: false,
      form: {
        'state': value
      }
    }

    request.post(opts, (err, resp, body) ->
      if err
        console.log 'error: ' + err
      else
        console.log 'body: ' + body
    )
  )

# Write the state once to show that it is working before the interval
read_state()

# Set the interval
interval = setInterval(read_state, update_freq)

