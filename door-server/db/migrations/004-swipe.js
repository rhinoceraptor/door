'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('swipe', function (t) {
    t.increments('id')
    t.integer('user_id')
    t.boolean('access_granted')
    t.text('card_hash')
    t.timestamp('timestamp')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('swipe')
}

