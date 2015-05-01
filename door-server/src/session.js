
/*
 * session
 * -------
 */

class session {
  constructor() {
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
      /* SELECT id, username FROM admins WHERE (id = 'id'); */
      var sql = squel.select()
        .field('id')
        .field('user')
        .from('admins')
        .where("id = '#{id}'").toString();
      console.log(sql);

      db.get(sql, function(err, row) {
        console.log(row);
        if (!row) {
          return done(null, false);
        }
        else {
          return done(null, row);
        }
      });
    });

    /* Passport user authentication done here */
    passport.use(new local_strat(function(user, passwd, done) {
      /* Escape the username for SQL safety */
      var user = valid.escape(user)

      /* SELECT salt FROM admins WHERE (user = 'user'); */
      var sql = squel.select()
        .field('salt')
        .from('admins')
        .where("user = '#{user}'").toString();
      console.log(sql);

      db.get(sql, function(err, row) {
        /* If now rows were returned, then the username does not exist */
        if (!row) {
          return done(null, false);
        }

        /*
         * Otherwise, check the password with the username's salt. This action is
         * done implicitly by the next SQL query.
         */
        var hash = hash_passwd(passwd, row.salt);
        /* SELECT user, id from admins WHERE user = 'user' AND hash = 'hash'; */
        sql = squel.select()
          .field('user')
          .field('id')
          .from('admins')
          .where("user = '#{user}' and hash = '#{hash}'").toString();
        console.log(sql);

        db.get(sql, function(err, row) {
          /* If no rows returned from database, then password is wrong */
          if (!row) {
            done(null, false);
          }
          else {
            return done(null, row);
          }
        });
      });
    }));

  }

  /* Middleware for ensuring that the given session is a logged in user */
  static auth_check(req, res, next) {
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
  static ssl_check(req, res, next) {
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
  static logout(req, res) {
    req.session.destroy(function(err) {
      req.logout();
      res.redirect('/');
    }
  }

}

export {session};

