const LANGUAGE = $app.info.locale.replace(/-.*$/, "")
const TEMPLATE_SETTING = [{
  type: "label",
  props: {
    id: "name",
    textColor: $color("darkGray")
  },
  layout: function(make) {
    make.left.inset(15)
    make.top.bottom.right.inset(0)
  }
}]
const REGION = [{
    title: $l10n("region_z0"),
    url: "https://up.qiniup.com"
  },
  {
    title: $l10n("region_z1"),
    url: "https://up-z1.qiniup.com"
  },
  {
    title: $l10n("region_z2"),
    url: "https://up-z2.qiniup.com"
  },
  {
    title: $l10n("region_na0"),
    url: "https://up-na0.qiniup.com"
  },
  {
    title: $l10n("region_as0"),
    url: "https://up-as0.qiniu.com"
  }
]

var _base =  require("scripts/base")
var _alert = require("scripts/alert")

function activeSettingMenu(indexPath) {
  var section = indexPath.section
  var row = indexPath.row
  var data
  if (section == 0) {
    switch (row) {
      case 0:
        $("SK").secure = $("SK").secure ? false : true
        break
      case 1:
        $("AK").secure = $("AK").secure ? false : true
        break
    }
  } else if (section == 1) {
    switch (row) {
      case 0:
        region()
        break
      case 1:
        actionBucket()
        break
      case 2:
        actionDomain()
        break
      case 3:
        $safari.open({
          url: "https://portal.qiniu.com/user/key"
        })
        break
    }
  } else if (section == 2) {
    switch (row) {
      case 0:
        $safari.open({
          url: "https://www.ryannn.com"
        })
        break
      case 1:
        if (LANGUAGE == "zh") actionTutorialZH()
        else actionTutorial()
        break
      case 2:
        actionCheck()
        break
    }
  }
}

function saveSetting(section, row, value) {
  // Update Value
  SETTING_FILE[section][row] = value
  $file.write({
    data: $data({ string: JSON.stringify(SETTING_FILE) }),
    path: "Setting.conf"
  })
}

/*
 * Setting sub-functions
 */
function region() {
  $ui.push({
    props: {
      title: $l10n("region")
    },
    views: [{
      type: "list",
      props: {
        id: "list_region",
        rowHeight: 50,
        scrollEnabled: false,
        template: TEMPLATE_SETTING,
        data: REGION.map(function(d) {
          return {
            name: {
              text: d.title
            }
          }
        })
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath) {
          var cell = sender.cell(indexPath).runtimeValue()
          var selected = cell.invoke("accessoryType")
          if (selected === 0) {
            // Save Setting
            saveSetting(1, 0, REGION[indexPath.row].url)
          }
          $ui.pop()
        }
      }
    }]
  })

  $delay(0.1, function() {
    var list = $("list_region")
    for (var i in REGION) {
      if (SETTING_FILE[1][0] === REGION[i].url) {
        list.cell($indexPath(0, i)).runtimeValue().invoke("setAccessoryType", 3)
        break
      }
    }
  })
}

function bucket(data) {
  $ui.push({
    props: {
      title: $l10n("bucket")
    },
    views: [{
      type: "list",
      props: {
        id: "list_bucket",
        rowHeight: 50,
        scrollEnabled: false,
        template: TEMPLATE_SETTING,
        data: data.map(function(d) {
          return {
            name: {
              text: d
            }
          }
        })
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath) {
          var cell = sender.cell(indexPath).runtimeValue()
          var selected = cell.invoke("accessoryType")
          if (selected === 0) {
            // Save Setting
            saveSetting(1, 1, data[indexPath.row])
          }
          $ui.pop()
        }
      }
    }]
  })

  $delay(0.1, function() {
    var list = $("list_bucket")
    for (var i in data) {
      if (SETTING_FILE[1][1] === data[i]) {
        list.cell($indexPath(0, i)).runtimeValue().invoke("setAccessoryType", 3)
        break
      }
    }
  })
}

function domain(data) {
  $ui.push({
    props: {
      title: $l10n("domain")
    },
    views: [{
      type: "list",
      props: {
        id: "list_domain",
        rowHeight: 50,
        scrollEnabled: false,
        template: TEMPLATE_SETTING,
        data: data.map(function(d) {
          return {
            name: {
              text: d
            }
          }
        })
      },
      layout: $layout.fill,
      events: {
        didSelect: function(sender, indexPath) {
          var cell = sender.cell(indexPath).runtimeValue()
          var selected = cell.invoke("accessoryType")
          if (selected === 0) {
            // Save Setting
            saveSetting(1, 2, data[indexPath.row])
            URL_SELF = (SETTING_FILE[1][2].indexOf("bkt.clouddn.com") === -1 ? "https://" : "http://") + SETTING_FILE[1][2] + "/"
          }
          $ui.pop()
        }
      }
    }]
  })

  $delay(0.1, function() {
    var list = $("list_domain")
    for (var i in data) {
      if (SETTING_FILE[1][2] === data[i]) {
        list.cell($indexPath(0, i)).runtimeValue().invoke("setAccessoryType", 3)
        break
      }
    }
  })
}

