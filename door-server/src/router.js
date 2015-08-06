
/*
 * router
 * ------
 * Sets up the routes on the express router,
 * for the controller app and for the REST API
 */

/* Import external dependancies */
const express = require('express'),
  passport = require('passport'),
  passport_local = require('passport-local');

/* Import app dependancies */
const session = require('./session'),
  controller = require('./controller');

/* Set up the express router */
const router = express.Router();

/* Serve the admin log in page at / */
router.get('/', function(req, res) {
  session.log_in(req, res);
});

/* General web app endpoints */
router.get('/open-door', session.auth_check, function(req, res) {
  controller.open_door(req, res);
}).get('/swipe-logs', session.auth_check, function(req, res) {
  controller.render_logs(req, res);
}).post('/swipe-logs', session.auth_check, function(req, res) {
  controller.render_logs(req, res);
}).get('/card-reg-logs', session.auth_check, function(req, res) {
  controller.card_reg_logs(req, res);
});

/* Card registration endpoints */
router.get('/reg-user', session.auth_check, function(req, res) {
  controller.reg_user(req, res);
}).post('/reg-user', session.auth_check, function(req, res) {
  controller.reg_user_post(req, res);
}).get('/dereg-user', session.auth_check, function(req, res) {
  controller.dereg_user(req, res);
}).post('/dereg-user', session.auth_check, function(req, res) {
  controller.dereg_user_post(req, res);
});

/* User session endpoints */
router.get('/signup', session.admin_check, function(req, res) {
  session.render_sign_up(req, res);
}).post('/signup', session.admin_check, function(req, res) {
  session.sign_up(req, res);
}).get('/logout', session.auth_check, function(req, res) {
  controller.log_out(req, res);
}).get('/login', function(req, res) {
  session.log_in(req, res);
}).post('/login', passport.authenticate('local', {
  successRedirect: '/swipe-logs',
  failureRedirect: '/login'
}));

/*
 * Register endpoints on router for Raspberry Pi
 * POST /door and /door-auth are guarded using the ssl_check middleware function
 * to check that the client has an SSL certificate signed by our CA.
 * GET /door is over SSL so that the controller router can load it in the pages.
 */
router.get('/door', function(req, res) {
  controller.door_get(req, res);
}).post('/door', session.ssl_check, function(req, res) {
  controller.door_post(req, res);
}).post('/door-auth', session.ssl_check, function(req, res) {
  controller.door_auth(req, res);
});

module.exports = router;
