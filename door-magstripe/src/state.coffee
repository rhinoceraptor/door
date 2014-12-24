fs = require('fs')
gpio = require('pi-gpio')
request = require('request')
interval = ""
config = JSON.parse(fs.readFileSync('config.json'))

door_pin = config.door_pin
server = config.node_server
port = config.rest_port
path = config.door_path
update_freq = parseInt(config.update_freq, 10)

process.on('SIGINT', () ->
  console.log 'goodbye!'
  # Close the GPIO
  gpio.close(door_pin)
  # If interval is a setInterval object, clear it
  if interval._idleTimeout?
    clearInterval(interval)
)

options = {
  key: config.ssl_key,
  cert: config.ssl_cert,
  ca: config.ssl.ca
}

gpio.open(door_pin, "input", (err) ->
  if err
    console.log err
    process.exit(1)
  else
    interval = setInterval(read_pin, update_freq, door_pin)
)

read_pin = (door_pin) ->
  console.log 'hello from read_pin'
  gpio.read(door_pin, (err, value) ->
    if err
      console.log err
      process.exit(1)
    else
      srv = String('http://' + server + ':' + port + path)
      console.log 'POSTing ' + value + ' to ' + srv
      request.post({url: srv, form:{"state": value}}, (err, resp, body) ->
        if err
          console.log 'error: ' + err
        else
          console.log 'body: ' + body
      )
  )
