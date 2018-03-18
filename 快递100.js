/**
 * 快递100 - 查询快递动态小脚本
 * Powered by JSbox
 * 
 * @author AbleCats <etsy@live.com>
 * @public https://t.me/Flow_Script
 * @version 20180318A 
 *
 * Using Tips 
 * 在items上可进行长按/双击操作
 * 暂时无法使用上下页功能,稍等下个版本
 * widget 需要 JSBox 1.11(117)及以上版本支持
 */

var storied = $cache.get("storied") ? $cache.get("storied") : []

async function scanCode(num) {
  num = typeof(num) == "object" ? num[0] : num
  return new Promise(resolve => {
    $http.get({
      url: "https://www.kuaidi100.com/autonumber/autoComNum?resultv2=1&text=" + num,
      handler: function(resp) {
        saveOrder(num)
        var data = resp.data
        var comCode = data.auto[0].comCode
        $http.get({
          url: "https://www.kuaidi100.com/query?type=" + comCode + "&postid=" + num,
          handler: function(resp) {
            var items = []
            var data = resp.data
            if (data.status == 200)
              for (const key in data.data) {
                let d = data.data[key]
                cnum = "  " + num + "  "
                ctim = d.time
                items.push({
                  num: num,
                  text: d.context,
                  time: comCode + cnum + ctim
                })
              }
            else {
              items.push({
                time: "ERROR " + data.status,
                text: "emmm... 出错啦 🌝"
              })
              data.status==201?delOrder(num):0
            }
            resolve(items)
          }
        })
      }
    })
  })
}

function saveOrder(num) {
  let length = storied.length
  if (length) {
    for (const key in storied) {
      if (storied[key] == num) break;
      else {
        if (key == length - 1) {
          storied.unshift(num)
          $cache.set("storied", storied)
        }
      }
    }
  } else {
    storied.unshift(num)
    $cache.set("storied", storied)
  }
}

function delOrder(num) {
  for (const key in storied) {
    if (storied[key] == num) {
      storied.splice(key, 1)
      $cache.set("storied", storied)
    }
  }
}

async function waitData() {
  var Code = []
  var ct = $clipboard.text
  $ui.loading(true)

  function orderRun(i) {
    $console.log(i)
    $ui.alert({
      title: "单号操作",
      message: "请选择对单号\n" + i + "\n要执行的操作内容",
      actions: [{
          title: "删除",
          handler: function() {
            delOrder(i)
            waitData()
          }
        },
        {
          title: "复制",
          handler: function() {
            $clipboard.text = i
          }
        },
        {
          title: "取消",
          handler: function() {

          }
        }
      ]
    })
  }

  function CS(ct) {
    let length = storied.length
    if (length) {
      for (const key in storied) {
        if (storied[key] == ct) break;
        else if (key == length - 1) Alt(ct);
      }
    } else Alt(ct)
  }

  function Alt(ct) {
    $ui.alert({
      title: "单号检测完成",
      message: "检测到单号\n" + ct + "\n请选择要执行的操作",
      actions: [{
          title: "忽略",
          handler: function() {
            $clipboard.clear()
          }
        },
        {
          title: "查看",
          handler: function() {
            saveOrder(ct)
            waitData()
            $clipboard.clear()
          }
        }
      ]
    })
  }

  function listText(d) {
    var T = {
      type: "list",
      props: {
        rowHeight: 120,
        data: [{
          title: d[0].time,
          rows: [{
            type: "label",
            props: {
              lines: 0,
              text: d[0].text,
              autoFontSize: true,
              align: $align.center
            },
            layout: $layout.fill,
            events: {
              longPressed: function(sender) {
                orderRun(d[0].num)
              },
              doubleTapped: function() {
                waitData()
              }
            }
          }]
        }],
        footer: {
          type: "view",
          views: [{
            type: "label",
            props: {
              height: 20,
              text: "AbleCats",
              textColor: $color("#AAAAAA"),
              align: $align.center,
              font: $font(12)
            },
            layout: function(make, view) {
              make.center.equalTo(view.super)
              WHT = $ui.window.frame.width / 3
              make.size.equalTo($size(WHT, 20))
            }
          }, {
            type: "button",
            props: {
              alpha: 0.5,
              radius: 20,
              title: "上",
            },
            layout: function(make, view) {
              make.left.inset(5)
              WHT = $ui.window.frame.width / 3
              make.size.equalTo($size(40, 40))
            },
            events: {
              tapped: function(sender) {
                $("vs").page = $("vs").page - 1 >= 0 ? $("vs").page - 1 : storied.length - 1
              }
            }
          }, {
            type: "button",
            props: {
              alpha: 0.5,
              radius: 20,
              title: "下",
            },
            layout: function(make, view) {
              make.right.inset(5)
              WHT = $ui.window.frame.width / 3
              make.size.equalTo($size(40, 40))
            },
            events: {
              tapped: function(sender) {
                $("vs").page = $("vs").page + 1 <= storied.length - 1 ? $("vs").page + 1 : 0
              }
            }
          }]
        },
        layout: $layout.fill
      }
    }
    return T;
  }

  function eText() {
    Code.push({
      type: "list",
      props: {
        data: [{
          title: "ERROR",
          rows: [{
            type: "label",
            props: {
              lines: 0,
              text: "没有单号无能无力🌚",
              align: $align.center
            },
            layout: $layout.fill,
            events: {
              doubleTapped: function() {
                waitData()
              }
            }
          }]
        }]
      },
      layout: $layout.fill,
    })
  }

  for (let i of storied) {
    if (i) {
      d = await scanCode(i)
      Code.push(listText(d))
    }
  }

  Code.length ? Code : eText()
  $ui.loading(false)
  $ui.render({
    props: {
      title: "快递100"
    },
    views: [{
      type: "gallery",
      props: {
        id: "vs",
        items: Code,
      },
      layout: $layout.fill
    }]
  })
  var Pass = /[0-9]{10,14}/g
  Pass.test(ct) ? CS(ct) : 0

}

waitData()