
var language = ["ar-SA","cs-CZ","da-DK","de-DE","el-GR","en-AU","en-GB","en-IE","en-US","en-ZA","es-ES","es-MX","fi-FI","fr-CA","fr-FR","he-IL","hi-IN","hu-HU","id-ID","it-IT","ja-JP","ko-KR","nl-BE","nl-NL","no-NO","pl-PL","pt-BR","pt-PT","ro-RO","ru-RU","sk-SK","sv-SE","th-TH","tr-TR","zh-CN","zh-HK","zh-TW"]

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
        layout: function(make,view) {
            make.height.equalTo(view.super.height).dividedBy(2)
            make.top.left.right.inset(0)
        },
        views: [{
            type: "text",
            props: {
                id: "origTextbg",
                bgcolor: $color("white")
            },
            layout: function(make, view) {
                make.edges.insets($insets(10,10,35,35))
            },
            events: {
                didBeginEditing: function(sender) {

                }
            }
        },{
            type: "button",
            props: {
                id: "textClearbt",
                icon: $icon("021", $color("gray")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.top.inset(10)
                make.right.inset(10)
            },
            events:{
                tapped: function(sender) {
                    closeKybd()
                    $("origTextbg").text = ""
                }
            }
        },{
            type: "button",
            props: {
                id: "origSpeechbt",
                icon: $icon("012", $color("gray")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(10)
                make.left.inset(10)
            },
            events:{
                tapped: function(sender) {
                    speechText($("origTextbg").text, $("origLgbt").title)
                }
            }
        }],
        events:{
            tapped:function(sender){
                closeKybd()
            }
        }
    },{
        type: "view",
        props: {
            id: "transBg",
            bgcolor: $color("#4484f4")
        },
        layout: function(make,view) {
            make.height.equalTo(view.super.height).dividedBy(2)
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
                make.edges.insets($insets(10,10,35,35))
            },
            events: {
                didBeginEditing: function(sender) {

                }
            }
        },{
            type: "button",
            props: {
                id: "transSpeechbt",
                icon: $icon("012", $color("white")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(10)
                make.left.inset(10)
            },
            events:{
                tapped: function(sender) {
                    speechText($("transTextbg").text,$("transLgbt").title)
                }
            }
        },{
            type: "button",
            props: {
                id: "transCopybt",
                icon: $icon("019", $color("white")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(10)
                make.right.inset(20)
            },
            events:{
                tapped: function(sender) {
                    closeKybd()
                    $clipboard.text = $("transTextbg").text
                    $ui.alert("Translation Copied")
                }
            }
        },{
            type: "button",
            props: {
                id: "transTextbt",
                icon: $icon("023", $color("white")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(10)
                make.right.equalTo($("transCopybt").left).inset(20)
            },
            events:{
                tapped: function(sender) {
                    closeKybd()
                    translate()
                }
            }
        },{
            type: "button",
            props: {
                id: "switchLgbt",
                icon: $icon("162", $color("white")),
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(10)
                make.centerX.equalTo(view.super.centerX)
            },
            events:{
                tapped: function(sender) {
                    closeKybd()
                    var switchLg =  $("origLgbt").title
                    $("origLgbt").title = $("transLgbt").title
                    $("transLgbt").title = switchLg
                    var switchText = $("origTextbg").text
                    $("origTextbg").text = $("transTextbg").text
                    $("transTextbg").text = switchText
                }
            }
        },{
            type: "button",
            props: {
                id: "origLgbt",
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(5)
                make.right.equalTo($("switchLgbt").left).inset(10)
            },
            events:{
                tapped: function(sender) {
                    langpick("origswitch")
                }
            }
        },{
            type: "button",
            props: {
                id: "transLgbt",
                bgcolor: $color("clear")
            },
            layout: function(make, view){
                make.bottom.inset(5)
                make.left.equalTo($("switchLgbt").right).inset(10)
            },
            events:{
                tapped: function(sender) {
                    langpick("transwitch")
                }
            }
        }],
        events:{
            tapped:function(sender){
                closeKybd()
            }
        }
    }]
})


function cnTest(){
    var cn = new RegExp("[\u4e00-\u9fa5]+")
    var slang = cn.test($("origTextbg").text)
    if (slang == 0) {
        translang = "zh-CN"
    } else {
        translang = "en-US"
    }
    return translang
}

if($clipboard.text){
    $("origTextbg").text = $clipboard.text
    $("transLgbt").title = cnTest()
    $("origLgbt").title = "auto"
    translate()
}else{
    $("origLgbt").title = "en-US"
    $("transLgbt").title = "zh-CN"
}

function closeKybd(){
    $("origTextbg").blur()
    $("transTextbg").blur()
}

function speechText(txt, lang){
    closeKybd()
    if(lang == "en"){
        lang = "en-US"
    }
    $text.speech({
        text: txt,
        rate: 0.5,
        language: lang
      })
}

function translate() {
    $ui.loading("Translating...")
  $http.request({
    method: "POSt",
    url: "http://translate.google.cn/translate_a/single",
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "dt": "t",
      "q": $("origTextbg").text,
      "tl": $("transLgbt").title,
      "ie": "UTF-8",
      "sl": $("origLgbt").title,
      "client": "ia",
      "dj": "1"
    },
    handler: function(resp) {
        $ui.loading(false)
      var data = resp.data.sentences
      var orig = ""
      var trans = ""
      for (var i in data) {
        var orig = orig + data[i].orig + "\n"
        var trans = trans + data[i].trans + "\n"
      }
      $("origLgbt").title = resp.data.src||data.src
      $("origTextbg").text = orig
      $("transTextbg").text = trans
    }
  })
}

function langpick(bt){
    closeKybd()
    $pick.data({
        props: {
          items: [language]
        },
        handler: function(data) {
            if(bt == "origswitch"){
                $("origLgbt").title = data[0]
            }else{
                $("transLgbt").title = data[0]
            }
        }
      })
}

