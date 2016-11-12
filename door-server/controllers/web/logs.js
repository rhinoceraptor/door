'use strict'

let swipeModel = require('../../models/swipe')

// GET /web/logs/swipe
exports.getSwipe = (req, res) => {
  let itemsPerPage = 25
  let page = parseInt(req.params.page || 1, 10)
  if (isNaN(page)) { page = 1; }

  swipeModel.getSwipes(page, itemsPerPage, (err, swipes) => {
    let data = { swipes }
    let numPages = swipes && swipes[0] ? (swipes[0].count / itemsPerPage) : 0
    if (page > 1) data.prev = page - 1
    if (page < numPages) data.next = page + 1
    console.log('numPages' + numPages)
    console.log('data' + JSON.stringify(data, null, 2))
    return err ? res.sendWebError() : res.render('swipes', data)
  });
}

// POST /web/logs/swipe
exports.postSwipe = (req, res) => {
}

// GET /web/logs/card-registration
exports.getCardRegistration = (req, res) => {
}

