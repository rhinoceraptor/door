'use strict'

const { expect } = require('chai'),
  td = require('testdouble')

describe('middleware/paginate', () => {
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

    it('should set itemsPerPage', () => {
      middleware(req, res, () => {
        expect(req.itemsPerPage).to.equal(25)
      })
    })

  })

  describe('renderPaginated', () => {
    it('should render a page', () => {
      middleware(req, res, () => {
        res.renderPaginated('swipes', [{ totalRows: 105 }])
        td.verify(res.render('swipes', { rows: [{ totalRows: 105 }], currentPage: 1, nextPage: 2, totalPages: 5 }))
      })
    })
  })

})



