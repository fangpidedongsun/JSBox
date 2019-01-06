var _view = require("scripts/view")
var _data = require("scripts/data")

function main() {
  _view.generateMainViewObjects()
  _view.mainView()
  if (SETTING_FILE[0][3]) {
    // Get On Screen
    $thread.background({
      delay: 0,
      handler: function() {
        var cache = $cache.get("onScreen")
        if (typeof(cache) == "undefined") {
          _data.fetchDataOnScreen()
        } else {
          RAW_DATA[ON_SCREEN] = cache
          _data.loadDataOnScreen()
        }
      }
    })

    // Get Coming Soon
    $thread.background({
      delay: 0,
      handler: function() {
        var cache = $cache.get("comingSoon")
        if (typeof(cache) == "undefined") {
          _data.fetchDataComingSoon()
        } else {
          RAW_DATA[COMING_SOON] = cache
          _data.loadDataComingSoon()
        }
      }
    })
  } else {
    $thread.background({
      delay: 0,
      handler: function() {
        _data.fetchDataOnScreen()
      }
    })
    
    $thread.background({
      delay: 0,
      handler: function() {
        _data.fetchDataComingSoon()
      }
    })
  }

  if (SETTING_FILE[0][1] == ON_SCREEN) {
    $("onscreen").hidden = false
  } else {
    $("comingsoon").hidden = false
  }
}

module.exports = {
  main: main
}