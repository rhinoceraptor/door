
/*
 * migrations/admins.js
 * --------------------
 * This is the schema/migration for the admin web app users
 */

exports.up = function(knex, Promise) {
  return knex.schema.createTable('admins', function(table) {
    table.increments('id').nullable(false).primary(true);
    table.string('username').nullable(false);
    table.string('pw_hash').nullable(false);
    table.string('pw_desc').nullable(false);
    table.timestamp('reg_date').nullable(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('admins');
};
