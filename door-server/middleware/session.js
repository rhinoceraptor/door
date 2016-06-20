'use strict'

// Middleware for ensuring that the given session is a logged in user
exports.auth_check = function(req, res, next) {
  return req.isAuthenticated() ? next() : res.redirect('/web/user/log-in')
}

