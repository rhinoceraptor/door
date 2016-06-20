Computer Club Door Server
-------------------------

### Server Overview
- ```GET``` ```/door``` for the door state
- ```POST``` ```/door``` for storing the door state
- ```POST``` ```/door-auth``` for opening the door, as well as for registering cards
  - The server will control which of those is happening. In either case, the Raspberry Pi, if given a 200 OK header will open the door.
- Storing the door state, as well as registered users, admin account data, and card swipe events in a SQLite3 database
- Admins for the web interface are authorized using [passport-local](https://github.com/jaredhanson/passport-local) with [express](https://github.com/strongloop/express), and passwords are hashed (and salted) using scrypt (via [node-scrypt](https://github.com/barrysteyn/node-scrypt)).
- Admins can add and remove users' cards as well as view card swipe logs.

### Web App Overview
- The web app is built with [express](https://github.com/strongloop/express), [jade](https://github.com/jadejs/jade), [passport-local](https://github.com/jaredhanson/passport-local), and layout is done with [bootstrap](https://github.com/twbs/bootstrap).
- The endpoints are:
  - ```GET``` ```/```: Serves the login.jade view
  - ```GET``` ```/swipe-logs```: Serves the logs.jade view with 7 days of history
  - ```POST``` ```/swipe-logs```: Serve the logs.jade view with req.body.days of history. If this is not an int, it defaults back to 7.
  - ```GET``` ```/reg-user```: Serves the reg-user.jade view
  - ```POST``` ```/reg-user```: REST endpoint for registering a user's card
  - ```GET``` ```/dereg-user```: Serves the dereg-user.jade view
  - ```POST``` ```/dereg-user```: REST endpoint for de-registering a user's card
  - ```GET``` ```/card-reg-logs```: Server the card-reg-logs.jade view
  - ```GET``` ```/login```: Serves login.jade view
  - ```POST``` ```/login```: REST endpoint for logging in, from the login.jade view
  - ```GET``` ```/logout```: Logs the user out of the passport-local middleware
  - ```GET``` ```/login-failure```: Serves the login.jade view with the message 'Login Failed! Try again.'

