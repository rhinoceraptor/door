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

})
