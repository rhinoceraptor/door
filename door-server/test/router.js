/* External dependancies */
const fs = require('fs'),
  expect = require('chai').expect,
  should = require('should'),
  supertest = require('supertest'),
  request = require('request');

/* Import the main express app to supertest against */
const app = require('../src/app').app,
  https = require('../src/app').https;

const config = require('../config');

describe('Router', () => {
  describe('User Authentication', () => {

    const web_get_paths = [
      '/open-door',
      '/swipe-logs',
      '/swipe-logs',
      '/card-reg-logs',
      '/reg-user',
      '/reg-user',
      '/dereg-user',
      '/dereg-user',
      '/logout'
    ];

    /* Iterate thru the web GET paths and check that they redirect */
    for (var i in web_get_paths) {
      const path = web_get_paths[i];
      it(`Rejects unauth'd users on GET URL ${path}`, (done) => {
        supertest(app)
          .get(path)
          .expect(302)
          .end((err, res) => {
            expect(res.header['location']).equal('/login');
            done();
          })
      });
    }

    const web_post_paths = [
      '/swipe-logs',
      '/reg-user',
      '/dereg-user'
    ];

    /* Iterate thru the web POST paths and check that they redirect */
    for (var i in web_post_paths) {
      const path = web_post_paths[i];
      it(`Rejects unauth'd users on POST URL ${path}`, (done) => {
        supertest(app)
          .post(path)
          .send({
            foo: 'bar',
            baz: false
          }).expect(302)
          .end((err, res) => {
            expect(res.header['location']).equal('/login');
            done();
          })
      });
    }

    it('Redirects to /login on failed log in', (done) => {
      supertest(app)
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

  describe('API Authentication', () => {
    it('Rejects an API call from an invalid SSL cert', (done) => {
      /* Read in an invalid (not signed by the CA) cert to test with */
      const opts = {
        url: 'https://127.0.0.1:9001/door',
        method: 'POST',
        key: fs.readFileSync(config.testing_key),
        cert: fs.readFileSync(config.ssl_cert),
        requestCert: false,
        rejectUnauthorized: false,
        form: {
          state: '1'
        }
      };

      request(opts, (err, resp, body) => {
        expect(resp.statusCode).equal(401);
        expect(body).equal(config.unauth_msg);
        done();
      });
    });

    it('Accepts an API call from an valid SSL cert', (done) => {
      /* Read in a valid (signed by the CA) cert to test with */
      const opts = {
        url: 'https://127.0.0.1:9001/door',
        method: 'POST',
        key: fs.readFileSync(config.client_key),
        cert: fs.readFileSync(config.client_cert),
        rejectUnauthorized: false,
        form: {
          state: '1'
        }
      };

      request(opts, (err, resp, body) => {
        expect(resp.statusCode).equal(200);
        expect(body).equal(config.auth_msg);
        done();
      });
    });

  });
});
