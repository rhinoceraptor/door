'use strict'

exports.knex = require('knex')(require('../knexfile'))
exports.migrate = cb => exports.knex.migrate.latest().then(cb)
exports.rollback = cb => exports.knex.migrate.rollback().then(cb)

