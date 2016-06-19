'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('door', function (t) {
    t.increments('id')
    t.timestamp('timestamp').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('door')
}

