'use strict'

const { camelizeObject } = require('../src/util')

exports.knex = require('knex')(require('../knexfile'))
exports.migrate = cb => exports.knex.migrate.latest().then(cb)
exports.rollback = cb => exports.knex.migrate.rollback().then(cb)
exports.query = (query, cb) => query.asCallback((err, rows) => err ? cb(err) : cb(null, rows.map(camelizeObject)))
exports.queryRow = (query, cb) => query.asCallback((err, rows) => err ? cb(err) : cb(null, camelizeObject(rows[0])))
