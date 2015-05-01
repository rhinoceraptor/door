
/*
 * session
 * -------
 */

class session {

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

