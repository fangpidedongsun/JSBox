const _general = require("../general")

/*********: Week View :**************/

const LANGUAGE = _general.isChinese ? "zh" : "en"
if (!$file.exists("configs/week.json")) {
  $file.copy({
    src: "configs/default_week_" + LANGUAGE + ".json",
    dst: "configs/week.json"
  })
}

const DAYS = [
  $l10n("week_monday"),
  $l10n("week_tuesday"),
  $l10n("week_wednesday"),
  $l10n("week_thursday"),
  $l10n("week_friday"),
  $l10n("week_saturday"),
  $l10n("week_sunday")
]

const HOURS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
  "13", "14", "15", "16", "17", "18",
  "19", "20", '21', '22', '23', '24'
]

const COLORS = [
  $color("#EE869A"), // End
  $color("#93B881"), // Emoji
  $color("#3A8FB7") // Text
]

const ROWHEIGHT = 65
const SAFE_AREA_BOTTOM = $device.isIphoneX ? 34 : 0

let SCROLL_OFFSET = 0

const WEEK_TEMPLATE = {
  views: [{
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "label",
      props: {
        id: "template-title",
        font: $font("PingFangSC-Medium", 13)
      },
      layout: make => {
        make.top.inset(5)
        make.left.inset(15)
      }
    },
    {
      type: "label",
      props: {
        id: "template-hour",
        font: $font("PingFangSC-Medium", 13)
      },
      layout: (make, view) => {
        let pre = view.prev
        make.left.equalTo(pre.right)
        make.top.equalTo(pre)
        make.right.inset(15)
      }
    },
    {
      type: "label",
      props: {
        id: "template-emoji",
        font: $font(13),
        align: $align.center,
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.size.equalTo($size(30, 30))
        make.top.equalTo(pre.bottom).offset(5)
        make.left.inset(15)
      }
    },
    {
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.left.equalTo(pre.right).offset(10)
        make.top.equalTo(pre)
        make.bottom.equalTo(pre)
        make.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "template-text",
          font: $font(13),
          align: $align.center
        },
        layout: make => {
          make.left.right.inset(10)
          make.top.bottom.inset(0)
        }
      }]
    }]
  }]
}

function getWeekData() {
  let weekData = []
  let confs = JSON.parse($file.read("configs/week.json").string)
  
  for (let i in confs) {
    for (let conf of confs[i]) {
      weekData.push({
        "template-title": {
          text: i == 0 ? DAYS[6] : DAYS[i-1]
        },
        "template-hour": {
          text: conf.end + ":00"
        },
        "template-emoji": {
          text: conf.emoji
        },
        "template-text": {
          text: conf.msg
        },
        day: i,
        end: conf.end
      })
    }
  }
  
  weekData.sort(compare)

  return weekData
}

