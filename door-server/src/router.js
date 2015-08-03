
/*
 * router
 * ------
 * Sets up the routes on the express router, for the controller app and for the REST API
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

/*
 * Endpoints for serving controller router
 * session.auth_check is a middleware function
 * that ensures the user is logged in
 */
router.get('/', function(req, res) {
  controller.login(req, res);
});
router.get('/open-door', session.auth_check, function(req, res) {
  controller.open_door(req, res);
});
router.get('/swipe-logs', session.auth_check, function(req, res) {
  controller.logs(req, res);
});
router.post('/swipe-logs', session.auth_check, function(req, res) {
  controller.logs(req, res);
});
router.get('/reg-user', session.auth_check, function(req, res) {
  controller.reg_user(req, res);
});
router.post('/reg-user', session.auth_check, function(req, res) {
  controller.reg_user_post(req, res);
});
router.get('/dereg-user', session.auth_check, function(req, res) {
  controller.dereg_user(req, res);
});
router.post('/dereg-user', session.auth_check, function(req, res) {
  controller.dereg_user_post(req, res);
});
router.get('/card-reg-logs', session.auth_check, function(req, res) {
  controller.card_reg_logs(req, res);
});
router.get('/login', function(req, res) {
  controller.log_in(req, res);
});
router.get('/signup', session.admin_check, function(req, res) {
  controller.signup(req, res);
});
router.post('/signup', session.admin_check, function(req, res) {
  session.signup(req, res);
})
router.get('/logout', session.auth_check, function(req, res) {
  controller.log_out(req, res);
});
router.get('/login-failure', function(req, res) {
  controller.log_in_failure(req, res);
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/swipe-logs',
  failureRedirect: '/login-failure'
}));

/*
 * Register endpoints on router for Raspberry Pi
 * POST /door and /door-auth are guarded using the ssl_check middleware function
 * to check that the client has an SSL certificate signed by our CA.
 * GET /door is still over SSL so that the controller router can load it in the pages.
 */
router.get('/door', function(req, res) {
  controller.door_get(req, res);
});
router.post('/door', session.ssl_check, function(req, res) {
  controller.door_post(req, res);
});
router.post('/door-auth', session.ssl_check, function(req, res) {
  controller.door_auth(req, res);
});

module.exports = router;
