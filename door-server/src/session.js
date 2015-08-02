
/*
 * session
 * -------
 */

const bcrypt = require('bcrypt'),
  passport = require('passport'),
  passport_local = require('passport-local').Strategy,

const models = require('../models');

exports.configure_passport = function() {
  /* Configure passport serialization */
  passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });

  /*
   * The passport deserializeUser function gives passport the desired info on
   * a web user to be associated with their web session. Here, we give passport
   * the 'id' and 'user' field associated with the 'id' attribute, which is a
   * unique identifier for each admin user, which is an AUTOINCREMENT SQL field.
   */
  passport.deserializeUser(function(id, done) {
    models.Admin
      .query('where', 'id', '=', parseInt(id, 10))
      .fetch()
      .then(function(user) {
        if (user) {
          return done(null, { "id": user.id, "username": user.username });
        }
      });
  });

  /* Passport user authentication done here */
  passport.use(new local_strat(function(username, password, done) {
    /* Escape the username for SQL safety */
    const esc_user = valid.escape(username);

    models.Admin
      .query('where', 'username', '=', esc_user)
      .fetch()
      .then(function(user_model) {
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

/* Register the user to Bookshelf, then call next */
exports.register_user = function(username, password, next) {
  /* Generate the hash and salt using bcrypt */
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  /* Erase the password string, just to be paranoid */
  password = password.replace(/[^*]/g, "0");

  /* Create the new admin model */
  const admin = new models.Admin({
    username: username,
    pw_salt: salt,
    pw_hash: hash
  });

  /* Save the model, then call next() */
  user.save().then(next());
}

/* Middleware for ensuring that the given session is a logged in user */
exports.auth_check = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login');
  }
}

/*
 * Middleware for checking if the given SSL certificate was signed by the
 * same CA as our certificate. This prevents others from accessing the API.
 */
exports.ssl_check = function(req, res, next) {
  if (req.client.authorized) {
    next();
  }
  else {
    res.status(401);
    res.send('ya blew it');
    return;
  }
}

/* Destroy and log out of the Passport session */
exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    req.logout();
    res.redirect('/');
  });
}
