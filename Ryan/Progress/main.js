let CONF = $file.read("configs/selection.json") || copyAndRead()
CONF = JSON.parse(CONF.string)

let PATHS = []
for (let i=0; i<3; i++) {
  if (CONF[i].display === true) {
    PATHS[i] = "scripts/" + CONF[i].view + ".js"
  }
}
PATHS = PATHS.filter(d => typeof d != "undefined")
const COUNT = PATHS.length

let cache = $cache.get("progress") || 0
let item = module(cache)
let view = item[cache].object()

if ($app.env === $env.app) {
  runOnApp()
} else {
  runOnWidget()
}


function runOnApp() {
  if ($app.env === $env.app) {
    require("scripts/setting/main").view()
    return
  }
}

function runOnWidget() {
  $ui.render({
    views: [{
      type: "view",
      props: {
        id: "main"
      },
      views: [view],
      layout: $layout.fill,
      events: {
        tapped: sender => {
          let sub = sender.views[0]
          cache = (cache + 1) % COUNT
          $device.taptic(0)
          toggle(sub, cache)
          $cache.set("progress", cache)
        },
        ready: function() {
          $delay(0.2, function() {
            item[cache].refresh()
          })
        }
      }
    }]
  })
}

function toggle(subview, nextIndex) {
  if (!item[nextIndex]) {
    item = module(nextIndex, item)
  }
  let nextView = item[nextIndex].object()
  nextView.props.alpha = 0
  $("main").add(nextView)
  
  $ui.animate({
    duration: 0.2,
    animation: () => {
      subview.alpha = 0
    },
    completion: () => {
      subview.remove()
      $ui.animate({
        duration: 0.2,
        animation: () => {
          $("main").views[0].alpha = 1
        },
        completion: () => {
          item[nextIndex].refresh()
        }
      })
    }
  })
}

function module(index, item = []) {
  switch (index) {
    case 0:
      item[0] = require(PATHS[0])
      break
    case 1:
      item[1] = require(PATHS[1])
      break
    case 2:
      item[2] = require(PATHS[2])
      break
  }
  return item
}

function copyAndRead() {
  $file.copy({
    src: "configs/default_selection.json",
    dst: "configs/selection.json"
  })
  
  let file = $file.read("configs/selection.json")
  return file
}
