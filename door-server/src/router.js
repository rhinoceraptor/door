
/*
 * router
 * ------
 * Sets up the routes on the express app, for the controller app and for the REST API
 */

import {session} from './session';
import {controller} from './controller';

class router {
  constructor(app) {
    /* Open the database */
    let config = require('./config.json');
    var db = new sqlite3.Database(config.sql_db);

    /*
     * Endpoints for serving controller app
     * session.auth_check is a middleware function
     * that ensures the user is logged in
     */
    app.get('/', function(req, res) {
      controller.login(req, res);
    });
    app.get('/open-door', session.auth_check, function(req, res) {
      controller.open_door(req, res);
    });
    app.get('/swipe-logs', session.auth_check, function(req, res) {
      controller.logs(req, res);
    });
    app.post('/swipe-logs', session.auth_check, function(req, res) {
      controller.logs(req, res);
    });
    app.get('/reg-user', session.auth_check, function(req, res) {
      controller.reg_user(req, res);
    });
    app.post('/reg-user', session.auth_check, function(req, res) {
      controller.reg_user_post(req, res);
    });
    app.get('/dereg-user', session.auth_check, function(req, res) {
      controller.dereg_user(req, res);
    });
    app.post('/dereg-user', session.auth_check, function(req, res) {
      controller.dereg_user_post(req, res);
    });
    app.get('/card-reg-logs', session.auth_check, function(req, res) {
      controller.card_reg_logs(req, res);
    });
    app.get('/login', function(req, res) {
      controller.login(req, res, 'Log In');
    });
    app.get('/logout', session.auth_check, function(req, res) {
      controller.logout(req, res);
    });
    app.get('/login-failure', function(req, res) {
      controller.login(req, res, 'Login Failed! Try again.');
    });
    app.post('/login', passport.authenticate('local', {
      successRedirect: '/swipe-logs',
      failureRedirect: '/login-failure'
    }));

    /*
     * Register endpoints on app for Raspberry Pi
     * POST /door and /door-auth are guarded using the ssl_check middleware function
     * to check that the client has an SSL certificate signed by our CA.
     * GET /door is still over SSL so that the controller app can load it in the pages.
     */
    app.get('/door', function(req, res) {
      controller.door_get(req, res);
    });
    app.post('/door', session.ssl_check, function(req, res) {
      controller.door_post(req, res);
    });
    app.post('/door-auth', session.ssl_check, function(req, res) {
      controller.door_auth(req, res);
    });
  }
}

export {router};

