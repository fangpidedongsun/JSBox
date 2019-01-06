function alertUploaded(fileName) {
  $ui.toast($l10n("toast_uploaded"))
  $ui.alert({
    title: fileName,
    actions: [{
        title: $l10n("alert_button_close"),
        style: "Cancel",
        handler: function() {
          $context.close()
          $app.close()
        }
      },
      {
        title: $l10n("alert_button_copy"),
        handler: function() {
          $clipboard.text = encodeURI(URL_SELF + fileName)
          $ui.toast($l10n("toast_copied"))
          $delay(2, function() {
            $context.close()
            $app.close()
          })
        }
      }
    ]
  })
}

function alertFileExists(fileName, handler) {
  $ui.alert({
    title: fileName,
    message: $l10n("alert_message_file_exists"),
    actions: [{
      title: $l10n("alert_button_cancel"),
      style: "Cancel",
      handler: function() {}
    },
    {
      title: $l10n("alert_button_override"),
      style: "Destructive",
      handler: handler
    }]
  })
}

function alertError(code, err) {
  $ui.alert({
    title: $l10n("alert_title_error"),
    message: code.toString() + ": " + err,
  })
}

module.exports = {
  uploaded: alertUploaded,
  fileExists: alertFileExists,
  error: alertError
}