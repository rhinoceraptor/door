# Central class for the door frontend system

define ["modals/error_modal", "modals/login_modal"], (error_modal, login_modal) ->
  class door extends Backbone.View
    el: ".main-body"

    initialize: ->
      @socket = io.connect("http://127.0.0.1:8080" || location.host)
      @socket.on 'connect', () -> console.log 'connected to socket'
      @socket.on 'error', @error
      @socket.on 'auth', @auth

      @admin = false
      @authed = false

      new error_modal().render()

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
      @socket.emit("auth", {user, passwd})

    is_authed: () =>
      return @authed