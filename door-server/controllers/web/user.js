'use strict'

// GET /web/user/register
exports.getRegister = function getRegister (req, res) {

}

// POST /web/user/register
exports.postRegister = function postRegister (req, res) {

}

// GET /web/user/deregister
exports.getDeregister = function getDeregister (req, res) {

}

// POST /web/user/deregister
exports.postDeregister = function postDeregister (req, res) {

}

// GET /web/user/log-in
// GET /web/user/log-in/failure
exports.getLogIn = function getLogIn (req, res) {
  return res.render('log-in');
}

// POST /web/user/log-in
exports.postLogIn = function postLogIn (req, res) {
}

exports.getLogOut = function getLogOut (req, res) {
  req.session.destroy((err) => {
    req.logout()
    return res.redirect('/')
  })
}


