const _week = require("./setting-week.js")
const _month = require("./setting-month.js")
const _year = require("./setting-year.js")
const _general = require("../general.js")

const TEMPLATE = {
  props: {
    accessoryType: 1
  },
  views: [
    {
      type: "label",
      props: {
        id: "template-setup"
      },
      layout: (make, view) => {
        make.top.bottom.inset(0)
        make.left.inset(15)
      }
    }
  ]
}

function settingsObject() {
  let data = [
    {
      title: $l10n("settings_progress"),
      rows: [
        {
          "template-setup": {
            text: $l10n("settings_week")
          }
        },
        {
          "template-setup": {
            text: $l10n("settings_month")
          }
        },
        {
          "template-setup": {
            text: $l10n("settings_year")
          }
        }
      ]
    },
    {
      title: $l10n("settings_general"),
      rows: [
        {
          "template-setup": {
            text: $l10n("settings_clear_cache")
          }
        },
        {
          "template-setup": {
            text: $l10n("settings_website")
          }
        }
      ]
    }
  ]

  let settings = {
    type: "list",
    props: {
      id: "settings",
      hidden: true,
      showsVerticalIndicator: false,
      data: data,
      template: TEMPLATE,
      footer: {
        type: "view",
        props: {
          height: 50
        },
        views: [
          {
            type: "label",
            props: {
              text: $l10n("settings_footer") + $addin.current.version,
              lines: 0,
              font: $font(12),
              textColor: $color("#AAAAAA"),
              align: $align.center
            },
            layout: function(make) {
              make.left.top.right.inset(0)
            }
          }
        ]
      }
    },
    layout: $layout.fill,
    events: {
      didSelect: function(view, indexPath) {
        activeSettingMenu(indexPath)
      }
    }
  }

  return settings
}

function activeSettingMenu(indexPath) {
  let section = indexPath.section
  let row = indexPath.row

  switch (section) {
    case 0:
      switch (row) {
        case 0:
          $ui.push({
            props: {
              navButtons: [{
                icon: "054",
                handler: () => {
                  readme()
                }
              }]
            },
            views: [_week.object()]
          })
          break
          
        case 1:
          $ui.push({
            props: {
              navButtons: [{
                icon: "054",
                handler: () => {
                  readme()
                }
              }]
            },
            views: [_month.object()]
          })
          break
          
        case 2:
          _year.update()
          break
          
        default:
          break
      }
      break

    case 1:
      switch (row) {
        case 0:
          $cache.clear()
          $ui.toast($l10n("settings_toast_clear_cache"))
          _general.haptic(1)
          break
          
        case 1:
          $safari.open({
            url: "https://www.ryannn.com"
          })
          break

        default:
          break
      }
      break

    default:
      break
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
  object: settingsObject()
}
