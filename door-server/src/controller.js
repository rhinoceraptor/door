
/*
 * controller
 * ----------
 */

/* External dependancies */
const request = require('request'),
  moment = require('moment'),
  fs = require('fs');

/* Local dependancies */
const models = require('../models'),
  config = require('../config');

/* GET interface for the door state */
exports.door_get = function(req, res, db) {
  models.Door
    .query()
    .orderBy('id', 'desc')
    .limitOne()
    .fetch()
    .then((door) => {
      const timestamp = moment.unix(door.timestamp).toDate();
      if (door.state === config.door_open) {
        res.send(`The door was open as of ${timestamp}.\n`);

      }
      else if (door.state === config.door_closed) {
        res.send(`The door was closed as of ${timestamp}.\n`);
      }
      else {
        res.send('ya blew it!\n');
      }
    });
}
/*
 * Access the raspberry pi's open door API to open the door from web interface
 */
exports.open_door = function(req, res) {
  const url = `https://${config.rpi_url}:${config.rpi_port}${config.rpi_open}`;

  const opts = {
    url: url,
    method: 'GET',
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert),
    rejectUnauthorized: false
  };

  request.get(opts, (err, resp, body) => {
    res.send('great job!\n');
    res.end();
  });

  // Log the opening event in the swipe database
  const swipe = new models.Swipe({
    hash: 'N/A',
    granted: true,
    user: valid.escape(req.user.user).toString()
  }).then(() => swipe.save());
}

/*
 * Render the swipe logs page using either the default 7 days, or with the
 * requested number of days (coming from a POST to /swipe-logs)
 */
exports.render_logs = function(req, res) {
  /* Ensure that the requested number of days is an integer, and take the
   * absolute value of it just to be safe. */
  let days = 7
  if (req.body.days && valid.isInt(req.body.days)) {
    days = Math.abs(valid.escape(req.body.days));
  }
  /* Data will be an array filled from db that is placed in a table by jade */
  get_swipe_logs(days, (data) => {
    return res.render('swipe-logs', { title: 'Swipe Logs', data: data });
  });
}

const get_swipe_logs = function(days, callback) {
  let data = []

  models.Swipe
    .query()
    .orderBy('swipe_date', 'desc')
    .then((swipes) => {
      console.log(swipes);
      // TODO: Put swipe data into array and callback
      callback(data);
    });
}

/* Render the reg-user jade view */
exports.reg_user = function(req, res) {
  return res.render('reg-user', { title: 'Register a User' });
}

/* REST endpoint function for registering a card */
exports.reg_user_post = function(req, res) {
  /* Check if the user sent us valid data to store for registration */
  if (!req.body.username || !req.body.card_desc || !req.body.registrar) {
    res.status(403)
    return res.render('error', {
      title: 'Error',
      msg: 'Error: enter valid data!'
    });
  }
  else {
    const user = valid.escape(req.body.username),
      desc = valid.escape(req.body.card_desc)
      registrar = valid.escape(req.user.user)

    rest.set_reg(user, desc, registrar)
    res.status(200)
    return res.redirect('/swipe-logs')
  }
}

/* Render the dereg-user.jade view */
exports.dereg_user = function(req, res) {
  return res.render('dereg-user', { title: 'Deregister a User' });
}

/* REST endpoint function for deregistering a card */
exports.dereg_user_post = function (req, res) {
  if (!req.body.user || req.body.user == '') {
    return res.render('error', {
      title: 'Error',
      msg: 'Error: No username supplied'
    });
  }
  else {
    const user = valid.escape(req.body.user)

    /* Find the user in the database and destroy the model */
    models.User
      .query('where', 'user', '=', user)
      .fetch()
      .then((user) => {
        user.destroy().then(() => {
          return res.redirect('/swipe-logs');
        });
      });
  }
}
/* Render card-reg-logs.jade for card registration logs */
exports.card_reg_logs = function(req, res) {
  /* Data will be an array filled from db that is placed in a table by jade */
  get_reg_logs(db, (data) => {
    return res.render('card-reg-logs', {
      title: 'Card Registration Logs',
      data: data
    });
  });
}

/* Get card registration logs from the database */
const get_reg_logs = function(callback) {
  let data = []

  models.Users
    .query()
    .orderBy('reg_date', 'desc')
    .fetch()
    .then((users) => {
      console.log(users);
      // TODO: add user's info to data array and callback with it
      callback(data);
    });
}
