
// Supported Sites: https://www.online-downloader.com/Supported-Sites
// power by https://www.online-downloader.com/

$app.strings = {
  "en": {
    "alert": "Please Copy Video Link Frist",
    "copyLink": "Download Link Copied",
    "invalid": "Invalid or unsupported video link",
    "analysing": "Analysing...",
    "analysis-failed": "Analysis failed",
    "downloading": "Downloading...",
    "didSelect":"Please swipe left to download or copy download link"
  },
  "zh-Hans": {
    "alert": "请先复制视频地址后运行该脚本",
    "copyLink": "下载链接已复制",
    "invalid":"无效的或不支持的视频链接",
    "analysing": "解析中...",
    "analysis-failed": "解析失败",
    "downloading": "下载中...",
    "didSelect":"请侧滑下载或复制下载链接"
  }
}


if ($app.env == $env.today) {
  let name = $addin.current.name.split(".js")
  $app.openURL("jsbox://run?name=" + $text.URLEncode(name[0]))
}

var videoUrl = $context.safari ? $context.safari.items.location.href : $context.link || $clipboard.text
if (videoUrl) {
  if (videoUrl.indexOf("twitter.com") != -1) {
    twitterDl()
  } else {
    videoParser()
  }
} else {
  alert($l10n("alert"))
}


function videoParser() {
  $ui.loading(true)
  $http.get({
    url: 'https://www.online-downloader.com/DL/dd.php?videourl=' + videoUrl,
    handler: function (resp) {
      $ui.loading(false)
      var data = resp.data
      data = data.replace(/\({/, "{")
      data = data.replace(/}\)/, "}")
      data = JSON.parse(data)
      if(data.Video_DownloadURL == null){
        alert($l10n("invalid"))
      }else{
        mainView(data)
      }
      
    }
  })
}

function mainView(data) {
  var rowsData = ["Recommended Quality"]
  for (var i = 1; i <= data.Video_Format_Count; i++) {
    rowsData.push(data["Video_" + i + "_WH"] + " - " + data["Video_" + i + "_Format_Note"] + "." + data["Video_" + i + "_Ext"] + "  ( " + data["Video_" + i + "_File_Size"] + ")")
  }
  $ui.render({
    props: {
      title: ""
    },
    views: [{
      type: "video",
      props: {
        src: data.Video_DownloadURL,
        poster: data.Video_Image
      },
      layout: function (make, view) {
        make.left.right.top.inset(0)
        make.height.equalTo(256)
      }
    }, {
      type: "list",
      props: {
        data: [
          {
            title: data.Video_Title,
            rows: rowsData
          }
        ],
        footer: {
          type: "label",
          props: {
            height: 20,
            text: "Online Downloader by Neurogram",
            textColor: $color("#AAAAAA"),
            align: $align.center,
            font: $font(12)
          }
        },
        actions: [
          {
            title: "Download",
            color: $color("red"),
            handler: function (sender, indexPath) {
              copyDL(data, indexPath.row, "dl")
            }
          },
          {
            title: "Copy",
            color: $color("gray"),
            handler: function (sender, indexPath) {
              copyDL(data, indexPath.row, "copy")
            }
          }
        ]
      },
      layout: function (make, view) {
        make.edges.insets($insets(256, 0, 0, 0))
      },
      events:{
        didSelect: function(sender, indexPath, data) {
          alert($l10n("didSelect"))
        }
      }
    },
    {
      type: "web",
      props: {
        id: "hackView",
        url: "http://tool.uixsj.cn/hack-html5/",
        hidden: true
      },
      views: [{
        type: "label",
        props: {
          id: "progressLabel",
          textColor: $color("green"),
          align: $align.center
        },
        layout: function (make, view) {
          make.bottom.inset(10)
          make.centerX.equalTo(view.super.centerX)
        }
      }],
      layout: $layout.fill
    }
    ]
  })
}


function copyDL(data, row, type) {
  if (row == 0) {
    var url = data.Video_DownloadURL
  } else {
    var url = data["Video_" + row + "_Url"]
  }
  if (type == "dl") {
    $("hackView").hidden = false
    $http.download({
      url: url,
      progress: function (bytesWritten, totalBytes) {
        $("progressLabel").text = bytesWritten + " / " + totalBytes
      },
      handler: function (resp) {
        $("hackView").hidden = true
        $share.sheet(resp.data)
      }
    })
  } else {
    $clipboard.text = url
    alert($l10n("copyLink"))
  }
}



function twitterDl() {

  var found = false

  $ui.loading(true)
  $ui.toast($l10n("analysing"))

  $ui.create({
    type: "web",
    props: {
      hidden: true,
      url: "http://twittervideodownloader.com/",
      script: function () {
        var finished = false
        var worker = function () {
          var elements = document.getElementsByClassName("expanded button small float-right") || []
          if (elements.length > 0 && !finished) {
            var items = []
            for (var i = 0; i < elements.length; ++i) {
              var element = elements[i]
              var title = element.parentElement.parentElement.getElementsByClassName("float-left")[0].innerText
              items.push({ title: title, url: element.href })
            }
            $notify("showMenu", { items: items })
            clearInterval(timer)
            finished = true
          }
        }
        worker()
        var timer = setInterval(worker, 500)
      }
    },
    layout: $layout.fill,
    events: {
      didFinish: function (sender) {
        var script = "document.getElementsByClassName('input-group-field')[0].value='" + videoUrl + "';document.querySelector('.button[type=submit]').click();"
        sender.eval({ script: script })
      },
      showMenu: function (info) {
        found = true
        $ui.loading(false)
        $ui.menu({
          items: info.items.map(function (item) { return item.title }),
          handler: function (title, idx) {
            download(info.items[idx].url)
          }
        })
      }
    }
  })

  function download(url) {
    $ui.loading(true)
    $ui.toast($l10n("downloading"))
    $http.download({
      url: url,
      handler: function (resp) {
        $ui.loading(false)
        $share.sheet(resp.data)
      }
    })
  }

  $thread.main({
    delay: 30,
    handler: function () {
      $ui.loading(false)
      if (!found) {
        $ui.toast($l10n("analysis-failed"))
      }
    }
  })
}