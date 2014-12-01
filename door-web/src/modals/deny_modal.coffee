define ->
  class @deny_modal extends Backbone.View
    el: "#deny-modal"
    events:
      "click #btn-ok": "ok"

    initialize: (opts) ->
      @$okBtn = @$el.find("#btn-ok")

      $(document).on("keyup checkout", (e) =>
        if e.keyCode is 13
          e.preventDefault()
          @ok()
        if e.keyCode is 27
          e.preventDefault()
          @cancel())

    render: (e) =>
      @$el.modal()
      this

    ok: () =>
      @cleanup()

    cleanup: () ->
      $(document).off("keyup checkout")
      @$el.off("click", "#btn-ok")
      @$el.modal("hide")
