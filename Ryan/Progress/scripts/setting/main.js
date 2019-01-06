const _home = require("./home.js")
const _settings = require("./settings.js")

function mainView() {
  $ui.render({
    props: {
      navButtons: [
        {
          icon: "054",
          handler: () => {
            readme()
          }
        }
      ]
    },
    views: [
      {
        type: "matrix",
        props: {
          id: "menu",
          itemHeight: 50,
          columns: 2,
          spacing: 0,
          scrollEnabled: false,
          selectable: false,
          template: [
            {
              // Button Image
              type: "image",
              props: {
                id: "menu_image",
                bgcolor: $color("clear")
              },
              layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.width.height.equalTo(25)
                make.top.inset(7)
              }
            },
            {
              type: "label",
              props: {
                id: "menu_label",
                font: $font("PingFangTC-Semibold", 10),
                textColor: $color("lightGray")
              },
              layout: function(make, view) {
                var preView = view.prev
                make.centerX.equalTo(preView)
                make.top.equalTo(preView.bottom).offset(3)
              }
            }
          ],
          data: [
            {
              menu_image: {
                icon: $icon("137", $color("clear"), $size(72, 72)),
                tintColor: $color("tint")
              },
              menu_label: {
                text: $l10n("menu_home"),
                textColor: $color("tint")
              }
            },
            {
              menu_image: {
                icon: $icon("002", $color("clear"), $size(72, 72)),
                tintColor: $color("lightGray")
              },
              menu_label: {
                text: $l10n("menu_settings")
              }
            }
          ]
        },
        layout: function(make, view) {
          var sup = view.super
          make.height.equalTo(50)

          if ($device.isIphoneX) {
            make.bottom.equalTo(sup.safeAreaBottom)
          } else {
            make.bottom.equalTo(0)
          }

          make.left.right.inset(0)
        },
        events: {
          didSelect: function(sender, indexPath) {
            activeMenu(indexPath.row)
          }
        }
      },
      {
        type: "canvas",
        layout: (make, view) => {
          let pre = view.prev
          make.top.equalTo(pre.top)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: (view, ctx) => {
            let width = view.frame.width
            let scale = $device.info.screen.scale
            ctx.strokeColor = $color("gray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },
      {
        type: "view",
        props: {
          id: "content"
        },
        layout: function(make, view) {
          let bottom = $("menu")
          make.bottom.equalTo(bottom.top)
          make.left.top.right.inset(0)
        },
        views: [
          _home.object,
          _settings.object
        ]
      }
    ]
  })
}

function activeMenu(index) {
  const trans = ["home", "settings"]
  let dstViewId = trans[index]
  let views = $("content").views
  let viewId = ""
  for (let i in views) {
    if (views[i].hidden === false) {
      viewId = trans[i]
      break
    }
  }

  if (dstViewId !== viewId) {
    for (let i = 0; i < 2; i++) {
      $("menu").cell($indexPath(0, i)).views[0].views[0].tintColor = index == i ? $color("tint") : $color("lightGray")
      $("menu").cell($indexPath(0, i)).views[0].views[1].textColor = index == i ? $color("tint") : $color("lightGray")
    }
    $(viewId).hidden = true
    $(dstViewId).hidden = false
  }
}

function readme() {
  $ui.push({
    props: {
      title: "README"
    },
    views: [{
      type: "markdown",
      props: {
        content: $file.read("README.md").string
      },
      layout: $layout.fill
    }]
  })
}

module.exports = {
  view: mainView
}
