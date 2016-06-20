'use strict'

const { knex, queryRow } = require('../db')

const { camelizeObject, snakeifyObject } = require('../src/util'),
  { pick } = require('ramda'),
  bcrypt = require('bcrypt'),
  config = require('../config')

exports.tableName = 'admin'
exports.queryBase = function () {
  return knex(exports.tableName).select('*')
}

exports.fields = [
  'username',
  'realName',
  'hash'
]

exports.createAdmin = function createAdmin (admin, cb) {
  knex(exports.tableName)
    .returning('id')
    .insert(snakeifyObject(pick(exports.fields, admin)))
    .asCallback(cb)
}

exports.getById = function getById (id, cb) {
  queryRow(exports.queryBase().where({ id }), cb)
}

exports.checkPassword = function checkPassword (id, password, cb) {
  exports.getById(id, (err, { hash }) => {
    return (err || !hash) ? cb(err || 'Admin not found') : bcrypt.compare(password, hash, cb)
  })
}

// bcrypt outputs a combined hash/salt string
exports.hashPassword = (password, cb) => bcrypt.hash(password, config.bcryptSaltRounds, cb)