function actionTutorial() {
  var text = "Tips\n- You should frist fill in the blanks of SK and AK.\n- Then Bucket and Domain will be set as default (the frist one), you may need to rechoose them on your own.\n- Carefully choose the Region which matches your bucket.\n- Tap the extension bar button on the top-right corner to search files with prefix or sort files."

  // Views
  var hintView = $objc("BaseHintView").invoke("alloc.initWithText", text)
  var textView = hintView.invoke("subviews.objectAtIndex", 1).invoke("subviews.objectAtIndex", 1)

  // Attribute for text
  var string = $objc("NSMutableAttributedString").invoke("alloc.initWithString", text)
  string.invoke("addAttribute:value:range:", "NSFont", $font("bold", 26), $range(0, 4))
  string.invoke("setAlignment:range:", $align.center, $range(0, 4))

  string.invoke("addAttribute:value:range:", "NSFont", textView.invoke("font"), $range(4, string.invoke("length") - 4))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("SK"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("AK"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Bucket"), 6))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Domain"), 6))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("Region"), 6))

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
  var text = "提示\n- 先完成填写 SK 与 AK；\n- 而后存储空间和空间域名将会设置为默认选项(第一个)，建议检查默认选项并自行重新选择；\n- 根据所选空间仔细选择与存储空间相匹配的存储区域；\n- 点击右上角扩展按钮以搜索文件名含前缀的文件或对文件排序。"

  // Views
  var hintView = $objc("BaseHintView").invoke("alloc.initWithText", text)
  var textView = hintView.invoke("subviews.objectAtIndex", 1).invoke("subviews.objectAtIndex", 1)

  // Attribute for text
  var string = $objc("NSMutableAttributedString").invoke("alloc.initWithString", text)
  string.invoke("addAttribute:value:range:", "NSFont", $font("bold", 26), $range(0, 2))
  string.invoke("setAlignment:range:", $align.center, $range(0, 2))

  string.invoke("addAttribute:value:range:", "NSFont", textView.invoke("font"), $range(2, string.invoke("length") - 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("SK"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("AK"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("存储空间"), 4))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("空间域名"), 4))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("存储区域"), 4))

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
  var url = "https://api.ryannn.com/update?query=qiniu_manager"
  $http.get({
    url: url,
    handler: function(resp) {
      $ui.loading(false)
      var data = LANGUAGE == "zh" ? resp.data.zh : resp.data.en
      var currentVer = $addin.current.version
      var cv = currentVer.split(".").map(function(i) { return parseInt(i) })
      var newVer = data.version
      var nv = newVer.split(".").map(function(i) { return parseInt(i) })

      if (nv[0] > cv[0] || (nv[0] == cv[0] && nv[1] > cv[1])) {
        $ui.alert({
          title: $l10n("alert_title_new") + " " + newVer,
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
        $ui.toast($l10n("toast_uptodate"))
      }
    }
  })
}

function replaceAddin(ver) {
  var current = $addin.current
  $http.download({
    url: "https://olx97w61o.qnssl.com/Qiniu-Manager.box",
    handler: function(resp) {
      $addin.save({
        name: current.name,
        version: ver,
        author: "Ryan",
        icon: current.icon,
        types: 5,
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

/*
 * HTTP requests
 */
function getDefaultSetting() {
  var path = "/buckets"
  var token = _base.authManage(path)
  var url = "http://rs.qiniu.com" + path
  var host = "rs.qbox.me"
  $ui.loading(true)
  $http.get({
    url: url,
    header: {
      "Host": host,
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "QBox " + token
    },
    handler: function(resp) {
      $ui.loading(false)
      var code = resp.response.statusCode
      if (200 === code) {
        var data = resp.data
        saveSetting(1, 1, data[0])

        var path = "/v6/domain/list?tbl=" + SETTING_FILE[1][1]
        var token = _base.authManage(path)
        var url = "http://rs.qiniu.com" + path
        var host = "api.qiniu.com"
        $ui.loading(true)
        $http.get({
          url: url,
          header: {
            "Host": host,
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "QBox " + token
          },
          handler: function(resp) {
            $ui.loading(false)
            var code = resp.response.statusCode
            if (200 === code) {
              var data = resp.data
              saveSetting(1, 2, data[0])
              $ui.alert({
                title: $l10n("alert_title_default"),
                message: $l10n("alert_message_default")
              })
            } else {
              _alert.error(code, resp.data.error)
            }
          }
        })
      } else {
        _alert.error(code, resp.data.error)
      }
    }
  })
}

function actionBucket() {
  var path = "/buckets"
  var token = _base.authManage(path)
  var url = "http://rs.qiniu.com" + path
  var host = "rs.qbox.me"
  _base.get(token, url, host, function(data) {
    bucket(data)
  })
}

function actionDomain() {
  var path = "/v6/domain/list?tbl=" + SETTING_FILE[1][1]
  var token = _base.authManage(path)
  var url = "http://rs.qiniu.com" + path
  var host = "api.qiniu.com"
  _base.get(token, url, host, function(data) {
    domain(data)
  })
}

module.exports = {
  save: saveSetting,
  activeMenu: activeSettingMenu,
  defaultSetting: getDefaultSetting
}
