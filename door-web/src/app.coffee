require ["router", "navbar", "door",], (router, navbar, door) ->
  window.App = {}
  App.Views = {}
  App.Views.router = new router
  App.Views.navbar = new navbar
  Backbone.history.start()
