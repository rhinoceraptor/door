'use strict'

exports.up = function (knex) {
  return knex.schema.createTable('door', function (t) {
    t.increments('id')
    t.integer('state')
    t.timestamp('timestamp')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('door')
}

