'use strict'

const { invertObj, mapObjIndexed } = require('ramda')

exports.snakeify = str => str.replace(/([A-Z])/g, $1 => `_${$1.toLowerCase()}`)
exports.camelize = str => str.replace(/(\_[a-z])/g, substr => substr.toUpperCase().replace('_',''))

exports.camelizeObject = obj => invertObj(mapObjIndexed(exports.camelize, invertObj(obj)))
exports.snakeifyObject = obj => invertObj(mapObjIndexed(exports.snakeify, invertObj(obj)))

