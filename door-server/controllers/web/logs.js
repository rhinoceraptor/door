'use strict'

let { calculatePagination } = require('../../lib/util'),
  swipeModel = require('../../models/swipe')

// GET /web/logs/swipe
exports.getSwipe = (req, res) => {
  let itemsPerPage = 25
  let page = parseInt(req.params.page || 1, 10)
  if (isNaN(page)) page = 1

  swipeModel.getSwipes(page, itemsPerPage, (err, swipes) => {
    return err ? res.sendWebError() : res.render('swipes', calculatePagination(swipes, itemsPerPage, page))
  })
}

// POST /web/logs/swipe
exports.postSwipe = (req, res) => {
}

// GET /web/logs/card-registration
exports.getCardRegistration = (req, res) => {
}

