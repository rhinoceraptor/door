'use strict'

const { knex, query, queryRow, insertRow } = require('../db')

const { camelizeObject, snakeifyObject, getTimestamp } = require('../lib/util'),
  userModel = require('./user'),
  { pick } = require('ramda'),
  moment = require('moment'),
  bcrypt = require('bcrypt'),
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
  insertRow(exports.tableName, exports.fields, Object.assign(swipe, {
    timestamp: getTimestamp()
  }), cb)
}

exports.getSwipesByUser = (userId, cb) => query(exports.queryBase(), { userId }, cb)

exports.getSwipes = (numberOfDays, cb) => {
  let newerThan = moment().utc().subtract(numberOfDays, 'days').toISOString()
  query(exports.queryBase().where('timestamp', '>', newerThan), {}, cb)
}

