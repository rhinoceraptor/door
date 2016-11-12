'use strict'

// GET /web/user/register
exports.getRegister = (req, res) => {

}

// POST /web/user/register
exports.postRegister = (req, res) => {

}

// GET /web/user/deregister
exports.getDeregister = (req, res) => {

}

// POST /web/user/deregister
exports.postDeregister = (req, res) => {

}

// GET /web/user/log-in
exports.getLogIn = (req, res) => {
  return res.render('log-in')
}

// GET /web/user/log-in/failure
exports.getLogInFailure = (req, res) => {
  return res.render('log-in', { logInFailure: true })
}

// POST /web/user/log-in
exports.postLogIn = (req, res) => {
  return res.render('home');
}

exports.getLogOut = (req, res) => {
  req.session.destroy((err) => {
    req.logout()
    return res.redirect('/')
  })
}



