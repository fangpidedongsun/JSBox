function activeMenu(index) {
  const trans = ["recent", "favorite", "setting"]
  var dstViewId = trans[index]
  if (dstViewId == "setting" && SETTING == 0) {
    // Notify file missing
    $device.taptic(1)
    saveSettingAsDefault()
  }

  var viewId = $("content").views.filter(function(x) {
    return x.hidden == false
  })[0].info
  if (dstViewId == viewId) {
    var subViewId = $(viewId + "_list").views.filter(function(x) {
      return x.hidden == false
    })[0]
    if (subViewId.info == "search") {
      $(dstViewId + "_keyword").focus()
    } else {
      if (subViewId.data.length === 0) return
      subViewId.scrollTo({
        indexPath: $indexPath(0, 0)
      })
    }
  } else {
    var color = $color(SETTING_FILE[0][5])
    for (var i = 0; i < 3; i++) {
      $("menu").cell($indexPath(0, i)).views[0].views[0].tintColor = index == i ? color : $color("lightGray")
      $("menu").cell($indexPath(0, i)).views[0].views[1].textColor = index == i ? color : $color("lightGray")
    }
    $(viewId).hidden = true
    $(dstViewId).hidden = false
  }
}

function activeSegment(index) {
  const trans = ["recent", "favorite", "setting"]
  var dstViewId = trans[index]
  if (dstViewId == "setting") {
    return
  }

  var viewId = $("content").views.filter(function(x) {
    return x.hidden == false
  })[0].info

  if (dstViewId == viewId) {
    $device.taptic(0)
    var subViewId = $(viewId + "_list").views.filter(function(x) {
      return x.hidden == false
    })[0]
    subViewId.hidden = true
    if (typeof(subViewId.next) != "undefined") {
      $(viewId + "_bar").index += 1
      subViewId.next.hidden = false
    } else {
      $(viewId + "_bar").index = 0
      subViewId.super.views[0].hidden = false
    }
  }
}

function customTosat(message, error = false) {
  if ($("toast")) {
    $("toast").remove()
  }
  
  $ui.window.add({
    type: "view",
    props: {
      id: "toast"
    },
    layout: function(make, view) {
      make.height.equalTo(50)
      make.centerX.equalTo()
      make.left.right.inset(0)
      if ($device.isIphonePlus && $app.env == $env.app)
        make.top.equalTo(view.super.safeAreaTop).offset(-50)
      else
        make.top.equalTo(view.super.top).offset(-50)
      shadowView(view)
    },
    views: [{
      type: "label",
      props: {
        text: `${message}      `,
        font: $font("PingFangSC-Medium", 16),
        bgcolor: error ? $color("#EF454A") : $color("tint"),
        textColor: error ? $color("white") : $color("white"),
        align: $align.center,
        circular: true
      },
      layout: function(make) {
        make.height.equalTo(35)
        make.width.greaterThanOrEqualTo(150)
        make.width.lessThanOrEqualTo(JSBox.device.info.screen.width - 30)
        make.centerX.equalTo()
        make.centerY.equalTo()
      }
    }],
    events: {
      ready: function(view) {
        $delay(0.0, function() {
          toggleToast(view, true, function() {
            toggleToast(view, false, function() {
              view.remove()
            })
          })
        })
      }
    }
  })
  
  if (error) haptic(2)
}

function toggleToast(view, show = true, completetion = null) {
  var inset = show ? 20 : -50
  var delay = show ? 0.0 : 1.5
  var damping = show ? 0.6 : 1.0
  var alpha = show ? 1.0 : 0.0
  
  view.updateLayout(function(make) {
    if ($device.isIphonePlus && $app.env == $env.app)
      make.top.equalTo(view.super.safeAreaTop).offset(inset)
    else
      make.top.equalTo(view.super.top).offset(inset)
  })
  
  $ui.animate({
    duration: 0.5,
    delay: delay,
    damping: damping,
    animation: function() {
      view.relayout()
      view.alpha = alpha
    },
    completion: function() {
      if (completetion) completetion()
    }
  })
}

function saveSettingAsDefault() {
  var path = SETTING_FILE[1][0]
  SETTING = $file.write({
    data: $data({ string: JSON.stringify(DEFAULT_SETTING) }),
    path: path + "Setting.conf"
  })
}

function haptic(type) {
  let haptic = $objc("UINotificationFeedbackGenerator").invoke("new")
  haptic.$notificationOccurred(type)
}

function shadowView(view, alpha = 0.8) {
  var layer = view.runtimeValue().invoke("layer")

  layer.invoke("setMasksToBounds", true)
  layer.invoke("setCornerRadius", 15)
  layer.invoke("setShadowOffset", $size(0, 0))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", alpha)
  layer.invoke("setShadowRadius", 3)
}

module.exports = {
  activeMenu: activeMenu,
  activeSegment: activeSegment,
  toast: customTosat
}