function weekObject() {
  let weekData = getWeekData()

  let week = {
    type: "view",
    props: {
      id: "setting-week"
    },
    layout: $layout.fill,
    views: [

    // Setting guidance
    {
      type: "view",
      props: {
        bgcolor: $color("white")
      },
      layout: make => {
        make.height.equalTo(130)
        make.left.top.right.inset(5)
      },
      views: [{
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: (make, view) => {
          make.left.top.right.inset(0)
          make.height.equalTo(ROWHEIGHT)
          _general.shadow(view, true)
        },
        views: [{
          type: "view",
          layout: $layout.fill,
          views: [{
            type: "label",
            props: {
              text: DAYS[5],
              font: $font("PingFangSC-Medium", 13)
            },
            layout: make => {
              make.top.inset(5)
              make.left.inset(15)
            }
          },
          {
            type: "label",
            props: {
              text: "  24:00  ",
              font: $font("PingFangSC-Medium", 13),
              borderWidth: 1,
              borderColor: COLORS[0],
              circular: true
            },
            layout: (make, view) => {
              let pre = view.prev
              make.left.equalTo(pre.right)
              make.top.equalTo(pre)
              make.right.inset(15)
            }
          },
          {
            type: "label",
            props: {
              font: $font(13),
              align: $align.center,
              bgcolor: $color("#EEEEEE"),
              text: "🤟🏻",
              borderWidth: 1,
              borderColor: COLORS[1],
              circular: true
            },
            layout: (make, view) => {
              let pre = view.prev
              make.size.equalTo($size(30, 30))
              make.top.equalTo(pre.bottom).offset(5)
              make.left.inset(15)
            }
          },
          {
            type: "view",
            props: {
              bgcolor: $color("#EEEEEE"),
              borderWidth: 1,
              borderColor: COLORS[2],
              circular: true
            },
            layout: (make, view) => {
              let pre = view.prev
              make.left.equalTo(pre.right).offset(10)
              make.top.equalTo(pre)
              make.bottom.equalTo(pre)
              make.right.inset(15)
            },
            views: [{
              type: "label",
              props: {
                text: $l10n("week_guide_text"),
                font: $font(13),
                align: $align.center
              },
              layout: make => {
                make.left.right.inset(10)
                make.top.bottom.inset(0)
              }
            }]
          }]
        }]
      },
      {
        type: "view",
        layout: (make, view) => {
          let pre = view.prev
          make.top.equalTo(pre.bottom).offset(5)
          make.left.bottom.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            lines: 3,
            font: $font(13),
            attributedText: _general.attributedString(`◉ ${$l10n("week_guide_discription_hour")}\n◉ ${$l10n("week_guide_discription_emoji")}\n◉ ${$l10n("week_guide_discription_text")}`, COLORS)
          },
          layout: make => {
            make.left.right.inset(5)
            make.top.bottom.inset(0)
          }
        }]
      }]
    },

    // Setting List
    {
      type: "view",
      layout: (make, view) => {
        let pre = view.prev
        make.top.equalTo(pre.bottom)
        make.left.bottom.right.inset(0)
      },
      views: [{
        type: "list",
        props: {
          id: "setting-week-list",
          template: WEEK_TEMPLATE,
          rowHeight: ROWHEIGHT,
          data: [{
            title: $l10n("week_list_title"),
            rows: weekData
          }],
          // Insert Button and Reset Button
          footer: {
            type: "view",
            props: {
              height: 50
            },
            views: [{
              type: "view",
              layout: (make, view) => {
                let sup = view.super
                make.left.equalTo(0)
                make.right.equalTo(sup.centerX)
                make.top.bottom.inset(0)
                _general.shadow(view, true)
              },
              views: [{
                // Insert Button
                type: "button",
                props: {
                  title: `  ${$l10n("week_button_insert")}  `,
                  titleColor: $color("black"),
                  font: $font("PingFangSC-Medium", 13),
                  bgcolor: $color("white"),
                  circular: true
                },
                layout: make => {
                  make.height.equalTo(25)
                  make.centerX.equalTo()
                  make.top.inset(0)
                },
                events: {
                  tapped: () => {
                    $delay(0.0, () => {
                      actionWeekInsert()
                    })
                  }
                }
              }]
            },
            {
              type: "view",
              layout: (make, view) => {
                let sup = view.super
                make.right.equalTo(0)
                make.left.equalTo(sup.centerX)
                make.top.bottom.inset(0)
                _general.shadow(view, true)
              },
              views: [{
                // Reset Button
                type: "button",
                props: {
                  title: `  ${$l10n("week_button_reset")}  `,
                  titleColor: $color("black"),
                  font: $font("PingFangSC-Medium", 13),
                  bgcolor: $color("white"),
                  circular: true
                },
                layout: make => {
                  make.height.equalTo(25)
                  make.centerX.equalTo()
                  make.top.inset(0)
                },
                events: {
                  tapped: () => {
                    actionWeekReset()
                  }
                }
              }]
            }]
          }
        },
        layout: $layout.fill,
        events: {
          forEachItem: (view, indexPath) => {
            view.super.runtimeValue().$setSelectionStyle(0)
          },
          didSelect: (sender, indexPath) => {
            actionWeekMenu(sender, indexPath)
          },
          // willBeginDragging: (sender) => {
          //   let y = sender.contentOffset.y
          //   SCROLL_OFFSET = y
          // },
          // willEndDragging: (sender, velocity) => {
          //   console.info(velocity)
          //   let y = sender.contentOffset.y
          //   if (y - SCROLL_OFFSET > 0)
          //     weekGuideViewToggle(false)
          //   else if (y - SCROLL_OFFSET < 0)
          //     weekGuideViewToggle(true)
          // }
        }
      }]
    },
    {
      type: "canvas",
      events: {
        draw: (view, ctx) => {
          let width = view.frame.width
          let scale = $device.info.screen.scale
          ctx.strokeColor = $color("lightGray")
          ctx.setLineWidth(1 / scale)
          ctx.moveToPoint(0, 0)
          ctx.addLineToPoint(width, 0)
          ctx.strokePath()
        }
      },
      layout: (make, view) => {
        let pre = view.prev
        make.top.equalTo(pre)
        make.height.equalTo(1)
        make.left.right.inset(0)
      }
    }]
  }

  return week
}

