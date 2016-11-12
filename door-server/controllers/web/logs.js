'use strict'

let swipeModel = require('../../models/swipe')

// GET /web/logs/swipe
exports.getSwipe = (req, res) => {
  swipeModel.getSwipes(7, (err, swipes) => {
    console.log(err, swipes)
    return err ? res.sendWebError() : res.render('swipes', { swipes })
  });
}

// POST /web/logs/swipe
exports.postSwipe = (req, res) => {
}

// GET /web/logs/card-registration
exports.getCardRegistration = (req, res) => {
}

