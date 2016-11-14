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
  const newUser = Object.assign(user, {
    registrationDate: moment().utc().toISOString()
  })
  insertRow(exports.tableName, exports.fields, newUser, cb)
}

exports.checkCardHash = (cardHash, cb) => {
  queryRow(exports.queryBase(), { cardHash }, (err, user) => {
    cb(err, !!user.cardHash)
  })
}

exports.getUsers = (pageNumber, limit, cb) => {
  queryRaw(knex.raw(`select *, t.total_rows from user,
    (select count(*) total_rows from user) t
    order by timestamp desc limit ? offset ?`,
    [limit, (limit * (pageNumber - 1))]), cb)
}

