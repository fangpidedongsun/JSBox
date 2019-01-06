var _qiniu = require("scripts/action_qiniu")

function activeMenu(index) {
  const trans = ["home", "downloads", "setting"]
  var dstViewId = trans[index]
  var views = $("content").views
  for (var i in views) {
    if (views[i].hidden === false) {
      var viewId = trans[i]
      break
    }
  }
  if (dstViewId == viewId && $(viewId).data.length > 0) {
    $(viewId).scrollTo({
      indexPath: $indexPath(0, 0)
    })
  } else {
    for (var i = 0; i < 3; i++) {
      $("menu").cell($indexPath(0, i)).views[0].views[0].tintColor = index == i ? $color("tint") : $color("lightGray")
      $("menu").cell($indexPath(0, i)).views[0].views[1].textColor = index == i ? $color("tint") : $color("lightGray")
    }
    $(viewId).hidden = true
    $(dstViewId).hidden = false
  }
}

function showMenu(list, indexPath) {
  var file = list.object(indexPath)
  var fileName = file.fname.text
  var upTime = (new Date(file.time / 10000)).format("yyyy-MM-dd hh:mm:ss")
  $ui.action({
    title: fileName,
    message: upTime,
    actions: [{
        title: $l10n("action_preview"),
        handler: function() {
          $safari.open({
            url: encodeURI(URL_SELF + fileName)
          })
        }
      },
      {
        title: $l10n("action_download"),
        handler: function() {
          _qiniu.download(fileName)
        }
      },
      {
        title: $l10n("action_copy"),
        handler: function() {
          $ui.toast($l10n("toast_copied"))
          $clipboard.text = encodeURI(URL_SELF + fileName)
        }
      }
    ]
  })
}

function showManage(list, indexPath) {
  var fileName = list.object(indexPath).fname.text
  $ui.action({
    title: fileName,
    message: $l10n("alert_message_action"),
    actions: [{
        title: $l10n("action_refresh"),
        handler: function() {
          _qiniu.refresh(URL_SELF + fileName)
        }
      },
      {
        title: $l10n("action_rename"),
        handler: function() {
          $input.text({
            type: $kbType.default,
            text: fileName,
            handler: function(text) {
              if (text !== "" && file !== text) {
                _qiniu.rename(fileName, text)
              }
            }
          })
        }
      },
      {
        title: $l10n("action_delete"),
        style: "Destructive",
        handler: function() {
          $ui.alert({
            title: fileName,
            message: $l10n("alert_message_delete"),
            actions: [{
                title: $l10n("alert_button_cancel"),
                style: "Cancel",
                handler: function() {}
              },
              {
                title: $l10n("alert_button_delete"),
                style: "Destructive",
                handler: function() {
                  _qiniu.delete(fileName)
                  list.delete(indexPath)
                }
              }
            ]
          })
        }
      }
    ]
  })
}

function actionUpdateLayout() {
  $("popover_setting").updateLayout(function(make, view) {
    var sup = view.super

    if ($device.isIphoneX) {
      make.centerY.equalTo(sup.safeAreaCenterY).offset(-80)
    } else {
      make.centerY.equalTo(sup).offset(-80)
    }
  })
  $ui.animate({
    duration: 0.3,
    animation: function() {
      $("popover").runtimeValue().invoke("layoutIfNeeded")
    }
  })
}

function actionUpdateInfo(property, value) {
  var info = $ui.window.info || { "search": "", "sort": 0, "order": 0 }
  info[property] = value
  $ui.window.info = info
}

function calTabBarHeight(isRunningMain) {
  if ($device.isIphoneX) {
    return isRunningMain ? 70 : 50
  }

  return 50
}

module.exports = {
  activeMenu: activeMenu,
  showMenu: showMenu,
  showManage: showManage,
  updateInfo: actionUpdateInfo,
  updateLayout: actionUpdateLayout
}