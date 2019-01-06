var _action1 = require("scripts/action_general")

const LANGUAGE = $app.info.locale

function activeSettingMenu(indexPath) {
  var section = indexPath.section
  var row = indexPath.row
  var data

  switch (section) {
    case 0:
    
      switch (row) {
        case 0:
          // Cover Image Quality
          data = MENU.COVER_IMAGE_QUALITY
          actionSettingMenu(section, row, data)
          break

        case 1:
          // Recent Main Index
          data = MENU.RECENT_MAIN_INDEX
          actionSettingMenu(section, row, data)
          break

        case 4:
          // Update Location
          actionUpdateLocation()
          break

        case 5:
          // Theme Color
          data = MENU.THEME_COLOR
          actionThemeColor(section, row, data)
          break

        case 6:
          // Clear Cache
          actionClearCache()
          break

        case 7:
          // Reset
          actionReset()
          break

        default:
          break
      }
      break

    case 1:
      
      switch (row) {
        case 0:
          // Saving Path
          data = MENU.SAVING_PATH
          actionSettingMenu(section, row, data)
          break

        case 1:
          // Update Cover Image
          actionUpdateCoverImage()
          break

        default:
          break
      }
      break

    case 2:
      switch (row) {
        case 0:
          $safari.open({
            url: "https://www.ryannn.com"
          })
          break

        case 1:
          if (LANGUAGE == "en") actionTutorial()
          else actionTutorialZH()
          break

        case 2:
          actionCheck()
          break

        default:
          break
      }

    default:
      break
  }
}

/*
 * Setting sub-functions
 */

function actionSettingMenu(section, row, data) {
  $ui.menu({
    items: data.map(function(x) { return x.name }),
    handler: function(title, idx) {
      var value = data[idx].value
      var current = $("setting").data
      // Update Data
      current[section].rows[row].value.text = data[idx].name
      $("setting").data = current
      if (section == 1 && row == 0) {
        // Path Value Before
        var path = SETTING_FILE[1][0]
        var favor = FAVORITE_FILE
        // Transfer Path
        $file.delete(path)
        $file.mkdir(value)
        // Update Path Value
        SETTING_FILE[1][0] = value
        saveFavorite(favor)
      }
      saveSetting(section, row, value)
    }
  })
}

function actionUpdateLocation() {
  $location.fetch({
    handler: function(resp) {
      $ui.loading(true)
      $http.get({
        url: "https://api-m.mtime.cn/GetCityByLongitudelatitude.api?latitude=" + resp.lat + "&longitude=" + resp.lng,
        handler: function(resp) {
          $ui.loading(false)
          var status = resp.response.statusCode
          if (status == "400") {
            var message = LANGUAGE == "en" ? "Fetching location error, ensure that you have allowed location access and try again." : "获取位置错误，请确保已允许位置获取并再次尝试。"
            $ui.alert({
              title: $l10n("alert_location_title_error"),
              message: message
            })
            return
          }
          // Update Location
          var lid = resp.data.cityId
          var city = resp.data.name
          if (typeof(city) == "undefined") {
            var message = LANGUAGE == "en" ? "Failed to fetch your location, 北京 is set instead." : "获取位置失败，已将位置设为 北京。"
            $ui.alert({
              title: $l10n("alert_location_title_error"),
              message: message
            })
          } else {
            var message = LANGUAGE == "en" ? "Your location have updated to " + city + " successfully." : "位置已成功更新为 " + city + "。"
            saveSetting(0, 4, lid)
            $ui.alert({
              title: $l10n("alert_location_title_success"),
              message: message
            })
          }
        }
      })
    }
  })
}

function actionThemeColor(section, row, data) {
  $ui.menu({
    items: data.map(function(x) { return x.name }),
    handler: function(title, idx) {
      var value = data[idx].value
      // Save Data
      saveSetting(section, row, value)
      $delay(1, function() {
        $addin.run($addin.current.name)
      })
      //$ui.toast($l10n("toast_changing"))
      _action1.toast($l10n("toast_changing"))
    }
  })
}

function actionClearCache() {
  var message = LANGUAGE == "en" ? "Sure to clear all the caches?" : "确定要清除所有缓存？"
  $ui.alert({
    title: $l10n("alert_cache_title"),
    message: message,
    actions: [{
        title: $l10n("alert_button_clear"),
        style: "Destructive",
        handler: function() {
          $cache.clear()
          //$ui.toast($l10n("toast_done"))
          _action1.toast($l10n("toast_done"))
        }
      },
      {
        title: $l10n("alert_button_cancel"),
        style: "Cancel",
        handler: function() {}
      }
    ]
  })
}

