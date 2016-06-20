'use strict'

// Middleware for ensuring that the given session is a logged in user
module.exports = function sessionMiddleware (req, res, next) {
  return req.isAuthenticated() ? next() : res.redirect('/web/user/log-in')
}

