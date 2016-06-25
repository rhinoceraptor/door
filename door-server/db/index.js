'use strict'

const { camelizeObject, snakeifyObject } = require('../lib/util')

exports.knex = require('knex')(require('../knexfile'))
exports.migrate = cb => exports.knex.migrate.latest().then(cb)
exports.rollback = cb => exports.knex.migrate.rollback().then(cb)
exports.query = (query, cb) => query.asCallback((err, rows) => err ? cb(err) : cb(null, rows.map(camelizeObject)))
exports.queryRow = (query, cb) => query.asCallback((err, rows) => err ? cb(err) : cb(null, camelizeObject(rows[0])))
exports.insertRow = (tableName, object, cb) => {
  exports.knex(tableName)
    .returning('id')
    .insert(snakeifyObject(object))
    .asCallback(cb)
}