function actionReset() {
  var message = LANGUAGE == "en" ? "You can reset all settings to default, or erase all content and settings" : "仅还原所有设置到初始设置，或抹除所有内容和设置"
  $ui.action({
    title: $l10n("alert_reset_title_reset"),
    message: message,
    actions: [{
        title: $l10n("alert_reset_value_setting"),
        handler: function() {
          var message = LANGUAGE == "en" ? "Sure to reset all settings to default?" : "确定要还原到初始设置？"
          $ui.alert({
            title: $l10n("alert_reset_title_warning"),
            message: message,
            actions: [{
                title: $l10n("alert_button_reset"),
                style: "Destructive",
                handler: function() {
                  resetSetting()
                  $delay(1, function() {
                    $addin.run($addin.current.name)
                  })
                  //$ui.toast($l10n("toast_done"))
                  _action1.toast($l10n("toast_done"))
                }
              },
              {
                title: $l10n("alert_button_cancel"),
                style: "Cancel",
                handler: function() {}
              }
            ]
          })
        }
      },
      {
        title: $l10n("alert_reset_value_whole"),
        style: "Destructive",
        handler: function() {
          var message = LANGUAGE == "en" ? "Sure to erase all favorited content and settings?" : "确定要抹除所有内容和设置？"
          $ui.alert({
            title: $l10n("alert_reset_title_warning"),
            message: message,
            actions: [{
                title: $l10n("alert_button_erase"),
                style: "Destructive",
                handler: function() {
                  eraseAll()
                  $delay(1, function() {
                    $addin.run($addin.current.name)
                  })
                  //$ui.toast($l10n("toast_done"))
                  _action1.toast($l10n("toast_done"))
                }
              },
              {
                title: $l10n("alert_button_cancel"),
                style: "Cancel",
                handler: function() {}
              }
            ]
          })
        }
      }
    ]
  })
}

function actionUpdateCoverImage() {
  var file = JSON.stringify(FAVORITE_FILE).replace(/_\d+X\d+X2/g, "_" + SETTING_FILE[0][0])
  FAVORITE_FILE = JSON.parse(file)
  saveFavorite(FAVORITE_FILE)
  // Updata Data
  $("favorited").data = FAVORITE_FILE.FAVORITED
  $("checked").data = FAVORITE_FILE.CHECKED
  //$ui.toast($l10n("toast_updated"))
  _action1.toast($l10n("toast_updated"))
}

function actionTutorial() {
  var text = "Tips\n- Tap menu button to quickly scroll to top.\n- Tap menu button to quickly focus the text field in the search view.\n- LongPress menu button to quickly toggle tab bar.\n- Swipe left to Favorite a movie in the recent view.\n- Swipe left to Check/Uncheck or Delete a favorited movie in the favorite view.\n- Swipe left to Locate a favorited movie in the local search view."

  // Views
  var hintView = $objc("BaseHintView").invoke("alloc.initWithText", text)
  var textView = hintView.invoke("subviews.objectAtIndex", 1).invoke("subviews.objectAtIndex", 1)

  // Attribute for text
  var string = $objc("NSMutableAttributedString").invoke("alloc.initWithString", text)
  string.invoke("addAttribute:value:range:", "NSFont", $font("bold", 26), $range(0, 4))
  string.invoke("setAlignment:range:", $align.center, $range(0, 4))

  string.invoke("addAttribute:value:range:", "NSFont", textView.invoke("font"), $range(4, string.invoke("length") - 4))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Favorite"), 8))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Check"), 13))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Delete"), 6))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Locate"), 6))

  // Paragraph Style
  var para = $objc("NSMutableParagraphStyle").invoke("alloc.init")
  para.invoke("setParagraphSpacing", 15)
  para.invoke("setAlignment", $align.justified)

  string.invoke("addAttribute:value:range:", "NSParagraphStyle", para, $range(4, string.invoke("length") - 4))

  // Setup
  textView.invoke("setAttributedText", string)

  // Show View
  hintView.invoke("show")
}

function actionTutorialZH() {
  var text = "提示\n- 点击菜单按钮以快速返回顶部；\n- 点击菜单按钮以快速激活输入键盘(在搜索页面中)；\n- 长按菜单按钮以快速切换选项栏；\n- 左滑以收藏影片(在最新页面中)；\n- 左滑以已看/未看或删除影片(在收藏页面中)；\n- 左滑以定位已收藏影片(在本地搜索页面中)。"

  // Views
  var hintView = $objc("BaseHintView").invoke("alloc.initWithText", text)
  var textView = hintView.invoke("subviews.objectAtIndex", 1).invoke("subviews.objectAtIndex", 1)

  // Attribute for text
  var string = $objc("NSMutableAttributedString").invoke("alloc.initWithString", text)
  string.invoke("addAttribute:value:range:", "NSFont", $font("bold", 26), $range(0, 2))
  string.invoke("setAlignment:range:", $align.center, $range(0, 2))

  string.invoke("addAttribute:value:range:", "NSFont", textView.invoke("font"), $range(2, string.invoke("length") - 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("收藏"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("已看"), 5))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("删除"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("定位"), 2))

  // Paragraph Style
  var para = $objc("NSMutableParagraphStyle").invoke("alloc.init")
  para.invoke("setParagraphSpacing", 15)
  para.invoke("setAlignment", $align.left)

  string.invoke("addAttribute:value:range:", "NSParagraphStyle", para, $range(2, string.invoke("length") - 2))

  // Setup
  textView.invoke("setAttributedText", string)
  
  // Show View
  hintView.invoke("show")
}

