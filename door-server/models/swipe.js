'use strict'

const { knex, queryRow, insertRow } = require('../db')

const { camelizeObject, snakeifyObject } = require('../lib/util'),
  { pick } = require('ramda'),
  bcrypt = require('bcrypt'),
  moment = require('moment'),
  config = require('../config')

exports.tableName = 'swipe'
exports.queryBase = () => knex(exports.tableName).select('*')

exports.fields = [
  'userId',
  'accessGranted',
  'cardHash',
  'timestamp'
]

exports.createSwipe = (swipe, cb) => {
  insertRow(exports.tableName, Object.assign(pick(exports.fields, swipe), {
    timestamp: moment().utc().toISOString()
  }), cb)
}

exports.checkCardHash = (cardHash, cb) => {
  queryRow(exports.queryBase().where({ cardHash }), cb)
}

