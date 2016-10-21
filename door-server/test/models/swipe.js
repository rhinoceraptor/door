'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback, insertRows, queryRow } = require('../../db'),
  { camelizeObject } = require('../../lib/util'),
  moment = require('moment'),
  model = require('../../models/swipe')

const userFixture = {
  username: 'testAdmin',
  realName: 'Test Admin',
  hash: '$2a$10$fMy8J5cXaImNf2s8FvipLuYkHgKWmTfdssY/lapIZ8iDOghG9qA0C'
}

describe('models/swipe', () => {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))


  describe('createSwipe', () => {

    it('should create a swipe with accessGranted false', (done) => {
      model.createSwipe({
        accessGranted: false,
        cardHash: '1234ASDF'
      }, (err, rows) => {
        expect(err).not.to.be.ok
        expect(rows[0]).to.be.a('number')
        queryRow(knex(model.tableName), { id: rows[0] }, (err, swipe) => {
          expect(err).not.to.be.ok
          expect(swipe.accessGranted).to.equal(0)
          expect(swipe.cardHash).to.equal('1234ASDF')
          return done()
        })
      })
    })

    it('should create a swipe with accessGranted true', (done) => {
      model.createSwipe({
        accessGranted: true,
        cardHash: '1234ASDF'
      }, (err, rows) => {
        expect(err).not.to.be.ok
        expect(rows[0]).to.be.a('number')
        queryRow(knex(model.tableName), { id: rows[0] }, (err, swipe) => {
          expect(err).not.to.be.ok
          expect(swipe.accessGranted).to.equal(1)
          expect(swipe.cardHash).to.equal('1234ASDF')
          return done()
        })
      })
    })
  })

  describe('getSwipesByUser', () => {
    beforeEach((done) => {
      insertRows(model.tableName, model.fields, [{
        userId: 1,
        accessGranted: true,
        cardHash: '1234',
        timestamp: moment().utc().toISOString()
      }, {
        userId: 1,
        accessGranted: true,
        cardHash: '1234',
        timestamp: moment().utc().toISOString()
      }], (err) => done(err))
    })

    it('should return the list of swipes for a user', (done) => {
      model.getSwipesByUser(1, (err, swipes) => {
        expect(err).not.to.be.ok
        expect(swipes.length).to.equal(2)
        done()
      })
    })
  })

})


