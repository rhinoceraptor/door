'use strict'

const { knex, queryRow, insertRow } = require('../db')

const { pick } = require('ramda'),
  bcrypt = require('bcrypt'),
  moment = require('moment'),
  config = require('../config')

exports.tableName = 'user'
exports.queryBase = () => knex(exports.tableName).select('*')

exports.fields = [
  'adminId',
  'username',
  'realName',
  'cardHash',
  'cardDescription'
]

exports.createUser = (user, cb) => {
  insertRow(exports.tableName, Object.assign(pick(exports.fields, user), {
    registrationDate: moment().utc().toISOString()
  }), cb)
}

