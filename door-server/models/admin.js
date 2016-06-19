'use strict'

const knex = require('../db')

const tableName = 'admin'

const fields = [
  'username',
  'realName',
  'passwordHash',
  'passwordSalt'
]
function createAdmin (admin, cb) {
  knex(tableName)
    .insert(
