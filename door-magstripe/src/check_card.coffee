fs = require('fs')
exec = require('exec')
crypto = require('crypto')
hid = require('node-hid')
request = require('request')

# Get configuration from json files
config = JSON.parse(fs.readFileSync('config.json'))
map = JSON.parse(fs.readFileSync(config.char_map_file))
node_server = config.node_server
node_port = config.rest_port
path = config.auth_path

# Set up the magstripe device, exit if none or more than one are plugged in
magstripe = hid.devices(config.vendor_id, config.product_id)

if magstripe.length > 1
  console.log 'More than one magstripe reader is plugged in!'
  process.exit(1)
else if magstripe.length is 0
  console.log 'No magstripe reader is plugged in!'
  process.exit(1)

magstripe = magstripe[0]
dev = new hid.HID(magstripe.path)

# Register data event callback
dev.on('data', (data) ->
  # Every other data chunk will be 0, skip these
  if data? and data[2] isnt "0" and data[2] isnt 0
    card_string = card_builder(data)
    if card_string isnt "continue"
      # Hash the card string we have
      hash = hash_string(card_string)
      # Reset the card string variable
      card = ""
      # Use the hashed card string to POST to the server
      url = 'https://' + config.node_url + ':' + config.rest_port + config.auth_path
      opts = {
        url: url,
        method: 'POST',
        key: fs.readFileSync(config.ssl_key),
        cert: fs.readFileSync(config.ssl_cert),
        rejectUnauthorized: false,
        form: {
          'hash': hash
        }
      }

      request.post(opts, (err, resp, body) ->
        if err
          console.log 'error: ' + err
        if resp.statusCode is 200
          exec('./open', (err, stdout, stderr) ->
            if err then console.log err
          )
        else
          console.log 'access denied, status code is ' + resp.statusCode
      )
)

# Register error callback
dev.on('error', () ->
  console.log 'Error!'
  process.exit(1)
)

# Used to store the current card string in memory
card = ""

card_builder = (data) ->
  if map.chr_map[String(data[2])] is "KEYPAD_ENTER"
    temp = card
    card = ""
    return temp
  else
    if data[0] is 0
      card += map.chr_map[String(data[2])]
    else if data[0] is 2
      card += map.chr_shift[String(data[2])]
    return "continue"

# Function courtesy of michieljoris on Stack Overflow
# http://bit.ly/1wlHobr
a2hex = (str) ->
  arr = []
  i = 0
  l = str.length

  while i < l
    hex = Number(str.charCodeAt(i)).toString(16)
    arr.push hex
    i++
  arr.join ""
  return arr

hash_string = (string) ->
  hash = crypto.createHash('sha512').update(new Buffer(string)).digest('hex')
  return hash
  
