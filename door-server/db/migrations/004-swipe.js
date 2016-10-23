'use strict'

exports.up = function (knex) {
  return knex.schema.createTable('swipe', function (t) {
    t.increments('id')
    t.integer('user_id')
    t.boolean('access_granted')
    t.text('card_hash')
    t.timestamp('timestamp')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('swipe')
}

