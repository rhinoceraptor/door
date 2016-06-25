'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback, queryRow } = require('../../db'),
  { camelizeObject } = require('../../lib/util'),
  model = require('../../models/swipe')

const userFixture = {
  username: 'testAdmin',
  realName: 'Test Admin',
  hash: '$2a$10$fMy8J5cXaImNf2s8FvipLuYkHgKWmTfdssY/lapIZ8iDOghG9qA0C'
}

describe('models/swipe', function () {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))


  describe('createSwipe', function () {

    it('should create a swipe with accessGranted false', function (done) {
      model.createSwipe({
        accessGranted: false,
        cardHash: '1234ASDF'
      }, (err, rows) => {
        expect(err).not.to.be.ok
        expect(rows[0]).to.be.a('number')
        queryRow(knex(model.tableName).where({ id: rows[0] }), (err, swipe) => {
          expect(err).not.to.be.ok
          expect(swipe.accessGranted).to.equal(0)
          expect(swipe.cardHash).to.equal('1234ASDF')
          return done()
        })
      })
    })

    it('should create a swipe with accessGranted true', function (done) {
      model.createSwipe({
        accessGranted: true,
        cardHash: '1234ASDF'
      }, (err, rows) => {
        expect(err).not.to.be.ok
        expect(rows[0]).to.be.a('number')
        queryRow(knex(model.tableName).where({ id: rows[0] }), (err, swipe) => {
          expect(err).not.to.be.ok
          expect(swipe.accessGranted).to.equal(1)
          expect(swipe.cardHash).to.equal('1234ASDF')
          return done()
        })
      })
    })
  })

})


