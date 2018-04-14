var image = ""
var orig = ""
var trans = ""
var imageData = ""
var img = ""

 if ($app.env == $env.today) {
        var name = $addin.current.name
        $app.openURL("jsbox://run?name=" +encodeURI(name))
      }

var server = $cache.get("servers")
if(server){
  server = server.server
}else{
  server = "Youdao"
}


$ui.render({
  props: {
    title: "OCR & Translate"
  },
  views: [{
    type: "label",
    props: {
      id: "photoCbg",
      bgcolor: $color("#045cb4"),
      text:"Tap Me!",
      textColor: $color("#327ac3"),
      font: $font("bold",80),
      align: $align.center
    },
    layout: $layout.fill,
    views:[{
      type:"button",
      props:{
        id:"setBt",
        icon: $icon("002",$color("#04458e")),
        bgcolor: $color("clear"),
        hidden: false
      },
      layout: function(make, view){
        make.top.inset(10)
        make.right.inset(10)
      },
      events:{
        tapped: function(sender){
          servers()
        }
      }
    },{
      type:"text",
      props:{
        id:"textBg",
        bgcolor:$color("#045cb4"),
        textColor:$color("white"),
        hidden: true
      },
      layout: function(make, view){
        make.edges.insets($insets(40,10,10,10))
      },
      events: {
        didChange: function(sender){

        }
      }
    },{
      type:"button",
      props:{
        id:"copyBt",
        icon: $icon("019",$color("white")),
        bgcolor: $color("clear"),
        hidden: true
      },
      layout: function(make, view){
        make.top.inset(10)
        make.right.inset(10)
      },
      events:{
        tapped: function(sender){
          $clipboard.text = $("textBg").text
          $ui.alert("文本已复制")
        }
      }
    },{
      type:"button",
      props:{
        id:"transBt",
        icon: $icon("024",$color("white")),
        bgcolor: $color("clear"),
        hidden: true
      },
      layout: function(make, view){
        make.top.inset(10)
        make.right.equalTo($("copyBt").right).inset(35)
      },
      events:{
        tapped: function(sender){
          $("transBt").hidden = true
          $("origBt").hidden = false
          translate()
        }
      }
    },{
      type:"button",
      props:{
        id:"origBt",
        icon: $icon("021",$color("white")),
        bgcolor: $color("clear"),
        hidden: true
      },
      layout: function(make, view){
        make.top.inset(10)
        make.right.equalTo($("copyBt").right).inset(35)
      },
      events:{
        tapped: function(sender){
          $("textBg").text = orig
          $("transBt").hidden = false
          $("origBt").hidden = true
        }
      }
    },{
      type:"button",
      props:{
        id:"imgBt",
        icon: $icon("014",$color("white")),
        bgcolor: $color("clear"),
        hidden: true
      },
      layout: function(make, view){
        make.top.inset(10)
        make.right.equalTo($("transBt").right).inset(35)
      },
      events:{
        tapped: function(sender){
          $quicklook.open({
  image: image
  })
        }
      }
    }],
    events: {
      tapped: function(sender){
        picPick()
      }
    }
  }]
})


function picPick(){
  $photo.prompt({
    handler: function(resp) {
      image = resp.image    
      imageData = image.jpg(1.0)
      img = $text.base64Encode(imageData)
    ocr()
    }
  })
}

function servers(){
  $ui.menu({
    items: ["Baidu", "Sogou", "Youdao"],
    handler: function(title, idx) {
      $cache.set("servers", {"server":title})
      server = title
    }
  })
}

function ocr(){
  if(server == "Baidu"){
    baiduOcr()
  }else if(server == "Sogou"){
    sogouUpload()
  }else{
    youdaOcr()
  }
}



function sogouUpload(){
  $ui.toast("Sogou OCR")
  $ui.loading("Loading")
  $http.upload({
    url: "http://pic.sogou.com/pic/upload_pic.jsp",
    files: [{
      "image": image,
      "name": "pic_path",
      "filename": "test.jpeg",
    }], 
    handler: function(resp) {
      $ui.loading(false)
      var data = resp.data
      var imgUrl = $text.URLEncode(data)
      sogouOcr(imgUrl)
    }
  }) 
}

function sogouOcr(url){
  $ui.loading("Loading")
  $http.get({
    url: "http://pic.sogou.com/pic/ocr/ocrOnline.jsp?query="+ url,
    handler: function(resp) {
      $ui.loading(false)
      var data = resp.data.result
      for(i in data){
        orig = orig + data[i].content
      }
      results()
    }
  })
}

function baiduOcr (){
  $ui.toast("Baidu OCR")
  $ui.loading("Loading")
  $http.post({
    url:"https://cloud.baidu.com/aidemo",
    header:{
      "Content-Type":"application/x-www-form-urlencoded",
      "Referer": "https://cloud.baidu.com/product/ocr/general"
    },
    body:{
      "type": "commontext",
      "image": "data:image/png;base64,"+ img,
      "image_url":"" 
    },
    handler: function(resp){
      $ui.loading(false)
       var data = resp.data.data.words_result
       for(i in data){
        orig = orig + data[i].words + "\n"
       }
       results()
    }
  })
}

function youdaOcr() {
  $ui.toast("Youdao OCR")
  $ui.loading("Loading")
  $http.post({
    url: "http://fanyi.youdao.com/appapi/tranocr?language=unk&category=iphobe&imei=39bf9b1d15e30cd9729128706b5b3cd7&model=iPhone&mid=9.3.3&version=3.2.0&keyfrom=fanyi.3.2.0.iphone&vendor=AppStore",
    header: {
      "Content-Type": "text/plain"
    },
    body: img,
    handler: function(resp) {
      $ui.loading(false)
      var data = resp.data.tranRegions
      for (var i in data) {
        orig = orig + data[i].context + "\n"
      }
      results()
    }
  })
}
  
function results(){
  $("textBg").hidden = false
  $("copyBt").hidden = false
  $("transBt").hidden = false
  $("imgBt").hidden = false
  $("setBt").hidden = true
  $("textBg").text = orig
}

function translate() {
  $ui.loading("Translating...")
  var transLg = cnTest()
  $http.request({
    method: "POST",
    url: "http://translate.google.cn/translate_a/single",
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "dt": "t",
      "q": $("textBg").text,
      "tl": transLg,
      "ie": "UTF-8",
      "sl": "auto",
      "client": "ia",
      "dj": "1"
    },
    handler: function(resp) {
      $ui.loading(false)
      var data = resp.data.sentences
      var trans = ""
      for (var i in data) {
        var trans = trans + data[i].trans + "\n"
      }
      orig = $("textBg").text
      $("textBg").text = trans
    }
  })
}

function cnTest() {
  var cn = new RegExp("[\u4e00-\u9fa5]+")
  var slang = cn.test($("textBg").text)
  if (slang == 0) {
    translang = "zh-CN"
  } else {
    translang = "en-US"
  }
  return translang
}