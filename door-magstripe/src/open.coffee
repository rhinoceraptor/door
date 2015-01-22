async = require 'async'
fs = require('fs')
gpio = require('pi-gpio')
request = require('request')
config = JSON.parse(fs.readFileSync('config.json'))

# Register SIGINT handler
process.on('SIGINT', () ->
  # Close the GPIO
  gpio.close(config.relay_pin)
  gpio.close(config.step_pin)
  gpio.close(config.dir_pin)
)

error = (err) ->
  console.log 'Encountered error: \n' + err
  process.exit(1)

step = (direction) ->
  if direction is 'left'
    dir_step = 1
  else if direction is 'right'
    dir_step = 0

  async.waterfall [
  # Write the direction to the stepper board
  (callback) ->
    gpio.write(config.dir_pin, dir_step, (err) ->
      if err then error(err)
      callback(null)

  # Set the step pin high
  (callback) ->
    gpio.write(config.step_pin, 1, (err) ->
      if err then error(err)
      callback(null)

  # Set the step pin low
  (callback) ->
    gpio.write(config.step_pin, 0, (err) ->
      if err then error(err)
      callback(null)
  ], (err) ->
    if err then error(err)
    
# async's waterfall pattern lets us write nested callbacks linearly
async.waterfall [
  # Open the GPIO relay pin
  (callback) ->
    gpio.open(config.relay_pin, 'input', (err) ->
      if err then error(err)
      callback(null)

  # Open the GPIO step pin
  (callback) ->
    gpio.open(config.step_pin, 'input', (err) ->
      if err then error(err)
      callback(null)

  # Open the GPIO direction pin
  (callback) ->
     gpio.open(config.dir_pin, 'input', (err) ->
      if err then error(err)
      callback(null)
  
], (err) ->
  if err then error(err)
