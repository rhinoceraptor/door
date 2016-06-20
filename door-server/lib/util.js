'use strict'

const { invertObj, mapObjIndexed, curry, fromPairs, map, adjust, toPairs } = require('ramda')

exports.snakeify = str => str.replace(/([A-Z])/g, substr => `_${substr.toLowerCase()}`)
exports.camelize = str => str.replace(/(\_[a-z])/g, substr => substr.toUpperCase().replace('_', ''))

exports.mapKeys = curry((fn, obj) => fromPairs(map(adjust(fn, 0), toPairs(obj))))
exports.camelizeObject = obj => exports.mapKeys(exports.camelize, obj)
exports.snakeifyObject = obj => exports.mapKeys(exports.snakeify, obj)


