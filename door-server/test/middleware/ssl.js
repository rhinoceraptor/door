'use strict'

const { expect } = require('chai'),
  middleware = require('../../middleware/ssl')

describe('SSL middleware', function () {
  let req, res
  beforeEach(() => {
    req = {
      client: {
        authorized: true
      }
    }
    res = {
      status() { return this },
      send() { return this }
    }
  })

  it('should call next if the client is authorized', function (done) {
    middleware(req, res, done)
  })

  it('should return 401 if the client is not authorized', function (done) {
    req.client.authorized = false
    res = {
      status(code) {
        expect(code).to.equal(401)
        return this
      },
      send(message) {
        expect(message).to.equal('ya blew it')
        return done()
      }
    }
    middleware(req, res, () => {
      return done(new Error('This should not happen'))
    })
  })

})


