'use strict'

let swipeModel = require('../../models/swipe')

// GET /web/logs/swipe
exports.getSwipe = (req, res) => {
  swipeModel.getSwipes(req.page, req.itemsPerPage, (err, swipes) => {
    return err ? res.sendWebError() : res.renderPaginated('swipes', swipes)
  })
}

// GET /web/logs/card-registration
exports.getCardRegistration = (req, res) => {
  userModel.getUsers(req.page, req.itemsPerPage, (err, users) => {
    return err ? res.sendWebError() : res.renderPaginated('card-registrations', swipes)
  })
}

