'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('user', function (t) {
    t.increments('id')
    t.integer('admin_id').references('id').inTable('admin')
    t.text('username')
    t.text('real_name')
    t.text('card_hash')
    t.text('card_description')
    t.timestamp('registration_date')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('user')
}