function actionWeekMenu(listView, indexPath) {
  let data = listView.object(indexPath)
  let cell = listView.cell(indexPath)
  let frame = listView.runtimeValue().$convertRect_toView(cell.frame, $ui.window.runtimeValue())

  let datas = listView.data[0].rows
  let row = indexPath.row

  let isOnly = true
  if (row+1 < datas.length && datas[row+1].day == data.day)
    isOnly = false
  else if (row > 0 && datas[row-1].day == data.day)
    isOnly = false
  
  $ui.action({
    title: data["template-title"]["text"],
    message: data["template-hour"]["text"],
    actions: [{
      title: $l10n("week_modify"),
      handler: () => {
        let items = hourItems(data.day, 0, data.end)
        // From modify, find the data in indexPath
        actionWeekModify(data, frame, items, indexPath)
      }
    },
    {
      title: $l10n("week_delete"),
      style: "Destructive",
      disabled: isOnly,
      handler: () => {
        actionWeekDelete(listView, indexPath)
      }
    }]
  })
}

function actionWeekDelete(view, indexPath) {
  view.delete(indexPath)

  // Save config
  actionSaveConfiguration()
}

let actionWeekModify = weekModifyViewShow

function actionWeekInsert() {
  $picker.data({
    props: {
      items: [DAYS]
    },
    handler: data => {
      let day = ((DAYS.indexOf(data[0]) + 1) % 7).toString()
      let items = hourItems(day, 1)
      let end = items[items.length-1]

      let dataObject = {
        "template-title": {
          text: data[0]
        },
        "template-hour": {
          text: end + ":00"
        },
        "template-emoji": {
          text: ""
        },
        "template-text": {
          text: ""
        },
        day: day,
        end: end
      }

      let rootCenter = $ui.window.runtimeValue().$center()
      let rootFrame = $ui.window.frame
      let frame = $rect(0, rootCenter.y - ROWHEIGHT * 0.5, rootFrame.width, ROWHEIGHT)
      weekModifyViewShow(dataObject, frame, items)
    }
  })
}

