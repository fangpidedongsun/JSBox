var languageKv = { "ar-SA": "ar", "cs-CZ": "cs", "da-DK": "da", "de-DE": "de", "el-GR": "el", "en-US": "en", "en-AU": "en", "en-GB": "en", "en-IE": "en", "en-ZA": "en", "es-ES": "es", "es-MX": "es", "fi-FI": "fi", "fr-CA": "fr", "fr-FR": "fr", "he-IL": "he", "hi-IN": "hi", "hu-HU": "hu", "id-ID": "id", "it-IT": "it", "ja-JP": "ja", "ko-KR": "ko", "nl-BE": "nl", "nl-NL": "nl", "no-NO": "no", "pl-PL": "pl", "pt-BR": "pt", "pt-PT": "pt", "ro-RO": "ro", "ru-RU": "ru", "sk-SK": "sk", "sv-SE": "sv", "th-TH": "th", "tr-TR": "tr", "zh-CN": "zh-CN", "zh-HK": "zh-HK", "zh-TW": "zh-TW" }

var transClang = Object.keys(languageKv)
var addAuto = ["auto"]
var origClang = addAuto.concat(transClang)

var origLg
var transLg

var UISet = $cache.get("UISets")

if(UISet){
  var isize = UISet.isize
  var setHeight = UISet.setHeight
  var setHBt = UISet.setHBt
}else{
  var isize = 20
  var setHeight = 50
  var setHBt = 20
}


