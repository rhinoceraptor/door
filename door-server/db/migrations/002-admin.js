'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('admin', function (t) {
    t.increments('id')
    t.text('username')
    t.text('real_name')
    t.text('hash')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('admin')
}

