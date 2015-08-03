
/*
 * models/index.js
 * ---------------
 */

const knex = require('knex'),
  book_shelf = require('bookshelf');

/* Set up bookshelf and knex */
const db_config = knex(require('../knexfile').development),
  bookshelf = book_shelf(db_config),
  config = require('../config');

/* Set up the User model */
const User = bookshelf.Model.extend({
  tableName: "users"
});
exports.User = User;

/* Set up the admins model */
const Admin = bookshelf.Model.extend({
  tableName: "admins"
});
exports.Admin = Admin;

/* Set up the door model */
const Door = bookshelf.Model.extend({
  tableName: "door"
});
exports.Door = Door;

/* Set up the swipe model */
const Swipe = bookshelf.Model.extend({
  tableName: "swipes"
});
exports.Swipe = Swipe;
