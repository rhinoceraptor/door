'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback } = require('../../db'),
  model = require('../../models/admin')

const fixture = {
  username: 'testAdmin',
  realName: 'Test Admin',
  hash: '$2a$10$fMy8J5cXaImNf2s8FvipLuYkHgKWmTfdssY/lapIZ8iDOghG9qA0C'
}

describe('models/admin', function () {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))

  describe('createAdmin', function () {
    it('should create an admin', function (done) {
      model.createAdmin(fixture, function (err, rows) {
        expect(err).to.be.null
        expect(rows[0]).to.be.a('Number')
        model.getById(rows[0], function (err, admin) {
          expect(admin.id).to.equal(rows[0])
          expect(admin.username).to.equal(fixture.username)
          expect(admin.realName).to.equal(fixture.realName)
          expect(admin.hash).to.equal(fixture.hash)
          return done()
        })
      })
    })
  })

  describe('hashPassword', function () {
    it('should take a password, and return the hash/salt string', function (done) {
      model.hashPassword('ASDF1234', function (err, hash) {
        expect(err).not.to.be.ok
        expect(hash).to.be.a('string')
        return done()
      })
    })

    it('should not have the same hash/salt string for the same password', function (done) {
      model.hashPassword('ASDF1234', function (err, hash) {
        expect(err).not.to.be.ok
        expect(hash).to.be.a('string')
        model.hashPassword('ASDF1234', function (err, hashTwo) {
          expect(err).not.to.be.ok
          expect(hash).to.be.a('string')
          expect(hash).not.to.equal(hashTwo)
          return done()
        })
      })
    })

  })

  describe('checkPassword', function () {
    let adminId

    beforeEach(function (done) {
      model.createAdmin(fixture, function (err, rows) {
        if (err) { return done(err) }
        adminId = rows[0]
        return done()
      })
    })

    it('should cb true if the password is correct', function (done) {
      model.checkPassword(adminId, 'asdf', function (err, correct) {
        expect(err).not.to.be.ok
        expect(correct).to.be.true
        return done()
      })
    })

    it('should cb false if the password is incorrect', function (done) {
      model.checkPassword(adminId, 'asdff', function (err, correct) {
        expect(err).not.to.be.ok
        expect(correct).to.be.false
        return done()
      })
    })
  })
})

