'use strict'

const { knex, queryRow } = require('../db')

const { camelizeObject, snakeifyObject } = require('../lib/util'),
  { pick } = require('ramda'),
  bcrypt = require('bcrypt'),
  moment = require('moment'),
  config = require('../config')

exports.tableName = 'swipe'
exports.queryBase = () => knex(exports.tableName).select('*')

exports.fields = [
  'id',
  'userId',
  'accessGranted',
  'cardHash',
  'timestamp'
]

exports.createSwipe = function createSwipe (swipe, cb) {
  knex(exports.tableName)
    .returning('id')
    .insert(snakeifyObject(Object.assign(pick(exports.fields, swipe), {
      timestamp: moment.utc.toISOString()
    })))
    .asCallback(cb)
}

exports.checkCardHash = function checkCardHash (cardHash, cb) {
  queryRow(exports.queryBase().where({ cardHash }), cb)
}

