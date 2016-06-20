'use strict'

const { expect } = require('chai'),
  middleware = require('../../middleware/session')

describe('Session middleware', function () {
  let req, res
  beforeEach(() => {
    req = {
      isAuthenticated() {}
    }
    res = {
      redirect() {}
    }
  })

  it('should call next if the user is authenticated', function (done) {
    req.isAuthenticated = () => true
    middleware(req, res, done)
  })

  it('should call redirect to /web/user/log-in if the user is not authenticated', function (done) {
    req.isAuthenticated = () => false
    res.redirect = (path) => {
      expect(path).to.equal('/web/user/log-in')
      return done()
    }
    middleware(req, res, () => {
      return done(new Error('This should not happen'))
    })
  })

})

