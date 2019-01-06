var _action1 = require("scripts/action_general")

function fetchDataOnScreen(pulled = false) {
  $ui.loading(true)
  $http.get({
    url: "https://api-m.mtime.cn/Showtime/LocationMovies.api?locationId=" + SETTING_FILE[0][4],
    handler: function(resp) {
      $ui.loading(false)
      if (pulled) {
        $("onscreen").endRefreshing()
        //$ui.toast($l10n("toast_refreshed"))
        _action1.toast($l10n("toast_refreshed"))
      }

      var status = resp.response.statusCode
      if (status != "200") {
        $ui.alert({
          title: status,
          message: "Public API has limit of request frequency, take a rest :)"
        })
        return
      }
      RAW_DATA[ON_SCREEN] = resp.data
      loadDataOnScreen()
      // Cache
      if (SETTING_FILE[0][3]) {
        $cache.set("onScreen", resp.data)
      }
    }
  })
}

function fetchDataComingSoon(pulled = false) {
  $ui.loading(true)
  $http.get({
    url: "https://api-m.mtime.cn/Movie/MovieComingNew.api?locationId=" + SETTING_FILE[0][4],
    handler: function(resp) {
      $ui.loading(false)
      if (pulled) {
        $("comingsoon").endRefreshing()
        //$ui.toast($l10n("toast_refreshed"))
        _action1.toast($l10n("toast_refreshed"))
      }

      var status = resp.response.statusCode
      if (status != "200") {
        $ui.alert({
          title: status,
          message: "Public API has limit of request frequency, take a rest :)"
        })
        return
      }
      RAW_DATA[COMING_SOON] = resp.data
      loadDataComingSoon()
      // Cache
      if (SETTING_FILE[0][3]) {
        $cache.set("comingSoon", resp.data)
      }
    }
  })
}

function fetchDataQuery(keyword) {
  $ui.loading(true)
  $http.get({
    url: "https://api-m.mtime.cn/Showtime/SearchVoice.api?pageIndex=1&searchType=3&locationId=" + SETTING_FILE[0][4] + "&Keyword=" + encodeURI(keyword),
    handler: function(resp) {
      $ui.loading(false)
      var status = resp.response.statusCode
      if (status != "200") {
        $ui.alert({
          title: status,
          message: "Public API has limit of request frequency, take a rest :)"
        })
        return
      }
      if (resp.data.movies.length == 0) {
        //$ui.error($l10n("error_query"))
        _action1.toast($l10n("error_query"), true)
        return
      }
      var data = []
      var quality = SETTING_FILE[0][0]
      var res = resp.data.movies
      var idx = 0
      for (var i of res) {
        var d = {
          cover: {
            src: i.img.split("_")[0] + "_" + quality + ".jpg"
          },
          title: {
            text: i.name
          },
          genres: {
            text: "类型: " + (i.movieType || "无")
          },
          director: {
            text: "导演: " + (i.directors.join(" | ") || "无")
          },
          cast: {
            text: "主演: " + (i.actors.join(" | ") || "无")
          },
          info: {
            text: "出版: " + i.year + "年"
          },
          id: i.id
        }
        data.push(d)
      }
      // Update Results
      $("recent_search").data = data
    }
  })
}

function loadDataOnScreen(start = 0) {
  var data = start == 0 ? [] : $("onscreen").data
  var quality = SETTING_FILE[0][0]
  var count = SETTING_FILE[0][2]
  var res = RAW_DATA[ON_SCREEN].ms
  var total = res.length
  var pageLastIndex = (start + count) > total ? total : (start + count)
  var page = pageLastIndex + " / " + total

  if (start === total) {
    $ui.loading(false)
    //$ui.error($l10n("error_loadmore"))
    _action1.toast($l10n("error_loadmore"), true)
    return true
  }
  
  var today = format((new Date()), "yyyyMMdd")
  for (var idx = start; idx < pageLastIndex; idx++) {
    var i = res[idx]
    var d = {
      cover: {
        src: i.img.split("_")[0] + "_" + quality + ".jpg"
      },
      presell: {
        hidden: i.rd <= today
      },
      title: {
        text: i.tCn
      },
      genres: {
        text: "类型: " + (i.movieType.replace(/\//g, "|") || "无")
      },
      director: {
        text: "导演: " + (i.dN || "无")
      },
      cast: {
        text: "主演: " + (i.actors.replace(/\//g, "|") || "无")
      },
      info: {
        text: "热度: " + i.wantedCount + "人想看"
      },
      id: i.id
    }
    data.push(d)
  }
  // Upadate Page Info
  $("onscreen").info = pageLastIndex
  $("onscreen_page").text = page
  $("onscreen").endFetchingMore()
  // Update Results
  $("onscreen").data = data
}

function loadDataComingSoon(start = 0) {
  var data = start == 0 ? [] : $("comingsoon").data
  var quality = SETTING_FILE[0][0]
  var count = SETTING_FILE[0][2]
  var res = RAW_DATA[COMING_SOON].moviecomings
  var total = res.length
  var pageLastIndex = (start + count) > total ? total : (start + count)
  var page = pageLastIndex + " / " + total

  if (start === total) {
    $ui.loading(false)
    //$ui.error($l10n("error_loadmore"))
    _action1.toast($l10n("error_loadmore"), true)
    return true
  }

  for (var idx = start; idx < pageLastIndex; idx++) {
    var i = res[idx]
    var date = new Date(i.rYear + "-" + (i.rMonth < 10 ? "0" : "") + i.rMonth + "-" + (i.rDay < 10 ? "0" : "") + i.rDay)
    var between = Math.ceil((date - new Date()) / 86400000)
    
    var section = format(date, "yyyy-MM-dd") + " [" + (between >= 0 ? "+" : "") + between + "]"
    var d = {
      cover: {
        src: i.image.split("_")[0] + "_" + quality + ".jpg"
      },
      title: {
        text: i.title
      },
      genres: {
        text: "类型: " + (i.type.replace(/\//g, "|") || "无")
      },
      director: {
        text: "导演: " + (i.director || "无")
      },
      cast: {
        text: "主演: " + ([i.actor1, i.actor2].filter(function(text) { return text != "" }).join(" | ") || "无")
      },
      info: {
        text: "热度: " + i.wantedCount + "人想看"
      },
      id: i.id
    }

    if (typeof(data[data.length - 1]) != "undefined" && section == data[data.length - 1].title) {
      data[data.length - 1].rows.push(d)
    } else {
      data.push({
        title: section,
        rows: [d]
      })
    }
  }
  // Upadate Page Info
  $("comingsoon").info = pageLastIndex
  $("comingsoon_page").text = page
  $("comingsoon").endFetchingMore()
  // Update Results
  $("comingsoon").data = data
}

module.exports = {
  fetchDataComingSoon: fetchDataComingSoon,
  fetchDataOnScreen: fetchDataOnScreen,
  fetchDataQuery: fetchDataQuery,
  loadDataComingSoon: loadDataComingSoon,
  loadDataOnScreen: loadDataOnScreen
}
