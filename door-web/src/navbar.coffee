define ["modals/login_modal"], (login_modal) ->
  class navbar extends Backbone.View
    el: "#navbar"
    events:
      "click #login-btn": "show_login_modal"
      "click .reg-user" : "reg_user"
      "click .dereg-user" : "dereg_user"

    show_login_modal: () ->
      new login_modal().render()

    reg_user: () =>
      if App.Views.mainView.is_authed() is false
        @show_login_modal()

    dereg_user: () =>
      if App.Views.mainView.is_authed() is false
        @show_login_modal()

    show_creds: (creds) ->
      $("#login-btn").innerText = "Logged in as #{creds.user}"