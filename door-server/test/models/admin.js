'use strict'

const { expect } = require('chai'),
  { knex, migrate, rollback } = require('../../db'),
  model = require('../../models/admin')

// Hashed password: 'asdf'
const fixture = {
  username: 'testAdmin',
  realName: 'Test Admin',
  hash: '$2a$10$fMy8J5cXaImNf2s8FvipLuYkHgKWmTfdssY/lapIZ8iDOghG9qA0C'
}

// Hashed password: 'asdf'
const fixtureTwo = {
  username: 'testAdminTwo',
  realName: 'Test Admin Two',
  hash: '$2a$10$F9GK/UEgFpYTXQ/3vGw7DuTqOehisBiaBmYuj/zo.79gd2xu2EXym'
}

describe('models/admin', function () {
  beforeEach((done) => migrate(() => done()))
  afterEach((done) => rollback(() => done()))

  let adminId

  beforeEach(function (done) {
    model.createAdmin(fixture, function (err, rows) {
      if (err) { return done(err) }
      adminId = rows[0]
      return done()
    })
  })

  describe('createAdmin', function () {
    it('should create an admin', function (done) {
      model.createAdmin(fixtureTwo, function (err, rows) {
        expect(err).to.not.be.ok
        expect(rows[0]).to.be.a('Number')
        model.getById(rows[0], function (err, admin) {
          expect(admin.id).to.equal(rows[0])
          expect(admin.username).to.equal(fixtureTwo.username)
          expect(admin.realName).to.equal(fixtureTwo.realName)
          expect(admin.hash).to.equal(fixtureTwo.hash)
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

  describe('serializePassport', function () {
    it('should call back with the id of the object given', function () {
      model.serializePassport({ id: 123 }, function (err, id) {
        expect(err).to.not.be.ok
        expect(id).to.equal(123)
      })
    })
  })

  describe('authenticatePassport', function () {
    it('should call back with the ID and username of the user', function (done) {
      model.authenticatePassport(fixture.username, 'asdf', function (err, correct) {
        expect(err).to.not.be.ok
        expect(correct).to.be.true
        return done()
      })
    })
  })

  describe('deserializePassport', function () {
    it('should deserialize admin from database, call back with id/username', function (done) {
      model.deserializePassport(adminId, function (err, admin) {
        expect(err).not.to.be.ok
        expect(admin).to.deep.equal({
          id: 1,
          username: 'testAdmin'
        })
        return done()
      })
    })
  })
})

