
/*
 * migrations/door.js
 * --------------------
 * This is the schema/migration for the door state table
 */

exports.up = function(knex, Promise) {
  return knex.schema.createTable('door', function(table) {
    table.increments('id').nullable(false).primary(true);
    table.boolean('state').nullable(false);
    table.timestamp('timestamp').nullable(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('door');
};
