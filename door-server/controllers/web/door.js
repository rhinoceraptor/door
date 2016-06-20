'use strict'

const { get } = require('superagent'),
  config = require('../config')

// GET /web/door/open
exports.getOpen = function getOpen (req, res) {
  const url = `https://${config.rpi_url}:${config.rpi_port}${config.rpi_open}`

  const opts = {
    url: url,
    method: 'GET',
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert),
    rejectUnauthorized: false
  }

  get(opts, function(err, resp, body) {
    return res.status(200).send('great job!\n').end()
  })

  swipeModel.create({
    hash: 'N/A',
    granted: true,
    user: req.user.user
  })
}

