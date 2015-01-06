
exports.home = (req, res) ->
  res.render('home', {title: 'Door Server'})

exports.login = (req, res) ->
  res.render('login', {title: 'Log In'})
