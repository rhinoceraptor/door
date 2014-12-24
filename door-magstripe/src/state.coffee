fs = require 'fs'
gpio = require 'pi-gpio'
request = require 'request'
interval = ""
config = JSON.parse(fs.readFileSync('config.json'))

door_pin = config.door_pin

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
    interval = setInterval(read_pin, 2000, door_pin)
)

read_pin = (door_pin) ->
  console.log 'hello from read_pin'
  gpio.read(door_pin, (err, value) ->
    if err
      console.log err
      process.exit(1)
    else
      console.log 'value is ' + value
  )