function actionWeekSave(inputs, indexPath = null) {
  let {
    title: title,
    hour: hour,
    emoji: emoji,
    text: text,
    day: day,
    end: end
  } = inputs

  if (emoji === "" || text === "") {
    let viewCell = $("setting-week-modify").views[1]
    _general.viberate(viewCell, viewCell.frame)
    _general.haptic(2)
    return
  }

  let raw = $("setting-week-list").data
  let datas = raw[0].rows

  let newData = {
    "template-title": {
      text: title
    },
    "template-hour": {
      text: hour
    },
    "template-emoji": {
      text: emoji
    },
    "template-text": {
      text: text
    },
    day: day,
    end: end
  }

  let index = -1

  if (indexPath) {

    index = indexPath.row

    let oldData = datas[index]
    datas[index] = newData

    if (end < oldData.end) {
      index--
      while (index >= 0 && day == datas[index].day && end < datas[index].end) {
        datas[index+1] = datas[index]
        index--
      }
      datas[index+1] = newData
      index++
    } else if (end > oldData.end) {
      index++
      while (index < datas.length && day == datas[index].day && end > datas[index].end) {
        datas[index-1] = datas[index]
        index++
      }
      datas[index-1] = newData
      index--
    }

  } else {

    let i = 0
    for (; i<datas.length; i++) {
      if (day == datas[i].day) {
        index = i
        if (end < datas[i].end) break
      } else if (index != -1 && day != datas[i].day) {
        index = i
        break
      }
    }
    index = Math.max(i, index)
    datas.splice(i, 0, newData)

  }

  $("setting-week-list").data = raw
  weekModifyViewDismiss($indexPath(0, index))
  _general.haptic(1)

  // Save config
  actionSaveConfiguration()

}

function actionWeekReset() {
  $ui.action({
    title: $l10n("week_reset_title"),
    message: $l10n("week_reset_message"),
    actions: [{
      title: $l10n("week_reset"),
      style: "Destructive",
      handler: () => {
        let success = $file.copy({
          src: "configs/default_week_" + LANGUAGE + ".json",
          dst: "configs/week.json"
        })

        if (success) {
          $ui.toast($l10n("week_toast_reset"))
          let datas = $("setting-week-list").data
          datas[0].rows = getWeekData()
          $("setting-week-list").data = datas
          _general.haptic(1)
        }
      }
    }]
  })
}

