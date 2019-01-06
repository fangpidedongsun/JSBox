const _week = require("../week.js")
const _month = require("../month.js")
const _year = require("../year.js")
const _general = require("../general.js")

const LANGUAGE = _general.isChinese ? "zh" : "en"

if (!$file.exists("configs/selection.json")) {
  $file.copy({
    src: "configs/default_selection.json",
    dst: "configs/selection.json"
  })
}

const VIEWS = {
  "week": _week.object,
  "month": _month.object,
  "year": _year.object
}

const HOME_TEMPLATE = {
  views: [{
   type: "label",
   props: {
     id: "template-name"
   },
   layout: make => {
     make.top.bottom.inset(0)
     make.left.inset(15)
   }
 }]
}

let SIMULATEOR_COUNT = 1

let SELECTION = null

function homeObject() {
  let {
    viewData: viewData,
    selectionData: selectionData
  } = getHomeData()
  
  let home = {
    type: "view",
    props: {
      id: "home"
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        id: "setting-home-gallery",
        bgcolor: $color("#EEEEEE")
      },
      layout: make => {
        make.height.equalTo(130)
        make.left.top.right.inset(0)
      },
      views: [{
        type: "gallery",
        props: {
          items: viewData
        },
        layout: $layout.fill
      }]
    },
    {
      type: "canvas",
      props: {
        bgcolor: $color("#EEEEEE")
      },
      layout: (make, view) => {
        let pre = view.prev
        make.top.equalTo(pre.bottom)
        make.height.equalTo(1)
        make.left.right.inset(0)
      },
      events: {
        draw: (view, ctx) => {
          let width = view.frame.width
          let height = view.frame.height
          let scale = $device.info.screen.scale
          ctx.setAlpha(0.5)
          ctx.strokeColor = $color("lightGray")
          ctx.setLineWidth(1 / scale)
          ctx.moveToPoint(0, height)
          ctx.addLineToPoint(width, height)
          ctx.strokePath()
        }
      }
    },
    {
      type: "list",
      props: {
        //selectable: false,
        reorder: true,
        crossSections: false,
        template: HOME_TEMPLATE,
        data: [{
          title: $l10n("home_simulator"),
          rows: [{
            type: "date-picker",
            props: {
              id: "setting-home-simulator",
              borderWidth: 0.3,
              borderColor: $color("#DEDEDE"),
              mode: 2,
              interval: 20
            },
            layout: make => {
              make.left.top.right.inset(0)
              make.bottom.inset(-0.3)
            },
            events: {
              changed: sender => {
                actionHomeSimulate(sender.date)
              }
            }
          },
          {
            type: "view",
            layout: (make, view) => {
              make.left.top.bottom.right.inset(0)
              _general.shadow(view, true)
            },
            views: [{
              type: "button",
              props: {
                title: `  ${$l10n("home_refresh")}  `,
                titleColor: $color("black"),
                bgcolor: $color("white"),
                font: $font("PingFang-SC-Medium", 13),
                circular: true
              },
              layout: make => {
                make.height.equalTo(25),
                make.center.equalTo()
              },
              events: {
                tapped: () => {
                  actionRefresh()
                }
              }
            }]
          }]
        },
        {
          title: $l10n("home_selection"),
          rows: selectionData
        }],
        footer: {
          type: "view",
          props: {
            height: 50
          },
          views: [{
            type: "label",
            props: {
              textColor: $color("#AAAAAA"),
              lines: 0,
              font: $font(12),
              align: $align.center,
              text: $l10n("home_footer")
            },
            layout: make => {
              make.top.inset(0)
              make.left.right.inset(20)
            }
          }]
        }
      },
      layout: (make, view) => {
        let pre = view.prev
        make.top.equalTo(pre.bottom)
        make.left.bottom.right.inset(0)
      },
      events: {
        rowHeight: (sender, indexPath) => {
          if (indexPath.section === 0 && indexPath.row === 0) return 150
          //else return 50
        },
        canMoveItem: (sender, indexPath) => {
          return indexPath.section > 0
        },
        forEachItem: (view, indexPath) => {
          actionSelected(view.super, indexPath)
        },
        didSelect: (sender, indexPath) => {
          if (indexPath.section === 0) return

          if (SELECTION[indexPath.row] === true && eval(SELECTION.join("+")) === 1) return
          
          actionSelected(sender.cell(indexPath), indexPath, true)
          actionSaveConfiguration()
          actionRefresh()
        },
        reorderMoved: (from, to) => {
          let temp = SELECTION[from.row]
          SELECTION[from.row] = SELECTION[to.row]
          SELECTION[to.row] = temp
        },
        reorderFinished: data => {
          actionSaveConfiguration()
          actionRefresh()
        }
      }
    }]
  }
  
  return home
}

function getHomeData() {
  let conf = JSON.parse($file.read("configs/selection.json").string)
  
  SELECTION = Array(3).fill(false)
  
  let viewData = []
  let selectionData = []
  for (let i=0; i<3; i++) {
    if (conf[i]["display"] === true) {
      viewData[i] = {
        type: "view",
        props: {},
        views: [VIEWS[conf[i]["view"]]()]
      }
      
      SELECTION[i] = true
    }
    
    selectionData.push({
      "template-name": {
         text: conf[i]["name_" + LANGUAGE]
      },
      name_en: conf[i]["name_en"],
      name_zh: conf[i]["name_zh"],
      view: conf[i]["view"]
    })
  }

  viewData = viewData.filter(d => typeof d == "object")

  return {
    viewData: viewData,
    selectionData: selectionData
  }
}

function actionSelected(view, indexPath, isOpposite = false) {
  if (isOpposite) SELECTION[indexPath.row] = !SELECTION[indexPath.row]
  
  let type = SELECTION[indexPath.row] === true ? 3 : 0
  view.runtimeValue().$setAccessoryType(type)
}

function actionSaveConfiguration() {
  let datas = $("home").views[2].data[1].rows
  let json = {"0": {}, "1": {}, "2": {}}
  for (let i=0; i<3; i++) {
    json[i]["name_en"] = datas[i]["name_en"]
    json[i]["name_zh"] = datas[i]["name_zh"]
    json[i]["view"] = datas[i]["view"]
    json[i]["display"] = SELECTION[i]
  }
  
  $file.write({
    data: $data({
      string: JSON.stringify(json)
    }),
    path: "configs/selection.json"
  })

  $cache.remove("progress")
}

function actionRefresh() {
  $("setting-home-gallery").views[1].remove()
  $("setting-home-gallery").views[0].remove()

  $("setting-home-gallery").add({
    type: "gallery",
    props: {
      items: getHomeData().viewData
    },
    layout: $layout.fill
  })

  $("setting-home-simulator").date = new Date()
}

function actionHomeSimulate(date) {
  if ($("progress-week"))
    _week.simulator(date, SIMULATEOR_COUNT)
  if ($("progress-month"))
    _month.simulator(date, SIMULATEOR_COUNT)
  if ($("progress-year"))
    _year.simulator(date, SIMULATEOR_COUNT)
  
  SIMULATEOR_COUNT++
}

module.exports = {
  object: homeObject()
}
