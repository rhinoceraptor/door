fs = require 'fs'
crypto = require 'crypto'
hid = require 'node-hid'
request = require 'request'

# Get configuration from json files
config = JSON.parse(fs.readFileSync('config.json'))
map = JSON.parse(fs.readFileSync(config.char_map_file))

# Set up the magstripe device, exit if none or more than one are plugged in
magstripe = hid.devices(config.vendor_id, config.product_id)
console.log magstripe
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
      hash_string(card_string)
      card = ""
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
    console.log "we're done: " + card
    temp = card
    card = ""
    return temp
  else
    if data[0] is 0
      card += map.chr_map[String(data[2])]
    else if data[0] is 2
      card += map.chr_shift[String(data[2])]
    return "continue"

hash_string = (string) ->
  hash = crypto.createHash('sha512').update(string).digest('hex')
  console.log "hashing >" + string + "<: " + hash
