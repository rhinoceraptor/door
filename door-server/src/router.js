
/*
 * router
 * ------
 * Sets up the routes on the express app, for the web app and for the REST API
 */

import {model} from './model';
import {session} from './session';

class router {
  constructor(app) {
    /* Open the database */
    let config = require('./config.json');
    var db = new sqlite3.Database(config.sql_db);

    /*
     * Endpoints for serving web app
     * session.auth_check is a middleware function
     * that ensures the user is logged in
     */
    app.get('/', function(req, res) {
      web.login(req, res);
    });
    app.get('/open-door', session.auth_check, function(req, res) {
      web.open_door(req, res);
    });
    app.get('/swipe-logs', session.auth_check, function(req, res) {
      web.logs(req, res);
    });
    app.post('/swipe-logs', session.auth_check, function(req, res) {
      web.logs(req, res);
    });
    app.get('/reg-user', session.auth_check, function(req, res) {
      web.reg_user(req, res);
    });
    app.post('/reg-user', session.auth_check, function(req, res) {
      web.reg_user_post(req, res);
    });
    app.get('/dereg-user', session.auth_check, function(req, res) {
      web.dereg_user(req, res);
    });
    app.post('/dereg-user', session.auth_check, function(req, res) {
      web.dereg_user_post(req, res);
    });
    app.get('/card-reg-logs', session.auth_check, function(req, res) {
      web.card_reg_logs(req, res);
    });
    app.get('/login', function(req, res) {
      web.login(req, res, 'Log In');
    });
    app.get('/logout', session.auth_check, function(req, res) {
      web.logout(req, res);
    });
    app.get('/login-failure', function(req, res) {
      web.login(req, res, 'Login Failed! Try again.');
    });
    app.post('/login', passport.authenticate('local', {
      successRedirect: '/swipe-logs',
      failureRedirect: '/login-failure'
    }));

    /*
     * Register endpoints on app for Raspberry Pi
     * POST /door and /door-auth are guarded using the ssl_check middleware function
     * to check that the client has an SSL certificate signed by our CA.
     * GET /door is still over SSL so that the web app can load it in the pages.
     */
    app.get('/door', function(req, res) {
      rest.door_get(req, res);
    });
    app.post('/door', session.ssl_check, function(req, res) {
      rest.door_post(req, res);
    });
    app.post('/door-auth', session.ssl_check, function(req, res) {
      rest.door_auth(req, res);
    });
  }
}

export {router};

