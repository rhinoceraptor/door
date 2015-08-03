
/*
 * migrations/users.js
 * --------------------
 * This is the schema/migration for the users given access to the door via
 * card swipe. A hash of their card, description of the card, their name,
 * registrar, and a timestamp are stored to authenticate them.
 */

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').nullable(false).primary(true);
    table.string('username').nullable(false);
    table.string('card_hash').nullable(false);
    table.string('card_desc').nullable(false);
    table.timestamp('reg_date').nullable(false);
    table.string('registrar').nullable(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
