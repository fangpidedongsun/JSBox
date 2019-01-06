const _general = require("./general")

const LANGUAGE = _general.isChinese ? "zh" : "en"
const LABELS = _general.isChinese ? ["一", "二", "三", "四", "五", "六", "日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const fullWeek = 10080 //60*24*7

function getMinutesOfWeek(date) {
  const fullDay = 1440 //60*24
  let day = date.getDay() === 0 ? 7 : date.getDay()
  let time = date.getHours() * 60 + date.getMinutes() + (day - 1) * fullDay
  return time
}

function getTexts(date, currentWeek) {
  const file = $file.read("configs/week.json") || $file.read("configs/default_week_" + LANGUAGE + ".json")
  const config = JSON.parse(file.string)
  
  let day = date.getDay()
  let hour = date.getHours()
  let confs = config[day]
  
  let emoji = ""
  let text = ""
  
  if (confs.length === 1) {
    emoji = confs[0].emoji
    text = confs[0].msg
  } else {
    let i = 0
    while (i < confs.length-1 && hour >= confs[i].end) {
      i++
    }
    emoji = confs[i].emoji
    text = confs[i].msg
  }

  let leftDay = parseInt((fullWeek - currentWeek) / 1440) //60*24
  let leftHour = (fullWeek - currentWeek) % 1440 / 60

  let matchs = text.match(/\$(.+?)(\d*)\$/)
  while (matchs) {
    let str = ""
    switch (matchs[1]) {
      case "d":
      case "d-":
        str = leftDay + 1
        if (matchs[2]) str -= matchs[2]
        break
      case "h":
      case "h+":
        str = Math.ceil(leftHour)
        if (matchs[2]) str += matchs[2]
        break
      case "h-":
        str = Math.floor(leftHour)
        if (matchs[2]) str -= matchs[2]
        break
    }
    text = text.replace(matchs[0], str.toString())
    if (str === 1) {
      let pattern = new RegExp(`(${str}\\s*(day|hour))s`)
      text = text.replace(pattern, "$1")
    }
    
    matchs = text.match(/\$(.+?)(\d*)\$/)
  }

  return {
    emoji: emoji,
    text: text
  }
}

function getLabels() {
  let data = []
  for (let text of LABELS) {
    data.push({
      "template-week": {
        text: text
      }
    })
  }
  return data
}


/**********: Main :***********/

let newPercentage = 0.0

function weekObject() {
  let now = new Date
  let week = getMinutesOfWeek(now)
  let {text: text, emoji: emoji} = getTexts(now, week)

  newPercentage = week / fullWeek
  let oldPercentage = $cache.get("progress-week") || newPercentage
  $cache.set("progress-week", newPercentage)

  let weekProgress = {
    type: "view",
    props: {},
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "progress-week"
        },
        layout: (make, view) => {
          let sup = view.super
          make.height.equalTo(15)
          make.centerY.equalTo(sup).offset(20)
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
              id: "progress-week-gradient",
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
              make.width.equalTo(sup).multipliedBy(oldPercentage)
            }
          }]
        }]
      },
      {
        type: "view",
        props: {
          id: "progress-week-frame"
        },
        layout: (make, view) => {
          let current = $("progress-week-gradient")
          make.size.equalTo($size(30, 35))
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
                id: "progress-week-emoji",
                text: emoji,
                align: $align.center,
                font: $font(20)
              },
              layout: $layout.fill
            }]
          }
        ]
      },
      {
        type: "matrix",
        props: {
          bgcolor: $color("clear"),
          scrollEnabled: false,
          selectable: false,
          template: [{
            type: "label",
            props: {
              id: "template-week",
              align: $align.center,
              font: $font(13),
              autoFontSize: true,
              textColor: $color("darkGray")
            },
            layout: $layout.fill
          }],
          itemHeight: 20,
          columns: 7,
          data: getLabels()
        },
        layout: (make) => {
          let pre = $("progress-week")
          make.height.equalTo(20)
          make.top.equalTo(pre.bottom)
          make.left.equalTo(pre)
          make.right.equalTo(pre).offset(1)
        }
      },
      {
        type: "label",
        props: {
          id: "progress-week-text",
          font: $font(13),
          textColor: $color("darkGray"),
          align: $align.center,
          text: text
        },
        layout: (make) => {
          let pre = $("progress-week")
          let ppre = $("progress-week-frame")
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
          text: $l10n("widget_week_title")
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

  return weekProgress
}

function refresh(percentage = newPercentage) {
  $("progress-week-gradient").updateLayout((make, view) => {
    let sup = view.super
    make.width.equalTo(sup).multipliedBy(percentage)
  })
  $ui.animate({
    duration: 0.2,
    options: 2 << 16,
    animation: () => {
      $("progress-week-frame").super.runtimeValue().$layoutIfNeeded()
    }
  })
}


function simulator(date, i) {
  let week = getMinutesOfWeek(date)
  let {text: text, emoji: emoji} = getTexts(date, week)
  let percent = week / fullWeek
  
  $("progress-week-emoji").text = emoji
  $("progress-week-text").text = text
  refresh(Math.min(percent, 0.999) + 0.00001 * i)
  
  return ++i
}

module.exports = {
  object: weekObject,
  refresh: refresh,
  simulator: simulator
}
