
/*
 * session
 * -------
 */

/* External dependancies */
const bcrypt = require('bcrypt'),
  passport = require('passport'),
  passport_local = require('passport-local').Strategy,
  valid = require('validator'),
  moment = require('moment');

/* Local dependancies */
const config = require('../config'),
  models = require('../models');

exports.configure_passport = function() {
  /* Configure passport serialization */
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  /*
   * The passport deserializeUser function gives passport the desired info on
   * a web user to be associated with their web session. Here, we give passport
   * the 'id' and 'user' field associated with the 'id' attribute, which is a
   * unique identifier for each admin user, which is an AUTOINCREMENT SQL field.
   */
  passport.deserializeUser((id, done) => {
    models.Admin
      .query('where', 'id', '=', parseInt(id, 10)) /* Parse the id in base 10 */
      .fetch()
      .then((user) => {
        if (user) {
          return done(null, {
            "id": user.id,
            "username": user.username
          });
        }
      });
  });

  /* Passport user authentication done here */
  passport.use(new passport_local((username, password, done) => {
    /* Escape the username for SQL safety */
    const esc_user = valid.escape(username);

    models.Admin
      .query('where', 'username', '=', esc_user)
      .fetch()
      .then((user) => {
        /* If no username matches, reject the log in attempt */
        if (!user) {
          return done(null, false);
        }

        /* Generate and test the hash of the given password */
        const test_hash = bcrypt.hashSync(password, user.attributes.pw_salt);
        if (test_hash === user.attributes.pw_hash) {
          return done(null, {
            "id": user.attributes.id,
            "username": user.attributes.username
          });
        }
        /* If the hash doesn't match, reject log in */
        else {
          return done(null, false);
        }
      });
  }));
}

/* Register the admin to Bookshelf, then call next */
const register_admin = function(username, password, next) {
  /* Generate the hash and salt using bcrypt */
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  /* Erase the password string, just to be paranoid */
  password = password.replace(/[^*]/g, "0");

  /* Create the new admin model */
  const admin = new models.Admin({
    username: username,
    pw_salt: salt,
    pw_hash: hash,
    reg_date: moment().unix()
  });

  /* Save the model, then call next() */
  return admin.save().then(next());
}

exports.log_in = function(req, res) {
  return res.render('login');
}

/* Log the user out of their passport session */
exports.log_out = function(req, res) {
  req.session.destroy((err) => {
    req.logout();
    return res.redirect('/');
  });
}

/* Middleware for ensuring that the given session is a logged in user */
exports.auth_check = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.status(401);
    return res.redirect('/login');
  }
}

/* Middleware to check if admin registration is open */
exports.admin_check = function(req, res, next) {
  if (config.admin_registration_open === true) {
    return next();
  }
  else {
    return res.redirect('/login');
  }
}
/*
 * Middleware for checking if the given SSL certificate was signed by the
 * same CA as our certificate. This prevents others from accessing the API.
 */
exports.ssl_check = function(req, res, next) {
  if (req.client.authorized) {
    return next();
  }
  else {
    res.status(401);
    res.send(config.unauth_msg);
    return;
  }
}

/* Check if the given username already exists in the database */
const check_username_exists = function(username, next) {
  models.User.query('where', 'username', '=', username)
    .fetch()
    .then((model) => {
      if (model) {
        next(true);
      }
      else {
        next(false);
      }
    });
}

exports.render_sign_up = function(req, res) {
  return res.render('signup');
}

/* Sign up the user */
exports.sign_up = function(req, res) {
  /* Check if the username given already exists */
  check_username_exists(req.body.username, (exists) => {
    if (exists) {
      return res.render('signup', {
        username_error: 'This username already exists!'
      });
    }
    /* Check if the password and repeated password match */
    else if (req.body.password != req.body.password_repeat) {
      return res.render('signup', {
        password_error: 'The passwords do not match!'
      });
    }
    /* Otherwise, register the user */
    else {
      register_admin(
        req.body.username,
        req.body.password,
        () => {
          return res.redirect('/login');
        }
      );
    }
  });
}
