'use strict'

let swipeModel = require('../../models/swipe')

// GET /web/logs/swipe
exports.getSwipe = (req, res) => {
  swipeModel.getSwipes(req.page, req.itemsPerPage, (err, swipes) => {
    return err ? res.sendWebError() : res.renderPaginated('swipes', swipes)
  })
}

// POST /web/logs/swipe
exports.postSwipe = (req, res) => {
}

// GET /web/logs/card-registration
exports.getCardRegistration = (req, res) => {
}

