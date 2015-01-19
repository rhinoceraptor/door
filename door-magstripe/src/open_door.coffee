gpio = require('pi-gpio')

num_steps = 4100
max_steps = num_steps * 1.5


left = true
right = false

# Set up GPIO pins
sensor = gpio.input(18)
relay = gpio.output(4)
direction = gpio.output(17)
step_pin = gpio.output(27)

# Thread blocking sleep function
sleep = (milliseconds) ->
  start = new Date().getTime()
  i = 0
  while i < 1e7
    break if (new Date().getTime() - start) > milliseconds
    i++

# Step right
right = () ->
  direction(0)
  step_pin(1)
  step_pin(0)
  sleep(0.001)

# Step left
left = () ->
  direction(1)
  step_pin(1)
  step_pin(0)
  sleep(0.001)

# Turn on the stepper motor
relay(1)

iter = max_steps
while sensor() is false and iter--
  if sensor()
    console.log 'sensor!!!'
  if iter is 1
    console.log 'iter!!!'
  right()

sleep(5000)

iter = num_steps
while iter--
  left()

# Turn off the stepper motor
relay(0)

