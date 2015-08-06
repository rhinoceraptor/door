/* External dependancies */
const expect = require('chai').expect,
  should = require('should'),
  request = require('supertest');

/* Import the main express app to request against */
const app = require('../src/app');

describe('Router', () => {
  describe('Authentication', () => {
    it('Should reject unauthorized users on protected URLS', (done) => {
      request(app)
        .get('/reg-user')
        .expect(302, done);
    });

    it('Should redirect to /login on protected URLs', (done) => {
      request(app)
        .get('/reg-user')
        .end((err, res) => {
          expect(res.header['location']).equal('/login');
          done();
        });
    });

    it('Should redirect to /login on failed log in', (done) => {
      request(app)
        .post('/login')
        .send({
          username: 'foo',
          password: 'bar'
        }).expect(302)
        .end((err, res) => {
          expect(res.header['location']).equal('/login');
          done();
        });
    });
    
  });
});
