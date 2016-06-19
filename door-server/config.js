'use strict'

module.exports = Object.assign({
  port: '9001',
  doorOpen: '0',
  doorClosed: '1',
  sslKey: 'ssl/server.key',
  sslCert: 'ssl/server.crt',
  sslCa: 'ssl/ca.crt'
}, ({
  test: {
    secret: 'mysecret123',
    database: {
      client: 'sqlite3',
      connection: {
        filename: ':memory:'
      },
      migrations: './db/migrations'
    }
  }
})[process.env.NODE_ENV])

