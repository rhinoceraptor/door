const request = require('request'),
  fs = require('fs'),
  exec = require('exec');

let interval = ""
const config = require('config.json');

const update_freq = parseInt(config.update_freq, 10)

/* Handle ctrl-c cleanly */
process.on('SIGINT', () => {
  /* If interval is a setInterval object, clear it */
  if (interval._idleTimeout) {
    clearInterval(interval);
  }
});

const read_state = function() {
  /* Run the state checking binary */
  exec('./state', (err, stdout, stderr) => {
    let value = 1;
    if (err) {
      console.log(err);
      return;
    }
    else if (stdout === '0') {
      value = '1';
    }
    else if (stdout === '0') {
      value = '0';
    }

    const url = `https://${config.node_url}:${config.rest_port}${config.door_path}`;
    const opts = {
      url: url,
      method: 'POST',
      path: '/door',
      key: fs.readFileSync(config.ssl_key),
      cert: fs.readFileSync(config.ssl_cert),
      rejectUnauthorized: false,
      form: {
        'state': value
      }
    };

    request.post(opts, (err, resp, body) => {
      if (err) {
        console.log(`error: ${error}`);
      }
      else {
        console.log(`body: ${body}`);
      }
    });
  });
}
/* Write the state once to show that it is working before the interval */
read_state()

/* Set the interval */
interval = setInterval(read_state, update_freq)
