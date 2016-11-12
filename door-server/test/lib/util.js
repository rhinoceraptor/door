'use strict'

const { expect } = require('chai'),
  util = require('../../lib/util')

describe('util', () => {

  describe('snakeify', () => {
    it('should convert camelCase to snake_case', () => {
      expect(util.snakeify('snakeStringTest')).to.equal('snake_string_test');
    })
  })

  describe('camelize', () => {
    it('should convert snake_case to camelCase', () => {
      expect(util.camelize('snake_string_test')).to.equal('snakeStringTest');
    })
  })

  describe('camelizeObject', () => {
    it('should camelize the keys of an object', () => {
      expect(util.camelizeObject({
        snake_case_key: 'test',
        snake_case_key_two: 2
      })).to.deep.equal({
        snakeCaseKey: 'test',
        snakeCaseKeyTwo: 2
      })
    })
  })

  describe('snakeifyObject', () => {
    it('should snakeify the keys of an object', () => {
      expect(util.snakeifyObject({
        snakeCaseKey: 'test',
        snakeCaseKeyTwo: 'value'
      })).to.deep.equal({
        snake_case_key: 'test',
        snake_case_key_two: 'value'
      })
    })
  })

  describe('calculatePagination', () => {
    let data

    beforeEach(() => {
      data = Array(10).fill({ totalRows: 25 })
    })

    it('should calculate the number of pages a set of results and items per pages', () => {
      expect(util.calculatePagination(data, 5, 1).numPages).to.equal(5)
    })

    it('should round up the number of pages if it is not evenly divisible', () => {
      expect(util.calculatePagination(data, 6, 1).numPages).to.equal(5)
    })

    it('should calculate the next page for a set of results', () => {
      expect(util.calculatePagination(data, 5, 1).nextPage).to.equal(2)
    })

    it('should not calculate the next page for a set of results if on the last page', () => {
      expect(util.calculatePagination(data, 25, 1).nextPage).not.to.be.ok
    })

    it('should calculate the previous page for a set of results', () => {
      expect(util.calculatePagination(data, 5, 2).prevPage).to.equal(1)
    })

    it('should not calculate the previous page for a set of results if on the first page', () => {
      expect(util.calculatePagination(data, 25, 1).prevPage).not.to.be.ok
    })

  })

})
