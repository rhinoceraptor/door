'use strict'

module.exports = (req, res, next) => {
  res.sendWebError = () => res.status(500).render('error')
  res.sendApiError = () => res.status(500).json({ status: 'An error occurred' })
  return next()
}

