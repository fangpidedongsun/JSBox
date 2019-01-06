var _main = require("scripts/action_main")
var _qiniu = require("scripts/action_qiniu")
var _setting = require("scripts/action_setting")

String.prototype.isKey = function() {
  return /^[0-9a-zA-Z_-]{35,}$/.test(this)
}

function generateMainViewObjects() {
  home = {
    type: "list",
    props: {
      id: "home",
      hidden: false,
      rowHeight: 65,
      template: [{
          type: "label",
          props: {
            id: "fname",
            autoFontSize: true,
            font: $font("bold", 18),
            textColor: $color("darkGray")
          },
          layout: function(make) {
            make.left.top.right.inset(10)
          }
        },
        {
          type: "label",
          props: {
            id: "type",
            font: $font(13),
            textColor: $color("lightGray")
          },
          layout: function(make, view) {
            var pre = view.prev
            make.top.equalTo(pre.bottom).offset(5)
            make.left.inset(10)
          }
        },
        {
          type: "label",
          props: {
            id: "size",
            font: $font(13),
            textColor: $color("lightGray")
          },
          layout: function(make, view) {
            var pre = view.prev
            make.top.equalTo(pre)
            make.right.inset(20)
          }
        }
      ],
      footer: {
        type: "view",
        props: {
          height: 40
        },
        layout: $layout.fill,
        views: [{
            type: "label",
            props: {
              id: "footer",
              hidden: true,
              text: "- " + $l10n("no_more_data") + " -",
              font: $font(12),
              textColor: $color("#AAAAAA"),
              align: $align.center
            },
            layout: $layout.fill
          },
          {
            type: "spinner",
            layout: $layout.center
          }
        ]
      },
      actions: [{
        title: $l10n("action_manage"),
        handler: function(sender, indexPath) {
          _main.showManage(sender, indexPath)
        }
      }]
    },
    layout: $layout.fill,
    events: {
      didSelect: function(sender, indexPath) {
        _main.showMenu(sender, indexPath)
      },
      pulled: function(sender) {
        _main.updateInfo("search", "")
        _qiniu.fetch("reload")
      },
      didReachBottom: function(sender) {
        var prefix = $ui.window.info ? $ui.window.info.search : ""
        _qiniu.loadMore(sender, prefix)
      }
    }
  }

  // Downloads View Object
  downloads = {
    type: "list",
    props: {
      id: "downloads",
      hidden: true,
      rowHeight: 65,
      template: [{
          type: "label",
          props: {
            id: "fname",
            autoFontSize: true,
            font: $font("bold", 18),
            textColor: $color("darkGray")
          },
          layout: function(make) {
            make.left.top.right.inset(10)
          }
        },
        {
          type: "label",
          props: {
            id: "type",
            font: $font(13),
            textColor: $color("lightGray")
          },
          layout: function(make, view) {
            var pre = view.prev
            make.top.equalTo(pre.bottom).offset(5)
            make.left.inset(10)
          }
        },
        {
          type: "label",
          props: {
            id: "size",
            font: $font(13),
            textColor: $color("lightGray")
          },
          layout: function(make, view) {
            var pre = view.prev
            make.top.equalTo(pre)
            make.right.inset(20)
          }
        }
      ],
      actions: [{
          title: "Delete",
          handler: function(sender, indexPath) {
            var file = DOWNLOADS_FILE[indexPath.row]
            $file.delete("downloads/" + file)
            DOWNLOADS_FILE = $file.list("downloads").sort()
            if (DOWNLOADS_FILE.length === 0) {
              $("no-downloads").hidden = false
            }
          }
        },
        {
          title: $l10n("action_share"),
          handler: function(sender, indexPath) {
            var file = sender.object(indexPath).fname.text
            $share.sheet([file, $file.read("downloads/" + file)])
          }
        }
      ],
      data: DOWNLOADS_FILE.map(function(d) {
        var file = $file.read("downloads/" + d)
        return {
          fname: {
            text: d
          },
          type: {
            text: $l10n("type") + file.info.mimeType
          },
          size: {
            text: $l10n("size") + file.info.size.bytes()
          }
        }
      })
    },
    layout: $layout.fill,
    events: {
      didSelect: function(sender, indexPath) {
        $quicklook.open({
          data: $file.read("downloads/" + sender.object(indexPath).fname.text)
        })
      }
    },
    views: [{
      type: "label",
      props: {
        id: "no-downloads",
        lines: 0,
        align: $align.center,
        hidden: DOWNLOADS_FILE.length === 0 ? false : true,
        font: $font("bold", 18),
        textColor: $color("gray"),
        text: $l10n("no_downloads")
      },
      layout: $layout.center
    }]
  }

  // Setting View Object
  setting = {
    type: "list",
    props: {
      id: "setting",
      hidden: true,
      showsVerticalIndicator: false,
      data: [{
          title: $l10n("setting_keys"),
          rows: [{
              type: "views",
              layout: $layout.fill,
              views: [{
                  type: "label",
                  props: {
                    text: "SK",
                    textColor: $color("darkGray")
                  },
                  layout: function(make) {
                    make.centerY.equalTo()
                    make.width.equalTo(100)
                    make.left.inset(15)
                  }
                },
                {
                  type: "input",
                  props: {
                    id: "SK",
                    secure: true,
                    bgcolor: $color("clear"),
                    align: $align.right,
                    clearButtonMode: 0,
                    placeholder: $l10n("setting_sk"),
                    text: SETTING_FILE[0][0],
                    textColor: $color("darkGray")
                  },
                  layout: function(make, view) {
                    var pre = view.prev
                    make.left.equalTo(pre.right)
                    make.top.bottom.inset(0)
                    make.right.inset(15)
                  },
                  events: {
                    returned: function(sender) {
                      sender.blur()
                    },
                    didEndEditing: function(sender) {
                      var text = sender.text
                      if (!text.isKey()) {
                        $ui.error($l10n("error_key"))
                        return
                      }
                      _setting.save(0, 0, text)
                      if (SETTING_FILE[0][0] && SETTING_FILE[0][1]) {
                        _setting.defaultSetting()
                      }
                    }
                  }
                }
              ]
            },
            {
              type: "views",
              layout: $layout.fill,
              views: [{
                  type: "label",
                  props: {
                    text: "AK",
                    textColor: $color("darkGray")
                  },
                  layout: function(make) {
                    make.centerY.equalTo()
                    make.width.equalTo(100)
                    make.left.inset(15)
                  }
                },
                {
                  type: "input",
                  props: {
                    id: "AK",
                    secure: true,
                    bgcolor: $color("clear"),
                    align: $align.right,
                    clearButtonMode: 0,
                    placeholder: $l10n("setting_ak"),
                    text: SETTING_FILE[0][1],
                    textColor: $color("darkGray")
                  },
                  layout: function(make, view) {
                    var pre = view.prev
                    make.left.equalTo(pre.right)
                    make.top.bottom.inset(0)
                    make.right.inset(15)
                  },
                  events: {
                    returned: function(sender) {
                      sender.blur()
                    },
                    didEndEditing: function(sender) {
                      var text = sender.text
                      if (!text.isKey()) {
                        $ui.error($l10n("error_key"))
                        return
                      }
                      _setting.save(0, 1, text)
                      if (SETTING_FILE[0][0] && SETTING_FILE[0][1]) {
                        _setting.defaultSetting()
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          title: $l10n("setting_settings"),
          rows: [{
              setup: {
                text: $l10n("region")
              }
            },
            {
              setup: {
                text: $l10n("bucket")
              }
            },
            {
              setup: {
                text: $l10n("domain")
              }
            },
            {
              setup: {
                text: $l10n("manage_website")
              }
            }
          ]
        },
        {
          title: $l10n("setting_about"),
          rows: [{
              setup: {
                text: $l10n("personal_website")
              }
            },
            {
              setup: {
                text: $l10n("tutorial")
              }
            },
            {
              setup: {
                text: $l10n("version")
              }
            }
          ]
        }
      ],
      template: {
        props: {
          accessoryType: 1
        },
        views: [{
          type: "label",
          props: {
            id: "setup",
            textColor: $color("darkGray")
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.inset(15)
          }
        }]
      },
      footer: {
        type: "view",
        props: {
          height: 50
        },
        views: [{
          type: "label",
          props: {
            text: $l10n("setting_footer") + $addin.current.version,
            lines: 0,
            font: $font(12),
            textColor: $color("#AAAAAA"),
            align: $align.center
          },
          layout: function(make) {
            make.left.top.right.inset(0)
          }
        }]
      }
    },
    layout: $layout.fill,
    events: {
      didSelect: function(view, indexPath) {
        _setting.activeMenu(indexPath)
      }
    }
  }
}

function mainView() {
  $ui.render({
    props: {
      navButtons: [{
        icon: "129",
        handler: function() {
          if ($("popover")) dismissPopoverView()
          else if ($("home").hidden === false) presentPopoverView()
        }
      }]
    },
    views: [{
        type: "matrix",
        props: {
          id: "menu",
          itemHeight: 50,
          columns: 3,
          spacing: 0,
          scrollEnabled: false,
          selectable: false,
          //bgcolor: $rgb(247, 247, 247),
          template: [{
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
              },
            },
            {
              type: "label",
              props: {
                id: "menu_label",
                hidden: $app.env != $env.app,
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
          data: [{
              menu_image: {
                icon: $icon("019", $color("clear"), $size(72, 72)),
                tintColor: $color("tint")
              },
              menu_label: {
                text: $l10n("menu_home"),
                textColor: $color("tint")
              }
            },
            {
              menu_image: {
                icon: $icon("062", $color("clear"), $size(72, 72)),
                tintColor: $color("lightGray")
              },
              menu_label: {
                text: $l10n("menu_downloads")
              }
            },
            {
              menu_image: {
                icon: $icon("002", $color("clear"), $size(72, 72)),
                tintColor: $color("lightGray")
              },
              menu_label: {
                text: $l10n("menu_setting")
              }
            }
          ]
        },
        layout: function(make, view) {
          var sup = view.super
          
          if ($app.env != $env.app) {
            make.height.equalTo(40)
          } else {
            make.height.equalTo(50)
          }
          
          if ($device.isIphoneX) {
            make.bottom.equalTo(sup.safeAreaBottom)
          } else {
            make.bottom.equalTo(0)
          }
          
          make.left.right.inset(0)
        },
        events: {
          didSelect: function(sender, indexPath) {
            _main.activeMenu(indexPath.row)
          }
        }
      },
      {
        type: "canvas",
        layout: function(make, view) {
          var preView = view.prev
          make.top.equalTo(preView.top)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
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
        layout: function(make) {
          var preView = $("menu")
          make.bottom.equalTo(preView.top)
          make.left.top.right.inset(0)
        },
        views: [home, downloads, setting]
      }
    ]
  })
}

/*
 * Popover view
 */
function presentPopoverView() {
  $ui.window.add({
    type: "view",
    props: {
      id: "popover"
    },
    layout: $layout.fill,
    views: [{
        type: "view",
        props: {
          id: "popover_mask",
          bgcolor: $color("black"),
          alpha: 0
        },
        layout: $layout.fill,
        events: {
          tapped: function(sender) {
            dismissPopoverView()
          }
        }
      },
      {
        type: "view",
        props: {
          id: "popover_setting",
          alpha: 0,
          bgcolor: $color("white")
        },
        layout: function(make, view) {
          var sup = view.super
          make.height.equalTo(135) //40x3+15
          make.centerY.equalTo(sup.safeAreaCenterY)
          make.left.right.inset(20)
          shadow(view)
        },
        views: [{
          type: "list",
          layout: function(make) {
            make.left.right.inset(0)
            make.bottom.inset(10)
            make.top.inset(5)
          },
          props: {
            separatorHidden: true,
            scrollEnabled: false,
            rowHeight: 40,
            data: [{
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "label",
                    props: {
                      text: $l10n("search"),
                      textColor: $color("darkGray"),
                      font: $font("bold", 18)
                    },
                    layout: function(make) {
                      make.width.equalTo(100)
                      make.left.inset(10)
                      make.top.bottom.inset(0)
                    }
                  },
                  {
                    type: "input",
                    props: {
                      bgcolor: $color("white"),
                      align: $align.right,
                      placeholder: $l10n("setting_search"),
                      text: $ui.window.info ? $ui.window.info.search : "",
                      textColor: $color("darkGray")
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.left.equalTo(pre.right)
                      make.right.inset(10)
                      make.top.bottom.inset(0)
                    },
                    events: {
                      didBeginEditing: function(sender) {
                        _main.updateLayout()
                      },
                      returned: function(sender) {
                        sender.blur()
                        _main.updateInfo("search", sender.text)
                        _qiniu.search(sender.text)
                        dismissPopoverView()
                      }
                    }
                  }
                ]
              },
              {
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "label",
                    props: {
                      text: $l10n("sort"),
                      textColor: $color("darkGray"),
                      font: $font("bold", 18)
                    },
                    layout: function(make) {
                      make.top.bottom.inset(0)
                      make.left.inset(10)
                    }
                  },
                  {
                    type: "tab",
                    props: {
                      items: [$l10n("item_name"), $l10n("item_type"), $l10n("item_size"), $l10n("item_time")],
                      index: $ui.window.info ? $ui.window.info.sort : 0
                    },
                    layout: function(make) {
                      make.centerY.equalTo()
                      make.right.inset(10)
                    },
                    events: {
                      changed: function(sender) {
                        _main.updateInfo("sort", sender.index)
                        _qiniu.reorder()
                      }
                    }
                  }
                ]
              },
              {
                type: "tab",
                props: {
                  items: [$l10n("item_ascend"), $l10n("item_descend")],
                  index: $ui.window.info ? $ui.window.info.order : 0
                },
                layout: function(make) {
                  make.centerY.equalTo()
                  make.right.inset(10)
                },
                events: {
                  changed: function(sender) {
                    _main.updateInfo("order", sender.index)
                    _qiniu.reorder()
                  }
                }
              }
            ]
          }
        }]
      }
    ]
  })

  $("popover_setting").scale(1.1)

  $ui.animate({
    duration: 0.2,
    animation: function() {
      $("popover_mask").alpha = 0.3
      $("popover_setting").alpha = 1
      $("popover_setting").scale(1)
    }
  })
}

function dismissPopoverView() {
  var view = $("popover")
  $ui.animate({
    duration: 0.2,
    options: 2 << 16,
    animation: function() {
      view.alpha = 0
    },
    completion: function() {
      view.remove()
    }
  })
}

function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 6)
  layer.invoke("setShadowOffset", $size(5, 5))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.5)
  layer.invoke("setShadowRadius", 10)
}

module.exports = {
  generateMainViewObjects: generateMainViewObjects,
  mainView: mainView
}