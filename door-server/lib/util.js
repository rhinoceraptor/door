'use strict'

const { clone, invertObj, mapObjIndexed, curry, fromPairs, map, adjust, toPairs } = require('ramda'),
  moment = require('moment')

exports.snakeify = str => str.replace(/([A-Z])/g, substr => `_${substr.toLowerCase()}`)
exports.camelize = str => str.replace(/(\_[a-z])/g, substr => substr.toUpperCase().replace('_', ''))

exports.mapKeys = curry((fn, obj) => fromPairs(map(adjust(fn, 0), toPairs(obj))))
exports.camelizeObject = obj => exports.mapKeys(exports.camelize, obj)
exports.snakeifyObject = obj => exports.mapKeys(exports.snakeify, obj)

exports.getTimestamp = () => moment().utc().toISOString()

exports.calculatePagination = (data, itemsPerPage, currentPage) => {
  let paginated = { rows: clone(data) }
  paginated.numPages = data && data[0] ? (Math.ceil(data[0].totalRows / itemsPerPage)) : 0
  if (currentPage > 1) paginated.prevPage = currentPage - 1
  if (currentPage < paginated.numPages) paginated.nextPage = currentPage + 1

  return paginated
}

