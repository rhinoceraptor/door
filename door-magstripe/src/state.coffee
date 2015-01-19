fs = require('fs')
gpio = require('pi-gpio')
request = require('request')
interval = ""
config = JSON.parse(fs.readFileSync('config.json'))

update_freq = parseInt(config.update_freq, 10)

process.on('SIGINT', () ->
  # Close the GPIO
  gpio.close(config.door_pin)
  # If interval is a setInterval object, clear it
  if interval._idleTimeout?
    clearInterval(interval)
)

open_pin = () =>
  gpio.open(config.door_pin, "input", (err) ->
    if err
      console.log err
      process.exit(1)
    else
      read_pin(config.door_pin)
  )

read_pin = (door_pin) ->
  console.log 'hello from read_pin'
  gpio.read(config.door_pin, (err, value) ->
    if err
      console.log err
      process.exit(1)
    else
      console.log 'value: ' + value
      gpio.close(door_pin)

      url = config.node_url + config.door_path
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

# Call open_pin once
open_pin()
# Set the interval
interval = setInterval(open_pin, update_freq)
