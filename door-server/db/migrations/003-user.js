'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('user', function (t) {
    t.increments('id')
    t.integer('user_id').references('id').inTable('admin')
    t.text('username')
    t.text('real_name')
    t.text('card_hash')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('user')
}

