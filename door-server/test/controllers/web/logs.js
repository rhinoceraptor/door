'use strict'

const { expect } = require('chai'),
  td = require('testdouble'),
  { merge } = require('ramda'),
  moment = require('moment')

describe('controllers/web/logs', () => {
  let controller, req, res, swipeModel

  beforeEach(() => {
    req = td.object({ params: { page: 1 } })
    res = td.object(['render', 'sendWebError'])
    swipeModel = td.replace('../../../models/swipe')
    controller = require('../../../controllers/web/logs')
  })

  afterEach(td.reset)

  describe('getSwipe', () => {
    it('should render the swipes view', () => {
      td.when(swipeModel.getSwipes(1, 25, td.callback)).thenCallback(null, [{ totalRows: 25 }])
      controller.getSwipe(req, res)
      td.verify(res.render('swipes', { rows: [{ totalRows: 25 }], numPages: 1, currentPage: 1 }))
    })

    it('should send the user to page 1 if the page is malformed', () => {
      td.when(swipeModel.getSwipes(1, 25, td.callback)).thenCallback(null, [{ totalRows: 25 }])
      req = td.object({ params: { page: 'page' } })
      controller.getSwipe(req, res)
      td.verify(res.render('swipes', { rows: [{ totalRows: 25 }], numPages: 1, currentPage: 1 }))
    })

    it('should send an error if getting swipes failed', () => {
      td.when(swipeModel.getSwipes(1, 25, td.callback)).thenCallback('oops!')
      controller.getSwipe(req, res)
      td.verify(res.sendWebError())
    })

  })

})

