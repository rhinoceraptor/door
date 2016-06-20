'use strict'

// Middleware for checking if the given SSL certificate was signed by the
// same CA as our certificate. This prevents others from accessing the API.
exports.ssl = function sslMiddleware (req, res, next) {
  return req.client.authorized ? next() : res.status(401).send('ya blew it')
}

