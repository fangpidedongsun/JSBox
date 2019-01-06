const _general = require("./general")

//const LANGUAGE = _general.isChinese ? "zh" : "en"

function getDaysOfMonth(date, config) {
  let start = new Date(date.getFullYear(), date.getMonth(), 1)
  let end = new Date(config.year, config.month, config.date)
  // 100*60*60*24
  return (end - start) / 86400000
}

function getLabels(date, config, isFinished) {
  const texts = isFinished ? [`${config.month+1}-${config.date}`, `${date.getMonth()+1}-${date.getDate()}`] : [`${date.getMonth()+1}-1`, `${config.month+1}-${config.date}`]

  let data = []
  for (let i in texts) {
    data.push({
      "template-month": {
        text: texts[i],
        align: i == 1 ? $align.right : $align.left
      }
    })
  }
  return data
}

function getData(now) {
  const file = $file.read("configs/month.json") || $file.read("configs/default_month.json")
  const config = JSON.parse(file.string)
  const display = config.records[config.display]

  let day = now.getDate() - 1
  let allDays = getDaysOfMonth(now, display)
  let count = day - allDays
  let newPercentage = day / allDays

  let text = display.event + ": " + display.year + "-" + (display.month + 1) + "-" + display.date
  let labels = getLabels(now, display, count > 0)

  let data = {
    cacheDate: now.getDate(),
    text: text,
    labels: labels,
    count: count,
    percentage: count <= 0 ? newPercentage : 1.0
  }

  return data
}

function getDataAndCache(now) {
  let data = getData(now)
  $cache.set("progress-month-data", data)
  return data
}


/**********: Main :***********/

let newPercentage = 0.0

function monthObject() {
  let now = new Date()
  let data = $cache.get("progress-month-data") || getDataAndCache(now)
  if (now.getDate() != data.cacheDate) {
    let oldPercentage = data.percentage

    data = getDataAndCache(now)
    newPercentage = data.percentage
    data.percentage = oldPercentage
  }
  
  let monthProgress = {
    type: "view",
    props: {},
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "progress-month"
        },
        layout: (make, view) => {
          let sup = view.super
          make.height.equalTo(15)
          make.centerY.equalTo(sup).offset(15)
          make.left.right.inset(25)
        },
        views: [{
          type: "view",
          props: {
            bgcolor: $rgba(128, 128, 128, 0.2),
            smoothRadius: 8
          },
          layout: $layout.fill,
          views: [{
            type: "gradient",
            props: {
              id: "progress-month-gradient",
              colors: [
                $rgba(128, 128, 128, 0.6),
                $rgba(128, 128, 128, 0.4),
                $rgba(128, 128, 128, 0.2)
              ],
              locations: [0.0, 0.5, 1.0],
              startPoint: $point(0, 1),
              endPoint: $point(1, 1)
            },
            layout: (make, view) => {
              let sup = view.super
              make.left.top.bottom.inset(0)
              make.width.equalTo(sup).multipliedBy(data.percentage)
            }
          }]
        }]
      },
      {
        type: "view",
        props: {
          id: "progress-month-frame"
        },
        layout: (make, view) => {
          let current = $("progress-month-gradient")
          make.size.equalTo($size(35, 25))
          make.centerX.equalTo(current.right)
          make.bottom.equalTo(current.centerY).offset(3)
        },
        views: [{
            type: "canvas",
            events: {
              draw: (view, ctx) => {
                let width = view.frame.width / 2
                let height = view.frame.height
                let top = height
                let bottom = 0
                ctx.fillColor = $rgba(255, 255, 255, 1)
                ctx.moveToPoint(width, top)
                ctx.addLineToPoint(width - 5, bottom)
                ctx.addLineToPoint(width + 5, bottom)
                ctx.fillPath()
              }
            },
            layout: (make) => {
              make.height.equalTo(5)
              make.left.bottom.right.inset(0)
            }
          },
          {
            type: "view",
            props: {
              bgcolor: $rgba(255, 255, 255, 0.8)
            },
            layout: (make, view) => {
              let pre = view.prev
              make.bottom.equalTo(pre.top)
              make.left.top.right.inset(0)
              _general.shadow(view)
            },
            views: [{
              type: "label",
              props: {
                id: "progress-month-count",
                text: data.count.toString(),
                align: $align.center,
                font: $font("bold", 13)
              },
              layout: $layout.fill
            }]
          }
        ]
      },
      {
        type: "matrix",
        props: {
          id: "progress-month-labels",
          bgcolor: $color("clear"),
          scrollEnabled: false,
          selectable: false,
          template: [{
            type: "label",
            props: {
              id: "template-month",
              font: $font(13),
              autoFontSize: true,
              textColor: $color("darkGray")
            },
            layout: (make) => {
              make.left.right.inset(2)
              make.top.bottom.inset(0)
            }
          }],
          itemHeight: 20,
          columns: 2,
          data: data.labels
        },
        layout: (make) => {
          let pre = $("progress-month")
          make.height.equalTo(20)
          make.top.equalTo(pre.bottom)
          make.left.equalTo(pre)
          make.right.equalTo(pre) //.offset(1)
        }
      },
      {
        type: "label",
        props: {
          id: "progress-month-text",
          font: $font(13),
          textColor: $color("darkGray"),
          align: $align.center,
          text: data.text
        },
        layout: (make) => {
          let pre = $("progress-month")
          let ppre = $("progress-month-frame")
          make.left.equalTo(pre)
          make.right.equalTo(pre)
          make.bottom.equalTo(ppre.top).offset(-2)
        }
      },
      {
        type: "label",
        props: {
          font: $font("bold", 16),
          align: $align.center,
          text: $l10n("widget_month_title")
        },
        layout: (make, view) => {
          let pre = view.prev
          make.left.equalTo(pre)
          make.right.equalTo(pre)
          make.bottom.equalTo(pre.top)
        }
      }
    ]
  }

  return monthProgress
}

function refresh(percentage = newPercentage) {
  if (percentage === null) return
  
  $("progress-month-gradient").updateLayout((make, view) => {
    let sup = view.super
    make.width.equalTo(sup).multipliedBy(percentage)
  })
  $ui.animate({
    duration: 0.2,
    options: 2 << 16,
    animation: () => {
      $("progress-month-frame").super.runtimeValue().$layoutIfNeeded()
    }
  })
}

function simulator(date, i) {
  let data = getData(date)
  $("progress-month-text").text = data.text
  $("progress-month-count").text = data.count
  $("progress-month-labels").data = data.labels
  refresh(Math.min(data.percentage, 0.999) + 0.00001 * i)
  
  return ++i
}

module.exports = {
  object: monthObject,
  refresh: refresh,
  simulator: simulator
}
