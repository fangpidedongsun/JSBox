const _general = require("../general")

/*********: Month View :**************/

if (!$file.exists("configs/month.json")) {
  $file.copy({
    src: "configs/default_month.json",
    dst: "configs/month.json"
  })
}

const COLORS = [
  $color("#93B881"), // Date
  $color("#3A8FB7") // Event
]

const ROWHEIGHT = 100
const SAFE_AREA_BOTTOM = $device.isIphoneX ? 34 : 0

let DISPLAY_INDEX = 0

const TODAY = `${new Date().getFullYear()}-${prefixZero(new Date().getMonth()+1)}-${prefixZero(new Date().getDate())}`

const MONTH_TEMPLATE = {
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
        id: "template-count",
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
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.height.equalTo(30)
        make.top.equalTo(pre.bottom).offset(5)
        make.left.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "template-date",
          font: $font(13),
          align: $align.center
        },
        layout: make => {
          make.left.right.inset(10)
          make.top.bottom.inset(0)
        }
      }]
    },
    {
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.height.equalTo(30)
        make.top.equalTo(pre.bottom).offset(5)
        make.left.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "template-event",
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

function monthObject() {
  let monthData = getMonthData()

  let month = {
    type: "view",
    props: {
      id: "setting-month"
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
        make.height.equalTo(150)
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
              text: "Today",
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
              text: "0",
              font: $font("PingFangSC-Medium", 13),
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
            type: "view",
            props: {
              bgcolor: $color("#EEEEEE"),
              borderWidth: 1,
              borderColor: COLORS[0],
              circular: true
            },
            layout: (make, view) => {
              let pre = view.prev
              make.height.equalTo(30)
              make.top.equalTo(pre.bottom).offset(5)
              make.left.right.inset(15)
            },
            views: [{
              type: "label",
              props: {
                font: $font(13),
                align: $align.center,
                bgcolor: $color("#EEEEEE"),
                text: TODAY,
                
              },
              layout: make => {
                make.left.right.inset(10)
                make.top.bottom.inset(0)
              }
            }]
          },
          {
            type: "view",
            props: {
              bgcolor: $color("#EEEEEE"),
              borderWidth: 1,
              borderColor: COLORS[1],
              circular: true
            },
            layout: (make, view) => {
              let pre = view.prev
              make.height.equalTo(30)
              make.top.equalTo(pre.bottom).offset(5)
              make.left.right.inset(15)
            },
            views: [{
              type: "label",
              props: {
                text: $l10n("month_guide_text"),
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
            attributedText: _general.attributedString(`◉ ${$l10n("month_guide_discription_date")}\n◉ ${$l10n("month_guide_discription_title")}`, COLORS)
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
          id: "setting-month-list",
          template: MONTH_TEMPLATE,
          rowHeight: ROWHEIGHT,
          reorder: true,
          crossSections: false,
          data: [{
            title: $l10n("month_list_display"),
            rows: monthData.display
          },
          {
            title: $l10n("month_list_history"),
            rows: monthData.records
          }],
          // Insert Button
          footer: {
            type: "view",
            props: {
              height: 50
            },
            views: [{
              type: "view",
              layout: (make, view) => {
                make.left.top.bottom.right.inset(0)
                _general.shadow(view, true)
              },
              views: [{
                // Insert Button
                type: "button",
                props: {
                  title: `  ${$l10n("month_button_insert")}  `,
                  titleColor: $color("black"),
                  font: $font("PingFang-SC-Medium", 13),
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
                    actionMonthInsert()
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
            if (indexPath.section === 0) return
            actionMonthMenu(sender, indexPath)
          },
          canMoveItem: (sender, indexPath) => {
            return indexPath.section > 0
          },
          reorderMoved: (from, to) => {
            if (from.row === DISPLAY_INDEX) {
              DISPLAY_INDEX = to.row
            } else if (to.row === DISPLAY_INDEX) {
              DISPLAY_INDEX = from.row
            }
          },
          reorderFinished: (data) => {
            // Save config
            actionSaveConfiguration()
          },

          // willBeginDragging: (sender) => {
          //   let y = sender.contentOffset.y
          //   SCROLL_OFFSET = y
          // },
          // willEndDragging: (sender, velocity) => {
          //   console.info(velocity)
          //   let y = sender.contentOffset.y
          //   if (y - SCROLL_OFFSET > 0)
          //     monthGuideViewToggle(false)
          //   else if (y - SCROLL_OFFSET < 0)
          //     monthGuideViewToggle(true)
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

  return month
}

function getMonthData() {
  let confs = JSON.parse($file.read("configs/month.json").string)
  
  let recordsData = []
  for (let conf of confs.records) {
    let count = countDays(conf)
    recordsData.push({
      "template-title": {
        text: conf.event
      },
      "template-count": {
        text: count.toString()
      },
      "template-date": {
        text: `${conf.year}-${prefixZero(conf.month+1)}-${prefixZero(conf.date)}`
      },
      "template-event": {
        text: conf.event
      },
      year: conf.year,
      month: conf.month,
      date: conf.date
    })
  }
  
  let displayData = [recordsData[confs.display]]
  
  // Save display index
  DISPLAY_INDEX = confs.display

  return {
    display: displayData,
    records: recordsData
  }
}

function actionMonthMenu(listView, indexPath) {
  let data = listView.object(indexPath)
  let cell = listView.cell(indexPath)
  let frame = listView.runtimeValue().$convertRect_toView(cell.frame, $ui.window.runtimeValue())
  
  $ui.action({
    title: data["template-title"]["text"],
    message: data["template-date"]["text"],
    actions: [{
      title: $l10n("month_modify"),
      handler: () => {
        // From modify, find the data in indexPath
        actionMonthModify(data, frame, indexPath)
      }
    },
    {
      title: $l10n("month_display"),
      handler: () => {
        actionMonthDisplay(listView, indexPath)
      }
    },
    {
      title: $l10n("month_delete"),
      style: "Destructive",
      disabled: indexPath.row === DISPLAY_INDEX,
      handler: () => {
        actionMonthDelete(listView, indexPath)
      }
    }]
  })
}

function actionMonthDelete(view, indexPath) {
  if (indexPath.row < DISPLAY_INDEX)
    DISPLAY_INDEX--
  
  view.delete(indexPath)

  // Save config
  actionSaveConfiguration()
}

let actionMonthModify = monthModifyViewShow

function actionMonthDisplay(view, indexPath) {
  DISPLAY_INDEX = indexPath.row
  
  let data = view.data
  data[0].rows[0] = view.object(indexPath)
  view.data = data
  _general.haptic(1)

  // Save config
  actionSaveConfiguration(true)
}

function actionMonthInsert() {
  let now = new Date()
  let dataObject = {
    "template-title": {
      text: "Big Day"
    },
    "template-count": {
      text: "0"
    },
    "template-date": {
      text: TODAY
    },
    "template-event": {
      text: ""
    },
    year: now.getFullYear(),
    month: prefixZero(now.getMonth()+1),
    date: prefixZero(now.getDate())
  }

  let rootCenter = $ui.window.runtimeValue().$center()
  let rootFrame = $ui.window.frame
  let frame = $rect(0, rootCenter.y - ROWHEIGHT * 0.5, rootFrame.width, ROWHEIGHT)
  $delay(0.0, () => {
    monthModifyViewShow(dataObject, frame)
  })
}

function actionMonthSave(inputs, indexPath = null) {
  let {
    event: event,
    count: count,
    fullDate: fullDate,
    year: year,
    month: month,
    date: date
  } = inputs

  if (event === "") {
    let viewCell = $("setting-month-modify").views[1]
    _general.viberate(viewCell, viewCell.frame)
    _general.haptic(2)
    return
  }

  let raw = $("setting-month-list").data
  let datas = raw[1].rows

  let newData = {
    "template-title": {
      text: event
    },
    "template-count": {
      text: count
    },
    "template-date": {
      text: fullDate
    },
    "template-event": {
      text: event
    },
    year: year,
    month: month,
    date: date
  }

  let index = -1
  if (indexPath) {
    index = indexPath.row
    datas[index] = newData
    
    if (indexPath.row === DISPLAY_INDEX) {
      raw[0].rows[0] = newData
    }
  } else {
    index = datas.length
    datas.splice(datas.length, 0, newData)
  }

  $("setting-month-list").data = raw
  monthModifyViewDismiss($indexPath(1, index))
  _general.haptic(1)

  // Save config
  actionSaveConfiguration()
  
}

function actionSaveConfiguration(isDisplayOnly = false) {
  let datas = $("setting-month-list").data
  let records = datas[1].rows

  let file = JSON.parse($file.read("configs/month.json").string)
  let json = {"display": DISPLAY_INDEX, "records": file.records}

  if (!isDisplayOnly) {
    let arr = []
    for (let data of records) {
      arr.push({
        event: data["template-event"]["text"],
        year: data.year,
        month: data.month,
        date: data.date
      })
    }
    json["records"] = arr
  }

  $file.write({
    data: $data({
      string: JSON.stringify(json)
    }),
    path: "configs/month.json"
  })

  $cache.remove("progress-month-data")
}


function monthModifyViewShow(data, frame, indexPath = null) {
  const viewCellObject = [{
    type: "view",
    layout: $layout.fill,
    views: [{
      type: "label",
      props: {
        id: "setting-month-modify-title",
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
        id: "setting-month-modify-count",
        text: data["template-count"]["text"],
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
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.height.equalTo(30)
        make.top.equalTo(pre.bottom).offset(5)
        make.left.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "setting-month-modify-date",
          text: data["template-date"]["text"],
          font: $font(13),
          align: $align.center
        },
        layout: make => {
          make.left.right.inset(10)
          make.top.bottom.inset(0)
        }
      }]
    },
    {
      type: "view",
      props: {
        bgcolor: $color("#EEEEEE"),
        circular: true
      },
      layout: (make, view) => {
        let pre = view.prev
        make.height.equalTo(30)
        make.top.equalTo(pre.bottom).offset(5)
        make.left.right.inset(15)
      },
      views: [{
        type: "label",
        props: {
          id: "setting-month-modify-event",
          text: data["template-event"]["text"],
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
      id: "setting-month-modify"
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
          $("setting-month-modify-title").runtimeValue().$fadeToText(data["template-title"]["text"])
          $("setting-month-modify-count").runtimeValue().$fadeToText(data["template-count"]["text"])
          $("setting-month-modify-date").runtimeValue().$fadeToText(data["template-date"]["text"])
          $("setting-month-modify-event").runtimeValue().$fadeToText(data["template-event"]["text"])
          monthModifyViewDismiss(indexPath)
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
            title: $l10n("month_date"),
            rows: [{
              type: "label",
              props: {
                font: $font(15),
                text: data["template-date"]["text"]
              },
              layout: make => {
                make.left.right.inset(15)
                make.top.bottom.inset(0)
              },
              events: {
                tapped: sender => {
                  inputDate($l10n("month_date"), sender, $("setting-month-modify-date"))
                }
              }
            }]
          },
          {
            title: $l10n("month_title"),
            rows: [{
              type: "label",
              props: {
                font: $font(15),
                text: data["template-event"]["text"],
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
                  inputEvent($l10n("month_title"), sender, $("setting-month-modify-event"))
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
            if (section === 1) return 50
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
            title: `  ${$l10n("month_button_save")}  `,
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
              let date = $("setting-month-modify-date").text.split("-")
              let inputs = {
                title: $("setting-month-modify-title").text,
                count: $("setting-month-modify-count").text,
                fullDate: $("setting-month-modify-date").text,
                event: $("setting-month-modify-event").text,
                year: parseInt(date[0]),
                month: parseInt(date[1])-1,
                date: parseInt(date[2])
              }
              actionMonthSave(inputs, indexPath)
            }
          }
        }]
      }]
    }]
  })  
  
  let viewMask = $("setting-month-modify").views[0]
  let viewCell = $("setting-month-modify").views[1]
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

function monthModifyViewDismiss(indexPath = null) {
  let rootCenter = $ui.window.runtimeValue().$center()
  let rootFrame = $ui.window.frame
  let frame = $rect(0, rootCenter.y - ROWHEIGHT * 0.5, rootFrame.width, ROWHEIGHT)
  let hasCell = false

  if (indexPath) {
    // Calculate new frame
    let listView = $("setting-month-list")
    let listRect = listView.super.runtimeValue().$convertRect_toView(listView.frame, $ui.window.runtimeValue())

    let cellRect = listView.runtimeValue().$rectForRowAtIndexPath(indexPath.runtimeValue()).rawValue()
    let cellRectInSuper = listView.runtimeValue().$convertRect_toView(cellRect, listView.super.runtimeValue())
    
    let headerRect = listView.runtimeValue().$rectForHeaderInSection(1)
    let footerRect = listView.runtimeValue().$rectForFooterInSection(1)
    let headerRectInSuper = listView.runtimeValue().$convertRect_toView(headerRect, listView.super.runtimeValue())
    let footerRectInSuper = listView.runtimeValue().$convertRect_toView(footerRect, listView.super.runtimeValue())
    
    let last = listView.data[1].rows.length - 1
    
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
  
  let viewMask = $("setting-month-modify").views[0]
  let viewCell = $("setting-month-modify").views[1]
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
            $("setting-month-modify").remove()
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
        $("setting-month-modify").remove()
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

function inputDate(placeholder, fromView, toView) {
  $picker.date({
    props:{
      date: new Date(fromView.text),
      mode: 1
    },
    handler: date => {
      let fullDate = `${date.getFullYear()}-${prefixZero(date.getMonth()+1)}-${prefixZero(date.getDate())}`
      let config = {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate()
      }
      let count = countDays(config).toString()

      toView.runtimeValue().$fadeToText(fullDate)
      fromView.runtimeValue().$fadeToText(fullDate)
      $("setting-month-modify-count").runtimeValue().$fadeToText(count)
    }
  })
}

function inputEvent(placeholder, fromView, toView) {
  $input.text({
    placeholder: placeholder,
    text: fromView.text,
    handler: text => {
      // Check inputs
      if (text.length === 0) {
        let listView = $("setting-month-modify").views[1].views[2]
        let cell = listView.cell($indexPath(1, 0))
        _general.viberate(cell, cell.frame)
        _general.haptic(2)
        return
      }
      
      toView.runtimeValue().$fadeToText(text)
      fromView.runtimeValue().$fadeToText(text)
      $("setting-month-modify-title").runtimeValue().$fadeToText(text)
    }
  })
}

function countDays(config) {
  let date = new Date()

  let start = new Date(date.getFullYear(), date.getMonth(), 1)
  let end = new Date(config.year, config.month, config.date)
  // 100*60*60*24
  return (date.getDate()-1) - (end-start)/86400000
}

function prefixZero(num) {
  return (Array(2).join(0) + num).slice(-2)
}


module.exports = {
  object: monthObject
}
