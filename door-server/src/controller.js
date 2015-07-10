
/* Render the login page */
exports.login = function(req, res, msg) {
  return res.render('login', {title: 'Log In', msg: msg});
}

/* Log the user out of their passport session */
exports.log_out = function(req, res) {
  req.session.destroy(function(err) {
    req.logout();
    return res.redirect('/');
  });
}

/*
 * Access the raspberry pi's open door API to open the door from web interface
 */
exports.open_door = function(req, res) {
  var url = `https://${config.rpi_url}:${config.rpi_port}${config.rpi_open}`;

  var opts = {
    url: url,
    method: 'GET',
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert),
    rejectUnauthorized: false
  };

  request.get(opts, function(err, resp, body) {
    res.send('great job!\n');
    res.end();
  });

  // Log the opening event in the swipe database
  var swipe = new models.Swipe({
    hash: 'N/A',
    granted: true,
    user: valid.escape(req.user.user).toString()
  });

  swipe.save();
}
