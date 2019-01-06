const _general = require("./general")

const EVENT_LANGUAGE = _general.isChinese ? "event_zh" : "event_en"

const HOLIDAY = JSON.parse($file.read("configs/year.json").string).holidays

const TEXTS = _general.isChinese ? {
  "on_holiday": "在假日中：",
  "next_holiday": "还有 $$ 天到下一假期：",
  "no_more_holiday": "今年的假期已经过完了"
} : {
  "on_holiday": "On holiday: ",
  "next_holiday": "$$ days left to: ",
  "no_more_holiday": "No more holiday in this year"
}

const LABELS = _general.isChinese ? ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


function isLeapYear(date) {
  let year = date.getFullYear()
  if ((year & 3) != 0) return false
  return ((year % 100) != 0 || (year % 400) == 0)
}

function getDaysOfYear(date) {
  let dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let mn = date.getMonth()
  let dn = date.getDate()
  let dayOfYear = dayCount[mn] + dn
  if (mn > 1 && isLeapYear(date)) dayOfYear++
    return dayOfYear
}

function getHoliday(date) {
  let mn = date.getMonth()
  let dn = date.getDate()

  if (HOLIDAY[mn]) {
    for (let holiday of HOLIDAY[mn]) {
      if (dn >= holiday.from && dn <= holiday.to) {
        return TEXTS["on_holiday"] + holiday[EVENT_LANGUAGE]
      } else if (dn < holiday.from) {
        // Find nearest holiday from this month
        let count = holiday.from - dn
        let text = TEXTS["next_holiday"]
        if (count === 1) text = text.replace(/(day)s/, "$1")
        return text.replace("$$", count) + holiday[EVENT_LANGUAGE]
      }
    }
  }
  // Find nearest holiday from next month
  for (let n = mn + 1; n < 12; n++) {
    if (HOLIDAY[n]) {
      let year = date.getFullYear()
      let start = new Date(year, mn, dn)
      let end = new Date(year, n, HOLIDAY[n][0].from)
      // 1000*60*60*24
      let count = (end - start) / 86400000
      let text = TEXTS["next_holiday"]
      if (count === 1) text.replace(/(day)s/, "$1")
      return text.replace("$$", count) + HOLIDAY[n][0][EVENT_LANGUAGE]
    }
  }
  return TEXTS["no_more_holiday"]
}

function getLabels(month) {
  let data = []
  for (let i in LABELS) {
    var text = (i == 0 || i == 11 || i == month) ? LABELS[i] : ""
    data.push({
      "template-year": {
        text: text
      }
    })
  }
  return data
}

function getData(now) {
  let text = getHoliday(now)
  let labels = getLabels(now.getMonth())
  let newPercentage = getDaysOfYear(now) * 1.0 / (isLeapYear(now) ? 366 : 365)

  let data = {
    cacheDate: now.getDate(),
    text: text,
    labels: labels,
    percentage: newPercentage
  }

  return data
}

function getDataAndCache(now) {
  let data = getData(now)
  $cache.set("progress-year-data", data)
  return data
}


/**********: Main :***********/

let newPercentage = 0.0

function yearObject() {
  let now = new Date()
  let data = $cache.get("progress-year-data") || getDataAndCache(now)
  if (now.getDate() != data.cacheDate) {
    let oldPercentage = data.percentage

    data = getDataAndCache(now)
    newPercentage = data.percentage
    data.percentage = oldPercentage
  }

  let yearProgress = {
    type: "view",
    props: {},
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "progress-year"
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
              id: "progress-year-gradient",
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
          id: "progress-year-frame"
        },
        layout: (make, view) => {
          let current = $("progress-year-gradient")
          make.size.equalTo($size(40, 25))
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
                id: "progress-year-count",
                text: parseInt(data.percentage * 100) + "%",
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
          id: "progress-year-labels",
          bgcolor: $color("clear"),
          scrollEnabled: false,
          selectable: false,
          template: [{
            type: "label",
            props: {
              id: "template-year",
              align: $align.center,
              font: $font(13),
              autoFontSize: true,
              textColor: $color("darkGray")
            },
            layout: $layout.fill
          }],
          itemHeight: 20,
          columns: 12,
          data: data.labels
        },
        layout: (make, view) => {
          let pre = $("progress-year")
          make.height.equalTo(20)
          make.top.equalTo(pre.bottom)
          make.left.equalTo(pre)
          make.right.equalTo(pre) //.offset(1)
        }
      },
      {
        type: "label",
        props: {
          id: "progress-year-text",
          font: $font(13),
          textColor: $color("darkGray"),
          align: $align.center,
          text: data.text
        },
        layout: (make) => {
          let pre = $("progress-year")
          let ppre = $("progress-year-frame")
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
          text: $l10n("widget_year_title")
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

  return yearProgress
}

function refresh(percentage = newPercentage) {
  if (percentage === null) return
  
  $("progress-year-gradient").updateLayout((make, view) => {
    let sup = view.super
    make.width.equalTo(sup).multipliedBy(percentage)
  })
  $ui.animate({
    duration: 0.2,
    options: 2 << 16,
    animation: () => {
      $("progress-year-frame").super.runtimeValue().$layoutIfNeeded()
    }
  })
}

function simulator(date, i) {
  let data = getData(date)
  $("progress-year-text").text = data.text
  $("progress-year-count").text = parseInt(data.percentage * 100) + "%"
  $("progress-year-labels").data = data.labels
  refresh(Math.min(data.percentage, 0.999) + 0.00001 * i)
  
  return ++i
}

module.exports = {
  object: yearObject,
  refresh: refresh,
  simulator: simulator
}