function actionSaveConfiguration() {
  let datas = $("setting-week-list").data[0].rows

  let json = {"1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "0": []}
  for (let data of datas) {
    json[data.day].push({
      emoji: data["template-emoji"]["text"],
      msg: data["template-text"]["text"],
      end: data.end
    })
  }

  $file.write({
    data: $data({
      string: JSON.stringify(json)
    }),
    path: "configs/week.json"
  })
}


function weekModifyViewShow(data, frame, items, indexPath = null) {
  const viewCellObject = [{
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "label",
      props: {
        id: "setting-week-modify-title",
        text: data["template-title"]["text"],
        font: $font("PingFangSC-Medium", 13)
      },
      layout: make => {
        make.top.inset(5)
        make.left.inset(15)
      }
    },
    {
      type: "label",
      props: {
        id: "setting-week-modify-hour",
        text: data["template-hour"]["text"],
        font: $font("PingFangSC-Medium", 13)
      },
      layout: (make, view) => {
        let pre = view.prev
        make.left.equalTo(pre.right)
        make.top.equalTo(pre)
        make.right.inset(15)
      }
    },
    {
      type: "label",
      props: {
        id: "setting-week-modify-emoji",
        font: $font(13),
        align: $align.center,
        bgcolor: $color("#EEEEEE"),
        text: data["template-emoji"]["text"],
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.size.equalTo($size(30, 30))
        make.top.equalTo(pre.bottom).offset(5)
        make.left.inset(15)
      }
    },
    {
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.left.equalTo(pre.right).offset(10)
        make.top.equalTo(pre)
        make.bottom.equalTo(pre)
        make.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "setting-week-modify-text",
          text: data["template-text"]["text"],
          font: $font(13),
          align: $align.center
        },
        layout: make => {
          make.left.right.inset(10)
          make.top.bottom.inset(0)
        }
      }]
    }]
  }]


  let root = $ui.window.frame
  root.y = 0

  $ui.window.add({
    type: "view",
    props: {
      id: "setting-week-modify"
    },
    layout: $layout.fill,
    views: [{
      // viewMask
      type: "view",
      props: {
        bgcolor: $color("black"),
        alpha: 0.0
      },
      layout: $layout.fill,
      events: {
        tapped: sender => {
          $("setting-week-modify-title").runtimeValue().$fadeToText(data["template-title"]["text"])
          $("setting-week-modify-hour").runtimeValue().$fadeToText(data["template-hour"]["text"])
          $("setting-week-modify-emoji").runtimeValue().$fadeToText(data["template-emoji"]["text"])
          $("setting-week-modify-text").runtimeValue().$fadeToText(data["template-text"]["text"])
          weekModifyViewDismiss(indexPath)
        }
      }
    },
    {
      // viewCell
      type: "view",
      props: {
        bgcolor: $color("white")
      },
      layout: (make, view) => {
        make.top.equalTo(frame.y)
        make.left.right.inset(0)
        make.height.equalTo(frame.height)
        _general.shadow(view)
      },      
      views: [{
        // viewCellTop
        type: "view",
        layout: make => {
          make.left.top.right.inset(0)
          make.height.equalTo(frame.height)
        },
        views: viewCellObject
      },
      {
        type: "canvas",
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
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, height)
            ctx.addLineToPoint(width, height)
            ctx.strokePath()
          }
        }
      },
      {
        //viewCellList
        type: "list",
        props: {
          radius: 5,
          // rowHeight: 30,
          data: [{
            title: $l10n("week_hour"),
            rows: [{
              type: "label",
              props: {
                font: $font(15),
                text: data["template-hour"]["text"]
              },
              layout: make => {
                make.left.right.inset(15)
                make.top.bottom.inset(0)
              },
              events: {
                tapped: sender => {
                  inputHour($l10n("week_hour"), sender, $("setting-week-modify-hour"), [items, ["00"]])
                }
              }
            }]
          },
          {
            title: $l10n("week_emoji"),
            rows: [{
              type: "label",
              props: {
                font: $font(15),
                text: data["template-emoji"]["text"]
              },
              layout: make => {
                make.left.right.inset(15)
                make.top.bottom.inset(0)
              },
              events: {
                tapped: sender => {
                  inputEmoji($l10n("week_emoji"), sender, $("setting-week-modify-emoji"))
                }
              }
            }]
          },
          {
            title: $l10n("week_text"),
            rows: [{
              type: "label",
              props: {
                font: $font(15),
                text: data["template-text"]["text"],
                align: $align.justified,
                lineBreakMode: 4,
                lines: 2
              },
              layout: make => {
                make.left.right.inset(15)
                make.top.bottom.inset(0)
              },
              events: {
                tapped: sender => {
                  inputText($l10n("week_text"), sender, $("setting-week-modify-text"))
                }
              }
            }]
          }]
        },
        layout: (make, view) => {
          let pre = view.prev
          make.top.equalTo(pre.bottom)
          make.left.right.inset(0)
          make.bottom.inset(0)
        },
        events: {
          rowHeight: (sender, indexPath) => {
            let section = indexPath.section
            if (section === 2) return 50
            else return 30
          }
        }
      },
      {
        type: "canvas",
        layout: (make, view) => {
          let pre = view.prev
          make.top.equalTo(pre.bottom)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: (view, ctx) => {
            let width = view.frame.width
            let scale = $device.info.screen.scale
            ctx.strokeColor = $color("lightGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },
      {
        // viewCellButton
        type: "view",
        props: {
          alpha: 0.0
        },
        layout: (make, view) => {
          make.height.equalTo(50)
          make.left.bottom.right.inset(0)
          _general.shadow(view, true)
        },
        views: [{
          // Save Button
          type: "button",
          props: {
            title: `  ${$l10n("week_button_save")}  `,
            titleColor: $color("black"),
            font: $font("PingFangSC-Medium", 13),
            bgcolor: $color("white"),
            circular: true
          },
          layout: make => {
            make.height.equalTo(25)
            make.center.equalTo()
          },
          events: {
            tapped: () => {
              let inputs = {
                title: $("setting-week-modify-title").text,
                hour: $("setting-week-modify-hour").text,
                emoji: $("setting-week-modify-emoji").text,
                text: $("setting-week-modify-text").text,
                day: ((DAYS.indexOf($("setting-week-modify-title").text) + 1) % 7).toString(),
                end: parseInt($("setting-week-modify-hour").text.slice(0, 2))
              }
              actionWeekSave(inputs, indexPath)
            }
          }
        }]
      }]
    }]
  })  
  
  let viewMask = $("setting-week-modify").views[0]
  let viewCell = $("setting-week-modify").views[1]
  let viewCellList = viewCell.views[2]
  let viewCellButton = viewCell.views[4]
  
  $delay(0.0, () => {

    $ui.animate({
      duration: 0.3,
      animation: () => {
        viewMask.alpha = 0.6
        viewCell.alpha = 1.0
      }
    })
    
    viewCell.updateLayout(make => {
      make.left.right.inset(20)
      make.top.equalTo(100)
      make.height.equalTo(root.height-300)
    })
    
    viewCellList.updateLayout(make => {
      make.bottom.inset(50)
    })
  
    $ui.animate({
      duration: 0.8,
      delay: 0.15,
      damping: 0.75,
      velocity: 0,
      animation: function() {
        viewCell.super.runtimeValue().$layoutIfNeeded()
      }
    })
  
    $ui.animate({
      duration: 0.3,
      delay: 0.2,
      animation: function() {
        viewCellButton.alpha = 1.0
      }
    })
  
  })
}

