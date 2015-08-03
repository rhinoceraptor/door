/*
 * migrations/swipes.js
 * --------------------
 * This is the schema/migration for the door swipes table.
 * The given card hash, swipe timestamp, access granted, and username (if
 * applicable) are stored for every card swipe.
 */


exports.up = function(knex, Promise) {
  return knex.schema.createTable('swipes', function(table) {
    table.increments('id').nullable(false).primary(true);
    table.string('username').nullable(false);
    table.string('card_hash').nullable(false);
    table.timestamp('swipe_date').nullable(false);
    table.boolean('granted').nullable(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('swipes');
};
