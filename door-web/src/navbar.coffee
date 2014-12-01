define ["modals/login_modal", "modals/deny_modal"], (login_modal, deny_modal) ->
  class navbar extends Backbone.View
    el: "#navbar"
    events:
      "click #login-btn": "show_login_modal"
      "click .reg-user" : "reg_user"
      "click .dereg-user" : "dereg_user"
      "click .view-logs": "view_logs"

    show_login_modal: () ->
      new login_modal().render()

    show_deny_modal: () ->
      new deny_modal().render()

    reg_user: () =>
      if App.Views.mainView.is_authed() is false
        @show_login_modal()
      else if App.Views.mainView.is_admin() is false
        @show_deny_modal()

    dereg_user: () =>
      if App.Views.mainView.is_authed() is false
        @show_login_modal()
      else if App.Views.mainView.is_admin() is false
        @show_deny_modal()

    show_creds: (creds) ->
      $("#login-btn").innerText = "Logged in as #{creds.user}"

    view_logs: () =>
      if App.Views.mainView.is_authed() is false
        @show_login_modal()
      else if App.Views.mainView.is_admin() is false
        @show_deny_modal()