function weekModifyViewDismiss(indexPath = null) {
  let rootCenter = $ui.window.runtimeValue().$center()
  let rootFrame = $ui.window.frame
  let frame = $rect(0, rootCenter.y - ROWHEIGHT * 0.5, rootFrame.width, ROWHEIGHT)
  let hasCell = false

  if (indexPath) {
    // Calculate new frame
    let listView = $("setting-week-list")
    let listRect = listView.super.runtimeValue().$convertRect_toView(listView.frame, $ui.window.runtimeValue())

    let cellRect = listView.runtimeValue().$rectForRowAtIndexPath(indexPath.runtimeValue()).rawValue()
    let cellRectInSuper = listView.runtimeValue().$convertRect_toView(cellRect, listView.super.runtimeValue())
    
    let headerRect = listView.runtimeValue().$rectForHeaderInSection(0)
    let footerRect = listView.runtimeValue().$rectForFooterInSection(0)
    let headerRectInSuper = listView.runtimeValue().$convertRect_toView(headerRect, listView.super.runtimeValue())
    let footerRectInSuper = listView.runtimeValue().$convertRect_toView(footerRect, listView.super.runtimeValue())
    
    let last = listView.data[0].rows.length - 1
    
    frame = listView.runtimeValue().$convertRect_toView(cellRect, $ui.window.runtimeValue())
    

    // Hidden in the top
    if (cellRectInSuper.y < 0) {
      frame.y = listRect.y
    }
    
    // Hidden in the bottom
    else if (cellRectInSuper.y + cellRectInSuper.height > listRect.height - SAFE_AREA_BOTTOM) {
      frame.y = listRect.y + listRect.height - ROWHEIGHT - SAFE_AREA_BOTTOM
    }
    
    if (indexPath.row === 0 && headerRectInSuper.y < 0) {
      frame.y = listRect.y + headerRect.height
    }
    
    else if (indexPath.row === last && footerRectInSuper.y + footerRectInSuper.height > listRect.height - SAFE_AREA_BOTTOM) {
      frame.y = listRect.y + listRect.height - ROWHEIGHT - SAFE_AREA_BOTTOM - footerRect.height
    }
    
    listView.scrollTo({
      indexPath: indexPath,
      animated: true
    })

    hasCell = true
  }
  
  let viewMask = $("setting-week-modify").views[0]
  let viewCell = $("setting-week-modify").views[1]
  let viewCellList = viewCell.views[2]
  let viewCellButton = viewCell.views[4]
  
  $ui.animate({
    duration: 0.3,
    animation: function() {
      viewCellButton.alpha = 0.0
    }
  })
  
  viewCellList.updateLayout(make => {
    make.bottom.inset(0)
  })
  
  viewCell.updateLayout(make => {
    make.left.right.inset(0)
    make.top.equalTo(frame.y)
    make.height.equalTo(frame.height)
  })
  
  if (hasCell) {
  
    $ui.animate({
      duration: 0.8,
      delay: 0.15,
      damping: 0.85,
      velocity: 0,
      animation: () => {
        viewCell.super.runtimeValue().$layoutIfNeeded()
      },
      completion: () => {
        $ui.animate({
          duration: 0.4,
          animation: () => {
            viewCell.alpha = 0.0
          },
          completion: () => {
            $("setting-week-modify").remove()
          }
        })
      }
    })
  
  } else {
    
    $ui.animate({
      duration: 0.8,
      delay: 0.15,
      damping: 0.85,
      velocity: 0,
      animation: () => {
        viewCell.super.runtimeValue().$layoutIfNeeded()
        viewCell.alpha = 0.0
      },
      completion: () => {
        $("setting-week-modify").remove()
      }
    })
    
  }
  
  $ui.animate({
    duration: 0.3,
    delay: 0.5,
    animation: () => {
      viewMask.alpha = 0.0
    }
  })
}


