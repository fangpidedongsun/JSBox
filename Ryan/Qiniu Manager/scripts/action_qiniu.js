var _base = require("scripts/base")

String.prototype.extension = function() {
  return this.match(/\.\w+$/)[0]
}

Number.prototype.bytes = function() {
  const units = ["B", "KB", "MB", "GB", "TB"]
  var n = Math.floor(Math.log2(this) / 10)
  var size = (this / Math.pow(1024, n)).toFixed(2)
  return parseFloat(size) + " " + units[n]
}

Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    }
  }
  return fmt
}

/*
 * Qiniu actions
 */
function actionSearch(text) {
  if (text) actionFetch(null, text)
  else actionFetch()
}

function actionDownload(fileName) {
  $ui.loading("Downloading")
  $http.download({
    url: encodeURI(URL_SELF + fileName),
    handler: function(resp) {
      $ui.loading(false)
      var file = resp.data
      if (!$file.exists("downloads")) {
        $file.mkdir("downloads")
      }
      $file.write({
        data: file,
        path: "downloads/" + file.fileName
      })

      DOWNLOADS_FILE = $file.list("downloads").sort()
      $("downloads").data = DOWNLOADS_FILE.map(function(d) {
        var file = $file.read("downloads/" + d)
        return {
          fname: {
            text: d
          },
          type: {
            text: "Type: " + file.info.mimeType
          },
          size: {
            text: "Size: " + file.info.size.bytes()
          }
        }
      })
      $("no-downloads").hidden = true
      $ui.toast($l10n("toast_downloaded"))
    }
  })
}

function actionFetch(action = null, prefix = "") {
  var path = "/list?bucket=" + SETTING_FILE[1][1] + "&limit=30&prefix=" + encodeURIComponent(prefix)
  var token = _base.authManage(path)
  var url = "http://rs.qiniu.com" + path
  var host = "rsf.qbox.me"
  _base.get(token, url, host, function(data) {
    listData(data, true)
    $("home").endFetchingMore()
  })
  $("footer").hidden = true
  if (action == "reload") {
    $("home").endRefreshing()
    $ui.toast($l10n("toast_reloaded"))
  } else if (action == "rename") {
    $ui.toast($l10n("toast_renamed"))
  }
}

function actionLoadMore(list, prefix = "") {
  $device.taptic(0)
  var marker = list.info
  if (typeof(marker) == "undefined") {
    $ui.loading(false)
    $("footer").hidden = false
    $ui.error($l10n("no_more_data"))
    return true
  }

  $("spinner").start()
  var path = "/list?bucket=" + SETTING_FILE[1][1] + "&marker=" + list.info + "&limit=30&prefix=" + prefix
  var token = _base.authManage(path)
  var url = "http://rs.qiniu.com" + path
  var host = "rsf.qbox.me"
  _base.get(token, url, host, function(data) {
    listData(data, false)
    $("home").endFetchingMore()
  })
}

function actionRefresh(rawURL) {
  var host = "http://fusion.qiniuapi.com"
  var path = "/v2/tune/refresh"
  var body = {
    "urls": [rawURL]
  }

  var token = _base.authManage(path)
  var url = host + path
  var handler = function() {
    $ui.toast($l10n("toast_refreshed"))
  }
  _base.post(token, url, handler, body)
}

function actionRename(beforeKey, afterKey) {
  var path = "/move/"
  var beforeEntry = $text.base64Encode(SETTING_FILE[1][1] + ":" + beforeKey)
  var afterEntry = $text.base64Encode(SETTING_FILE[1][1] + ":" + afterKey)
  var url = "http://rs.qiniu.com" + path + beforeEntry + "/" + afterEntry

  var token = _base.authManage(path + beforeEntry + "/" + afterEntry)
  _base.post(token, url, function() {
    actionFetch("rename")
  })
}

function actionDelete(fileName) {
  var path = "/delete/"
  var key = fileName
  var entry = $text.base64Encode(SETTING_FILE[1][1] + ":" + key)
  var url = "http://rs.qiniu.com" + path + entry

  var token = _base.authManage(path + entry)
  _base.post(token, url, function() {
    $ui.toast($l10n("toast_deleted"))
  })
}

function actionReorder() {
  function compare(property) {
    if (property == "size_num" || property == "time") {
      return function(obj1, obj2) {
        var value1 = obj1[property]
        var value2 = obj2[property]
        if (value1 < value2) return -1
        else if (value1 > value2) return 1
        else return 0
      }
    } else {
      return function(obj1, obj2) {
        var value1 = obj1[property]["text"]
        var value2 = obj2[property]["text"]
        if (value1 < value2) return -1
        else if (value1 > value2) return 1
        else return 0
      }
    }
  }

  var info = $ui.window.info
  var sort = info.sort
  var order = info.order || 0
  var data = $("home").data
  if (sort === 0) {
    data = data.sort(compare("fname"))
  } else if (sort === 1) {
    data = data.sort(compare("type"))
  } else if (sort === 2) {
    data = data.sort(compare("size_num"))
  } else if (sort === 3) {
    data = data.sort(compare("time"))
  }

  if (order === 1) data.reverse()
  $("home").data = data
}

/*
 * Push data
 */
function listData(rawData, refreshed = false) {
  var list = $("home")
  var idx = list.data.length
  if (refreshed === true) {
    var data = []
    for (var d of rawData.items) {
      data.push({
        fname: {
          text: d.key
        },
        type: {
          text: $l10n("type") + d.mimeType
        },
        size: {
          text: $l10n("size") + d.fsize.bytes()
        },
        size_num: d.fsize,
        time: d.putTime
      })
    }
    list.data = data
  } else if (refreshed === false) {
    for (var d of rawData.items) {
      list.insert({
        indexPath: $indexPath(0, idx),
        value: {
          fname: {
            text: d.key
          },
          type: {
            text: $l10n("type") + d.mimeType
          },
          size: {
            text: $l10n("size") + d.fsize.bytes()
          },
          size_num: d.fsize,
          time: d.putTime
        }
      })
      idx++
    }
  }
  list.info = rawData.marker
  // For sort
  if ($ui.window.info) actionReorder()
}

module.exports = {
  search: actionSearch,
  download: actionDownload,
  fetch: actionFetch,
  loadMore: actionLoadMore,
  refresh: actionRefresh,
  rename: actionRename,
  delete: actionDelete,
  reorder: actionReorder
}