$ui.render({
  props: {
    id: "mainView",
    title: "Google Translate"
  },
  views: [{
    type: "view",
    props: {
      id: "origBg",
      bgcolor: $color("white")
    },
    layout: function(make, view) {
      make.top.left.right.inset(0)
    },
    views: [{
      type: "text",
      props: {
        id: "origTextbg",
        bgcolor: $color("white")
      },

      layout: function(make, view) {
        make.edges.insets($insets(10, 10, 35, 35))
      },
      events: {
        didChange: function(sender) {
          if ($app.env == $env.app) {
            translate()
          }
        }
      }
    }, {
      type: "button",
      props: {
        id: "textClearbt",
        icon: $icon("021", $color("gray"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.right.inset(10)
      },
      events: {
        tapped: function(sender) {
          closeKybd()
          $("origTextbg").text = ""
        }
      }
    }, {
      type: "button",
      props: {
        id: "origSpeechbt",
        icon: $icon("012", $color("gray"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(10)
        make.left.inset(10)
      },
      events: {
        tapped: function(sender) {
          speechText($("origTextbg").text, $("origLgbt").title)
        }
      }
    }],
    events: {
      tapped: function(sender) {
        closeKybd()
      }
    }
  }, {
    type: "view",
    props: {
      id: "transBg",
      bgcolor: $color("#4484f4")
    },
    layout: function(make, view) {
      make.top.equalTo($("origBg").bottom).offset(0)
      make.left.right.inset(0)
    },
    views: [{
      type: "text",
      props: {
        id: "transTextbg",
        bgcolor: $color("#4484f4"),
        textColor: $color("white")
      },
      layout: function(make, view) {
        make.edges.insets($insets(10, 10, 35, 35))
      },
      events: {
        didBeginEditing: function(sender) {

        }
      }
    }, {
      type: "button",
      props: {
        id: "tranSpeechbt",
        icon: $icon("012", $color("white"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(10)
        make.left.inset(10)
      },
      events: {
        tapped: function(sender) {
          speechText($("transTextbg").text, $("transLgbt").title)
        }
      }
    }, {
      type: "button",
      props: {
        id: "transCopybt",
        icon: $icon("019", $color("white"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(10)
        make.right.inset(20)
      },
      events: {
        tapped: function(sender) {
          closeKybd()
          $clipboard.text = $("transTextbg").text
          $ui.alert("Translation Copied")
        }
      }
    }, {
      type: "button",
      props: {
        id: "transTextbt",
        icon: $icon("023", $color("white"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(10)
        make.right.equalTo($("transCopybt").left).inset(20)
      },
      events: {
        tapped: function(sender) {
          closeKybd()
          translate()
        }
      }
    }, {
      type: "button",
      props: {
        id: "switchLgbt",
        icon: $icon("162", $color("white"),$size(isize, isize)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(10)
        make.centerX.equalTo(view.super.centerX)
      },
      events: {
        tapped: function(sender) {
          closeKybd()
          var switchLg = $("origLgbt").title
          $("origLgbt").title = $("transLgbt").title
          $("transLgbt").title = switchLg
          var switchText = $("origTextbg").text
          $("origTextbg").text = $("transTextbg").text
          $("transTextbg").text = switchText
          var switchTextlg = origLg
          origLg = transLg
          transLg = switchTextlg
        }
      }
    }, {
      type: "button",
      props: {
        id: "origLgbt",
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(5)
        make.right.equalTo($("switchLgbt").left).inset(10)
      },
      events: {
        tapped: function(sender) {
          langpick("origswitch")
        }
      }
    }, {
      type: "button",
      props: {
        id: "transLgbt",
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.bottom.inset(5)
        make.left.equalTo($("switchLgbt").right).inset(10)
      },
      events: {
        tapped: function(sender) {
          langpick("transwitch")
        }
      }
    }],
      events: {
        tapped: function(sender) {
          closeKybd()
        }
      }
    },{
      type: "blur",
      props: {
        id: "setBg",
        bgcolor: $color("#4484f4"),
        style: 5,
        hidden: true
      },
      layout: function(make, view) {
        make.bottom.inset(0)
        make.height.equalTo(setHeight)
        make.width.equalTo(view.super.width)
      },
      views: [{
        type: "button",
        props: {
          id: "setBt",
          icon: $icon("002", $color("gray"),$size(setHBt, setHBt)),
          bgcolor: $color("clear")
        },
        layout: function(make, view) {
          make.center.equalTo(view.super)
        },
        events:{
          tapped: function (sender){
            $("origTextbg").text = ""
            $("transTextbg").text = ""
            $ui.alert("请勿长按滑动键或调至很小"+"\n"+"点击任意地方保存设置")
            setbar() 
          }
        }
      }]
    },{
    type: "view",
    props: {
      id: "sliderBg",
      bgcolor: $color("clear"),
      hidden: true
    },
    layout: $layout.fill,
    views: [{
      type: "slider",
      props: {
        id: "iconSlider",
        value: "0.5",
        max: 1.0,
        min: 0.0,
        minColor: $color("white")
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.width.equalTo(300)
      },
      events: {
        changed: function(sender) {
          isizeSet(sender.value)
        }
      }
    }, {
      type: "label",
      props: {
        text: "icon",
        textColor: $color("white"),
        align: $align.center
      },
      layout: function(make, view) {
        make.top.equalTo($("iconSlider").bottom).inset(10)
        make.centerX.equalTo(view.super)
      }
    }, {
      type: "slider",
      props: {
        id: "setSlider",
        value: "0.5",
        max: 1.0,
        min: 0.0,
        minColor: $color("white")
      },
      layout: function(make, view) {
        make.top.equalTo($("iconSlider").bottom).inset(100)
        make.centerX.equalTo(view.super)
        make.width.equalTo(300)
      },
      events: {
        changed: function(sender) {
          barSet(sender.value)
        }
      }
    }, {
      type: "label",
      props: {
        text: "Setting Bar",
        textColor: $color("white"),
        align: $align.center
      },
      layout: function(make, view) {
        make.top.equalTo($("setSlider").bottom).inset(10)
        make.centerX.equalTo(view.super)
      }
    }],
    events:{
      tapped: function(sender){
          $cache.set("UISets",{
            "isize" : isize,
            "setHeight":setHeight,
            "setHBt": setHBt
          })
          $("sliderBg").hidden = true
      }
    }
  }]
})



if ($app.env == $env.app) {
  var heightSets = $cache.get("heightSet")
  if (heightSets) {
    $("setBg").hidden = false
    var halfHeight = setHeight / 2
    var bgHeight = heightSets.height / 2 - halfHeight
    $("origBg").updateLayout(function(make, view) {
      make.height.equalTo(bgHeight)
    })
    $("transBg").updateLayout(function(make, view) {
      make.height.equalTo(bgHeight)
    })
  } else {
    dViewHeight()
  }
} else {
  dViewHeight()
}

function setbar(){
  $("sliderBg").hidden = false
}



function isizeSet(ratio){
   isize = ratio * 40
  $("textClearbt").icon = $icon("021", $color("gray"),$size(isize, isize))
          $("origSpeechbt").icon = $icon("012", $color("gray"),$size(isize, isize))
          $("tranSpeechbt").icon = $icon("012", $color("white"),$size(isize, isize))
          $("transCopybt").icon = $icon("019", $color("white"),$size(isize, isize))
          $("transTextbt").icon = $icon("023", $color("white"),$size(isize, isize))
          $("switchLgbt").icon = $icon("162", $color("white"),$size(isize, isize))
}

function barSet(ratio){
   setHeight = ratio * 100
   setHBt = ratio * 40
  var bgHeight = heightSets.height / 2 - setHeight/2
  $("setBg").updateLayout(function(make) {
    make.height.equalTo(setHeight)
  })
  $("origBg").updateLayout(function(make) {
    make.height.equalTo(bgHeight)
  })
  $("transBg").updateLayout(function(make) {
    make.height.equalTo(bgHeight)
  })
  $("setBt").icon = $icon("002", $color("gray"),$size(setHBt, setHBt))

}


function dViewHeight() {
  $("origBg").updateLayout(function(make, view) {
    make.height.equalTo(view.super.height).dividedBy(2)
  })
  $("transBg").updateLayout(function(make, view) {
    make.height.equalTo(view.super.height).dividedBy(2)
  })
}

function cnTest() {
  var cn = new RegExp("[\u4e00-\u9fa5]+")
  var slang = cn.test($("origTextbg").text)
  if (slang == 0) {
    translang = "zh-CN"
  } else {
    translang = "en-US"
  }
  return translang
}

if ($clipboard.text) {
  $("origTextbg").text = $clipboard.text
  origLg = "auto"
  transLg = cnTest()
  translate()
} else {
  $("origLgbt").title = "en-US"
  $("transLgbt").title = "zh-CN"
  origLg = "en-US"
  transLg = "zh-CN"
}

function closeKybd() {
  $("origTextbg").blur()
  $("transTextbg").blur()
}

function speechText(txt, lang) {
  closeKybd()
  $text.speech({
    text: txt,
    rate: 0.5,
    language: lang
  })
}

function translate() {
  $ui.loading("Translating...")
  $http.request({
    method: "POST",
    url: "http://translate.google.cn/translate_a/single",
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "dt": "t",
      "q": $("origTextbg").text,
      "tl": transLg,
      "ie": "UTF-8",
      "sl": origLg,
      "client": "ia",
      "dj": "1"
    },
    handler: function(resp) {
      $ui.loading(false)
      var heightSets = $cache.get("heightSet")
      if (!heightSets) {
        var bgHeight = $("origBg").frame.height * 2
        $cache.set("heightSet", {
          "height": bgHeight
        })
      }
      var data = resp.data.sentences
      var orig = ""
      var trans = ""
      for (var i in data) {
        var orig = orig + data[i].orig + "\n"
        var trans = trans + data[i].trans + "\n"
      }
      var src = resp.data.src || data.src
      if (src == "en" || src == "es" || src == "fr" || src == "nl" || src == "pt") {
        if (origLg == "auto") {
          $("origLgbt").title = getKeyByValue(src)
          origLg = $("origLgbt").title
        }
      } else {
        $("origLgbt").title = getKeyByValue(src)
        origLg = $("origLgbt").title
      }
      $("transTextbg").text = trans
      $("transLgbt").title = transLg
    }
  })
}

function langpick(bt) {
  if ($app.env == $env.today) {
    $cache.set("bt", bt)
    $cache.set("today", true)
    var name = $addin.current.name
    $app.openURL("jsbox://run?name=" + encodeURI(name))
    return
  }
  closeKybd()
  if (bt == "origswitch") {
    var langItems = origClang
  } else {
    var langItems = transClang
  }
  $pick.data({
    props: {
      items: [langItems]
    },
    handler: function(data) {
      if (bt == "origswitch") {
        $("origLgbt").title = data[0]
        origLg = data[0]
      } else {
        $("transLgbt").title = data[0]
        transLg = data[0]
      }
    }
  })
}

function getKeyByValue(value) {
  for (var i in languageKv) {
    if (languageKv[i] === value) {
      return i;
    }
  }
}

$app.tips("首次运行请在app内运行，翻译任意内容一次后，重新运行脚本即可出现设置栏"+"\n"+"\n"+"如首次在 Widget 下运行，请进入脚本编辑页面，并点击下方设置并清除缓存后重新在app内运行")