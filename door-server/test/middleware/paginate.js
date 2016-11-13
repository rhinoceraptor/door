'use strict'

const { expect } = require('chai'),
  td = require('testdouble')

describe('controllers/web/logs', () => {
  let middleware, req, res

  beforeEach(() => {
    req = td.object({ params: { page: 1 } })
    res = td.object(['render'])
    middleware = require('../../middleware/paginate')
  })

  afterEach(td.reset)

  describe('page', () => {
    it('should set the page', () => {
      middleware(req, res, () => {
        expect(req.page).to.equal(1)
      })
    })

    it('should set the page to 1 if malformed', () => {
      req.params.page = 'page'
      middleware(req, res, () => {
        expect(req.page).to.equal(1)
      })
    })
  })

  describe('renderPaginated', () => {
    it('should render a page', () => {
      middleware(req, res, () => {
        res.renderPaginated('swipes', [{ totalRows: 25 }], 5)
        td.verify(res.render('swipes', { rows: [{ totalRows: 25 }], currentPage: 1, nextPage: 2, totalPages: 5 }))
      })
    })
  })

})



