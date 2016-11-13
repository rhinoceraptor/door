'use strict'

const { expect } = require('chai'),
  td = require('testdouble'),
  moment = require('moment')

describe('controllers/web/logs', () => {
  let controller, req, res, swipeModel

  beforeEach(() => {
    req = td.object({ page: 1, itemsPerPage: 25 })
    res = td.object(['renderPaginated', 'sendWebError'])
    swipeModel = td.replace('../../../models/swipe')
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

})

