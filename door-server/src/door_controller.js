
/*
 * door_controller
 * ----------
 */

/* External dependancies */
const request = require('request'),
  moment = require('moment'),
  fs = require('fs');

/* Local dependancies */
const models = require('../models'),
  config = require('../config');


/*
 * POST interface for the raspberry pi to send the door state
 * You can post to it like this: 'curl --data "state=0" <ip>:<port>/door'
 */
exports.door_post = function(req, res) {
  const state = valid.escape(req.body.state);

  /* We allow '1' or '0' only, this prevents SQL injection and bad data */
  if (state !== '1' && state !== '0') {
    res.status(403);
    res.send(config.unauth_msg);
    return;
  }

  const state = new models.Door({
    state: state,
    timestamp: moment().unix()
  }).then(() => {
    state.save();
    res.status(201);
    res.send(config.auth_msg);
  });
}

/* POST interface for checking card hashes */
exports.door_auth = function (req, res) {
  const hash = valid.escape(req.body.hash);
  if (valid.isHexadecimal(hash) === false || hash === ''|| !hash) {
    log_invalid_card(hash || 'N/A');
    /* Send forbidden 403 HTTP header */
    res.status(403)
    res.send(config.unauth_msg)
  }
  /*
   * If get_reg() is false, then this is a normal auth.
   * Get the row from the database that corresponds to the given hash.
   */
  else if (get_reg() === false) {
  }
  /* If get_reg() is true, than we are registering a card to the sqlite db */
  else {
    register_card(hash);
  }

/* Logs a valid card swipe */
log_valid_card = function(user, hash) {
  const swipe = new models.Swipe({
    username: user,
    card_hash: hash,
    swipe_date: moment().unix(),
    granted: true
  }).then(() => swipe.save());
}

/* Logs an invalid card swipe */
log_invalid_card = function(req, res, db, hash) {
  /* Log the blank hash event by the ip address */
  const ip = valid.escape(
    req.headers['x-forwarded-for'] || req.connection.remoteAddress
  );

  const swipe = new models.Swipe({
    username: ip,
    card_hash: hash,
    swipe_date: moment().unix(),
    granted: false
  }).then(() => swipe.save());
}
