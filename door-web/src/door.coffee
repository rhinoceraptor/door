# Central class for the door frontend system

define ["modals/error_modal", "modals/login_modal", "modals/deny_modal"], (error_modal, login_modal, deny_modal) ->
  class door extends Backbone.View
    el: ".main-body"

    initialize: ->
      @socket = io.connect("http://127.0.0.1:8080" || location.host)
      @socket.on 'connect', () -> console.log 'connected to socket'
      @socket.on 'error', @error
      @socket.on 'auth', @auth
      @socket.on 'ok_auth', @ok_auth
      @socket.on 'bad_auth', @bad_auth

      @admin = false
      @authed = true

    render: ->
      console.log 'rendering!'

    error: (e)->
      new error_modal().render(e)

    # returns if the user is admin or not
    is_auth: () =>
      return @admin

    auth: (creds) =>
      App.Views.navbar.show_creds(creds)
      if creds.admin is true
        @admin = true

    try_auth: (user, passwd) =>
      console.log 'user: ' + user
      console.log 'passwd: ' + passwd
      @socket.emit("auth", {"username": user, "passwd": passwd})

    is_authed: () =>
      return @authed

    is_admin: () =>
      return @admin

    ok_auth: () ->
      App.Views.log
    bad_auth: () ->
      App.Views.log
