'use strict'

const { knex, queryRow } = require('../db')

const { camelizeObject, snakeifyObject } = require('../lib/util'),
  { pick } = require('ramda'),
  bcrypt = require('bcrypt'),
  config = require('../config')

exports.tableName = 'admin'
exports.queryBase = () => knex(exports.tableName).select('*')

exports.fields = [
  'username',
  'realName',
  'hash'
]

exports.createAdmin = (admin, cb) => {
  knex(exports.tableName)
    .returning('id')
    .insert(snakeifyObject(pick(exports.fields, admin)))
    .asCallback(cb)
}

exports.getById = (id, cb) => queryRow(exports.queryBase().where({ id }), cb)

exports.serializePassport = ({ id }, cb) => cb(null, id)

exports.deserializePassport = (id, cb) => {
  exports.getById(id, (err, { id, username }) => {
    return (err || !username) ? cb(err || 'Admin not found') : cb(null, { id, username })
  })
}

exports.authenticatePassport = (username, password, cb) => {
  queryRow(exports.queryBase().where({ username }), (err, { hash }) => {
    return err ? cb(err) : bcrypt.compare(password, hash, cb)
  })
}

exports.checkPassword = (id, password, cb) => {
  exports.getById(id, (err, { hash }) => {
    return (err || !hash) ? cb(err || 'Admin not found') : bcrypt.compare(password, hash, cb)
  })
}

// bcrypt outputs a combined hash/salt string
exports.hashPassword = (password, cb) => bcrypt.hash(password, config.bcryptSaltRounds, cb)

