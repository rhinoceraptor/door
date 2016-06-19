'use strict'

const { expect } = require('chai'),
  util = require('../src/util')

describe('util', function () {

  describe('snakeify', function () {
    it('should convert camelCase to snake_case', function () {
      expect(util.snakeify('snakeStringTest')).to.equal('snake_string_test');
    })
  })

  describe('camelize', function () {
    it('should convert snake_case to camelCase', function () {
      expect(util.camelize('snake_string_test')).to.equal('snakeStringTest');
    })
  })

  describe('camelizeObject', function () {
    it('should camelize the keys of an object', function () {
      expect(util.camelizeObject({
        snake_case_key: 'test',
        snake_case_key_two: 'value'
      })).to.deep.equal({
        snakeCaseKey: 'test',
        snakeCaseKeyTwo: 'value'
      })
    })
  })

  describe('snakeifyObject', function () {
    it('should snakeify the keys of an object', function () {
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
