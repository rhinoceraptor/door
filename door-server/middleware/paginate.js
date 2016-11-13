'use strict'

let { itemsPerPage } = require('../config'),
  { calculatePagination } = require('../lib/util')

module.exports = (req, res, next) => {
  res.renderPaginated = (view, rows, itemsPerPage) => {
    res.render(view, calculatePagination(rows, itemsPerPage, page))
  }

  let page = parseInt(req.params.page || 1, 10)
  req.page = isNaN(page) ? 1 : page

  next()
}

