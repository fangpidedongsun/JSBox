var _view = require("scripts/view")
var _base = require("scripts/base")
var _main = require("scripts/action_main")
var _qiniu = require("scripts/action_qiniu")

function main() {
  if (!SETTING_FILE[0][0] || !SETTING_FILE[0][1]) {
    _view.generateMainViewObjects()
    _view.mainView()
    $delay(0.1, function() {
      _main.activeMenu(2)
    })
  } else {
    if (!$context.data) {
      _view.generateMainViewObjects()
      _view.mainView()
      _qiniu.fetch()
    } else {
      var data = $context.data
      var fileName = data.fileName.replace(/\s/g, "-")
      $input.text({
        text: fileName,
        handler: function(text) {
          var token = _base.authUpload(text)
          _base.upload(token, data, text)
        }
      })
    }
  }
}

module.exports = {
  main: main
}