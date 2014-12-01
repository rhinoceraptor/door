###############################################################################
# Backbone.JS router class
###############################################################################

define ["door"], (door) ->
  class router extends Backbone.Router
    routes:
      "": "main_route"

    main_route: (param) ->
      # If the page is already loaded, avoid rendering main view
      if not App.Views.mainView?
        App.Views.mainView = new door
        App.Views.mainView.render()
