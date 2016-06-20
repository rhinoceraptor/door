'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('door', function (t) {
    t.increments('id')
    t.integer('state')
    t.timestamp('timestamp')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('door')
}

