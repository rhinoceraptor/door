const fs = require('fs'),
  exec = require('exec'),
  https = require('https'),
  express = require('express');

const config = require('config.json');

const ssl_opts = {
  key: fs.readFileSync(config.ssl_key),
  cert: fs.readFileSync(config.ssl_cert),
  ca: fs.readFileSync(config.ssl_ca),
  requestCert: true,
  rejectUnauthorized: false
};

/* Set up simple Express.js app */
const app = express();
console.log('ready');

/* SSL middleware to check if requesting party is authorized */
const ssl_auth = function(req, res, next) {
  if (req.client.authorized) {
    console.log('client authorized');
    return next();
  }
  else {
    res.status(401);
    res.send('ya blew it\n');
    console.log('client not authorized');
    return;
  }
}

/* Endpoint for the Node server to open the door from the web app */
app.get('/open-door', ssl_auth, (req, res) => {
  console.log('open the door!');
  res.status(200);
  res.send('great job!\n');

  /* Run the door opener binary */
  exec('./open', (err, stdout, stderr) => {
    if (err) {
      console.log(err);
    }
  });
});

/* Set up app with HTTPS to listen on port config.port */
https.createServer(ssl_opts, app).listen(config.self_port, () => {
  console.log(`listening on port ${config.self_port}`);
});
