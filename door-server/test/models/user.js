'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback, queryRow } = require('../../db'),
  model = require('../../models/user'),
  adminModel = require('../../models/admin')

const fixture = {
  username: 'joe user',
  realName: 'Joe User',
  cardHash: 'ABCD1234',
  cardDescription: 'Student ID'
}

describe('models/user', () => {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))

  let adminId

  beforeEach((done) => {
    adminModel.createAdmin(fixture, (err, rows) => {
      if (err) { return done(err) }
      adminId = rows[0]
      return done()
    })
  })

  describe('createUser', () => {
    it('should create a user', (done) => {
      model.createUser(Object.assign(fixture, { adminId }), (err, rows) => {
        expect(err).not.to.be.ok
        expect(rows[0]).to.be.a('number')
        queryRow(knex(model.tableName), { id: rows[0] }, (err, user) => {
          expect(err).not.to.be.ok
          expect(user.username).to.equal('joe user')
          expect(user.realName).to.equal('Joe User')
          expect(user.cardHash).to.equal('ABCD1234')
          expect(user.cardDescription).to.equal('Student ID')
          return done()
        })
      })
    })
  })

  describe('checkCardHash', () => {
    let userId
    beforeEach((done) => {
      model.createUser(fixture, (err, id) => {
        if (err) { return done(err) }
        userId = id
        return done()
      })
    })

    it('should return true if the card hash is in the database', (done) => {
      model.checkCardHash(fixture.cardHash, (err, correct) => {
        expect(err).not.to.be.ok
        expect(correct).to.equal(true)
        return done()
      })
    })

    it('should return false if the card hash is not in the database', (done) => {
      model.checkCardHash('0xBADHASH', (err, correct) => {
        expect(err).not.to.be.ok
        expect(correct).to.equal(false)
        return done()
      })
    })

  })

})

