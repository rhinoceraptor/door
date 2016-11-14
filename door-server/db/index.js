'use strict'

const { pick } = require('ramda')
const { camelizeObject, snakeifyObject } = require('../lib/util')

exports.knex = require('knex')(require('../knexfile'))
exports.migrate = cb => exports.knex.migrate.latest().then(cb)
exports.rollback = cb => exports.knex.migrate.rollback().then(cb)

exports.query = (queryBase, parameters, cb) => {
  queryBase.where(snakeifyObject(parameters)).asCallback((err, rows) => {
    return cb(err, (rows || []).map(camelizeObject))
  })
}

exports.queryRow = (queryBase, parameters, cb) => {
  queryBase.where(snakeifyObject(parameters)).asCallback((err, rows) => {
    return cb(err, camelizeObject((rows || [{}])[0]))
  })
}

exports.queryRaw = (sql, cb) => {
  sql.asCallback((err, rows) => cb(err, (rows || []).map(camelizeObject)))
}

exports.insertRow = (tableName, columns, object, cb) => {
  exports.knex(tableName)
    .returning('id')
    .insert(snakeifyObject(pick(columns, object)))
    .asCallback((err, ids) => cb(err, ids[0]))
}

exports.insertRows = (tableName, columns, rows, cb) => {
  exports.knex(tableName)
    .returning('id')
    .insert(rows.map(row => snakeifyObject(pick(columns, row))))
    .asCallback(cb)
}

