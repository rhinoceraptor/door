'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback } = require('../../db'),
  model = require('../../models/admin')

const userFixture = {
  username: 'testAdmin',
  realName: 'Test Admin',
  hash: '$2a$10$fMy8J5cXaImNf2s8FvipLuYkHgKWmTfdssY/lapIZ8iDOghG9qA0C'
}

describe('models/swipe', function () {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))

})


