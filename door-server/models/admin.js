'use strict'

const { knex, queryRow, insertRow } = require('../db'),
  { camelizeObject, snakeifyObject } = require('../lib/util'),
  bcrypt = require('bcrypt'),
  moment = require('moment'),
  config = require('../config')

exports.tableName = 'admin'
exports.queryBase = () => knex(exports.tableName).select('*')

exports.fields = [
  'username',
  'realName',
  'hash'
]

exports.createAdmin = (admin, cb) => {
  const newAdmin = Object.assign(admin, {
    registrationDate: moment().utc().toISOString()
  })
  insertRow(exports.tableName, exports.fields, newAdmin, cb)
}

exports.getById = (id, cb) => queryRow(exports.queryBase(), { id }, cb)

exports.serializePassport = ({ id }, cb) => cb(null, id)

exports.deserializePassport = (id, cb) => {
  exports.getById(id, (err, { id, username }) => {
    return (err || !id || !username) ? cb(err || 'Admin not found') : cb(null, { id, username })
  })
}

exports.authenticatePassport = (username, password, cb) => {
  if (!username || !password) { return cb(null, false) }

  queryRow(exports.queryBase(), { username }, (err, user) => {
    if (err || !user.hash) { return cb(err, false) }

    bcrypt.compare(password, user.hash, (err, correct) => {
      return cb(err, correct ? user : false)
    })
  })
}

exports.checkPassword = (id, password, cb) => {
  exports.getById(id, (err, { hash }) => {
    return (err || !hash) ? cb(err || 'Admin not found') : bcrypt.compare(password, hash, cb)
  })
}

// bcrypt outputs a combined hash/salt string
exports.hashPassword = (password, cb) => bcrypt.hash(password, config.bcryptSaltRounds, cb)