function weekGuideViewToggle(show = true) {
  let inset = show ? 5 : -131

  let guideView = $("setting-week").views[0]
  guideView.updateLayout(make => {
    make.top.inset(inset)
  })

  $ui.animate({
    duration: 0.3,
    animation: () => {
      guideView.super.runtimeValue().$layoutIfNeeded()
    }
  })
}

function compare(obj1, obj2) {
  if (obj1.day < obj2.day && obj1.day != 0)
    return -1
  else if (obj1.day < obj2.day && obj1.day == 0)
    return 1
  else if (obj1.day > obj2.day && obj2.day != 0)
    return 1
  else if (obj1.day > obj2.day && obj2.day == 0)
    return -1
  else {
    if (obj1.end < obj2.end) return -1
    else if (obj1.end > obj2.end) return 1
    else return 0
  }
}

function inputHour(placeholder, fromView, toView, pickerItems) {
  $picker.data({
    props: {
      items: pickerItems
    },
    handler: (data) => {
      toView.runtimeValue().$fadeToText(data.join(":"))
      fromView.runtimeValue().$fadeToText(data.join(":"))
    }
  })
}

function inputEmoji(placeholder, fromView, toView) {
  $input.text({
    placeholder: placeholder,
    text: fromView.text,
    handler: text => {
      // Check inputs
      // [\ud800-\udbff][\udc00-\udfff]
      if (_general.isEmojiOnly(text) === false) {
        let listView = $("setting-week-modify").views[1].views[2]
        let cell = listView.cell($indexPath(1, 0))
        _general.viberate(cell, cell.frame)
        _general.haptic(2)
        return
      }

      toView.runtimeValue().$fadeToText(text)
      fromView.runtimeValue().$fadeToText(text)
    }
  })
}

function inputText(placeholder, fromView, toView) {
  $input.text({
    placeholder: placeholder,
    text: fromView.text,
    handler: text => {
      // Check inputs
      if (text.length === 0) {
        let listView = $("setting-week-modify").views[1].views[2]
        let cell = listView.cell($indexPath(2, 0))
        _general.viberate(cell, cell.frame)
        _general.haptic(2)
        return
      }
      
      toView.runtimeValue().$fadeToText(text)
      fromView.runtimeValue().$fadeToText(text)
    }
  })
}


// flag: stands for picker items, modify => 0, insert => 1
function hourItems(day, flag, currentEnd = null) {
  let items = HOURS.slice()
  let datas = $("setting-week-list").data[0].rows

  for (let i=datas.length-1; i>=0; i--) {
    if (datas[i].day == day) {
      // From modify action
      if (flag === 0 && datas[i].end == currentEnd)
        continue

      items.splice(datas[i].end-1, 1)
    }
  }

  return items
}


module.exports = {
  object: weekObject
}
