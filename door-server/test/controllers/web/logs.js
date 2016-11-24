'use strict'

const { expect } = require('chai'),
  td = require('testdouble'),
  moment = require('moment')

describe('controllers/web/logs', () => {
  let controller, req, res, swipeModel, userModel

  beforeEach(() => {
    req = td.object({ page: 1, itemsPerPage: 25 })
    res = td.object(['renderPaginated', 'sendWebError'])
    swipeModel = td.replace('../../../models/swipe')
    userModel = td.replace('../../../models/user')
    controller = require('../../../controllers/web/logs')
  })

  afterEach(td.reset)

  describe('getSwipe', () => {
    it('should render the swipes view', () => {
      td.when(swipeModel.getSwipes(1, 25, td.callback)).thenCallback(null, [{ totalRows: 37 }])
      controller.getSwipe(req, res)
      td.verify(res.renderPaginated('swipes', [{ totalRows: 37 }]))
    })

    it('should send an error if getting swipes failed', () => {
      td.when(swipeModel.getSwipes(1, 25, td.callback)).thenCallback('oops!')
      controller.getSwipe(req, res)
      td.verify(res.sendWebError())
    })
  })

  describe('getCardRegistration', () => {
    it('should render the card registrations view', () => {
      td.when(userModel.getUsers(1, 25, td.callback)).thenCallback(null, [{ totalRows: 24 }])
      controller.getCardRegistration(req, res)
      td.verify(res.renderPaginated('card-registrations', [{ totalRows: 24 }]))
    })

    it('should send an error if getting card registrations failed', () => {
      td.when(userModel.getUsers(1, 25, td.callback)).thenCallback('oops!')
      controller.getCardRegistration(req, res)
      td.verify(res.sendWebError())
    })
  })
})

