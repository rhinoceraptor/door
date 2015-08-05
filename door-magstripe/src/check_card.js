const fs = require('fs'),
  exec = require('exec'),
  crypto = require('crypto'),
  hid = require('node-hid'),
  request = require('request');

/* Get configuration from json files */
const config = require('config.json'),
  map = require(config.char_map_file);

const node_server = config.node_server,
  node_port = config.rest_port,
  path = config.auth_path;

/* Set up the magstripe device, exit if none or more than one are plugged in */
const mag_device = hid.devices(config.vendor_id, config.product_id);

if (mag_device.length > 1) {
  console.log('More than one magstripe reader is plugged in!');
  process.exit(1);
}
else if (mag_device.length === 0) {
  console.log('No magstripe reader is plugged in!');
  process.exit(1);
}

const magstripe = mag_device[0],
  dev = new hid.HID(magstripe.path)

/* Register data event callback */
dev.on('data', (data) => {
  /* Every other data chunk will be 0, skip these */
  if (data && data[2] !== "0" && data[2] !== 0) {
    const card_string = card_builder(data);
    if (card_string !== "continue") {
      /* Hash the card string we have */
      const hash = hash_string(card_string);
      /* Reset the card string variable */
      card = ""
      /* Use the hashed card string to POST to the server */
      const url = `https://${config.node_url}:${config.rest_port}${config.auth_path}`;

      const opts = {
        url: url,
        method: 'POST',
        key: fs.readFileSync(config.ssl_key),
        cert: fs.readFileSync(config.ssl_cert),
        rejectUnauthorized: false,
        form: {
          'hash': hash
        }
      };

      request.post(opts, (err, resp, body) => {
        if (err) {
          console.log(`error: ${err}`);
        }
        else if (resp.statusCode === 200) {
          exec('./open', (err, stdout, stderr) => {
            if (err) {
              console.log(err);
            }
          });
        }
        else {
          console.log(`access denied, status code is ${resp.statusCode}`);
        }
      });
    }
  }
});

/* Register error callback */
dev.on('error', () => {
  console.log('Error!');
  process.exit(1);
});

/* Used to store the current card string in memory */
let card = ""

card_builder = (data) => {
  if (map.chr_map[String(data[2])] === "KEYPAD_ENTER") {
    const temp = card;
    card = "";
    return temp;
  }
  else {
    if (data[0] === 0) {
      card += map.chr_map[String(data[2])];
    }
    else if (data[0] === 2) {
      card += map.chr_shift[String(data[2])];
    }
    return "continue";
  }
}

/* Function courtesy of michieljoris on Stack Overflow
 * http://bit.ly/1wlHobr
 */
const a2hex = function(str) {
  let arr = [],
    i = 0,
    l = str.length;

  while (i < l) {
    const hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
    i++;
  }
  arr.join("");
  return arr;
}

hash_string = function(string) {
  const hash = crypto.createHash('sha512')
    .update(new Buffer(string)).digest('hex');
  return hash;
}