function actionCheck() {
  $ui.loading(true)
  var url = "https://api.ryannn.com/update?query=mtime_movie"
  $http.get({
    url: url,
    handler: function(resp) {
      $ui.loading(false)
      var data = LANGUAGE == "en" ? resp.data.en : resp.data.zh
      var currentVer = $addin.current.version
      var cv = currentVer.split(".").map(function(i) { return parseInt(i) })
      var newVer = data.version
      var nv = newVer.split(".").map(function(i) { return parseInt(i) })

      if (nv[0] > cv[0] || (nv[0] == cv[0] && nv[1] > cv[1])) {
        $ui.alert({
          title: $l10n("alert_update_title_new") + " " + newVer,
          message: data.changes,
          actions: [{
            title: $l10n("alert_button_cancel"),
            style: "Cancel",
            handler: function() {}
          },
          {
            title: $l10n("alert_button_update"),
            handler: function() {
              if (resp.data.eval) {
                for (var i of resp.data.eval) {
                  var nv = i.version.split(".").map(function(i) { return parseInt(i) })
                  if (cv[0] < nv[0] || (cv[0] == nv[0] && cv[1] <= nv[1])) {
                    eval(i.code)
                  }
                }
              }
              replaceAddin(newVer)
            }
          }]
        })
      } else {
        //$ui.toast($l10n("toast_uptodate"))
        _action1.toast($l10n("toast_uptodate"))
      }
    }
  })
}

function saveSetting(section, row, value) {
  var path = SETTING_FILE[1][0]
  // Update Value
  SETTING_FILE[section][row] = value
  $file.write({
    data: $data({ string: JSON.stringify(SETTING_FILE) }),
    path: path + "Setting.conf"
  })
}

function saveFavorite(data) {
  var path = SETTING_FILE[1][0]
  $file.write({
    data: $data({ string: JSON.stringify(data) }),
    path: path + "Favorite.conf"
  })
}

function resetSetting() {
  var path = SETTING_FILE[1][0]
  $file.delete(path)
  // Reset Setting
  SETTING = 0
  SETTING_FILE = JSON.parse(JSON.stringify(DEFAULT_SETTING))
  $file.mkdir(SETTING_FILE[1][0])
  // Move Favorite
  saveFavorite(FAVORITE_FILE)
}

function eraseAll() {
  var path = SETTING_FILE[1][0]
  $file.delete(path)
  // Reset Setting
  SETTING = 0
  SETTING_FILE = JSON.parse(JSON.stringify(DEFAULT_SETTING))
  $file.mkdir(SETTING_FILE[1][0])
  // Reset Favorite
  FAVORITE = 0
  FAVORITE_FILE = JSON.parse(JSON.stringify(DEFAULT_FAVORITE))
}

function replaceAddin(ver) {
  var current = $addin.current
  $http.download({
    url: "https://storage.ryannn.com/jsbox/Mtime-Movie.box",
    handler: function(resp) {
      $addin.save({
        name: current.name,
        version: ver,
        author: "Ryan",
        icon: current.icon,
        types: 3,
        data: resp.data,
        handler: function(success) {
          if (success) {
            $addin.run(current.name)
            $app.close()
          }
        }
      })
    }
  })
}

function customizedAlert(object) {
  const STYLES = {
    "Cancel": 1,
    "Destructive": 2
  }
  var alertController = $objc("UIAlertController").invoke("alertControllerWithTitle:message:preferredStyle:", object.title, "", 1)
  
  for (var i of object.actions) {
    var style = STYLES[i.style] || 0
    var handler = i.handler ? $block("void", i.handler) : null
    var action = $objc("UIAlertAction").invoke("actionWithTitle:style:handler:", i.title, style, handler)
    action.invoke("_setTitleTextColor:", $color("tint"))
    alertController.invoke("addAction", action)
  }
  
  var label = alertController.invoke("view.subviews.objectAtIndex", 0).invoke("subviews.objectAtIndex", 0).invoke("subviews.objectAtIndex", 0).invoke("subviews.objectAtIndex", 0).invoke("subviews.objectAtIndex", 0).invoke("subviews.objectAtIndex", 1)
  var text = $objc("NSMutableAttributedString").invoke("alloc.initWithString:", object.message)
  var para = $objc("NSMutableParagraphStyle").invoke("alloc.init")
  
  // Set Head Indent
  para.invoke("setHeadIndent", 10)
  text.invoke("addAttribute:value:range:", "NSParagraphStyle", para, $range(0, text.invoke("length")))
  // Set Attributed Text
  label.invoke("setAttributedText", text)
  // Show
  alertController.invoke("show")
}

module.exports = {
  activeSettingMenu: activeSettingMenu,
  saveFavorite: saveFavorite,
  saveSetting: saveSetting
}
