var builder = require("./methods")
var actions = require("./actions")

const DEMO = $file.read("assets/demo.jpg").image

var Gesture

function init() {
  $ui.render({
    props: {
      navButtons: [{
        title: $l10n("button_zoom"),
        handler: function(button) {
          zoomButtonHandler(button)
        }
      }]
    },
    views: [{
        type: "scroll",
        props: {
          showsHorizontalIndicator: false,
          showsVerticalIndicator: false,
          minimumZoomScale: 1.0,
          maximumZoomScale: 5.0,
          zoomEnabled: false,
          scrollEnabled: false,
          clipsToBounds: false
        },
        layout: function(make, view) {
          var sup = view.super
          make.bottom.equalTo($device.isIphoneX ? sup.safeAreaBottom : 0).offset(-10)
          make.top.inset(65)
          make.left.right.inset(5)
          shadowMain(view, 0.5)
        },
        views: [{
          type: "image",
          props: {
            userInteractionEnabled: true,
            contentMode: $contentMode.scaleAspectFit
          },
          events: {
            ready: function(view) {
              Gesture = initialize(view.runtimeValue())
            }
          },
          views: [{
            type: "view",
            props: {
              bgcolor: $color("white"),
              alpha: 0.3
            },
            layout: $layout.fill,
            views: [{
              type: "label",
              props: {
                text: $l10n("guide_select_photo"),
                font: $font("bold", 35),
                autoFontSize: true,
                align: $align.center
              },
              layout: $layout.fill
            }]
          }]
        }]
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: function(make, view) {
          make.height.equalTo(50)
          make.top.inset(5)
          make.left.right.inset(10)
          shadowMain(view)
        },
        views: [{
            type: "view",
            layout: function(make, view) {
              make.height.equalTo(40)
              make.left.right.inset(10)
              make.top.inset(5)
            },
            views: [{
                type: "view",
                props: {
                  id: "color",
                  //circular: true,
                  bgcolor: $color("tint")
                },
                layout: function(make, view) {
                  make.size.equalTo(40)
                  make.left.top.inset(0)
                  shadowPalette(view, $color("lightGray"), 20)
                },
                events: {
                  tapped: function(sender) {
                    $device.taptic(0)
                    actions.togglePalette(sender.super.super)
                  }
                }
              },
              // {
              //   // For UIView shadow
              //   type: "view",
              //   props: {
              //     bgcolor: $color("white")
              //   },
              //   layout: function(make, view) {
              //     var pre = view.prev
              //     make.left.equalTo(pre.right).offset(10)
              //     make.size.equalTo(40)
              //     make.top.bottom.inset(0)
              //     shadowPalette(view, $color("lightGray"), 20)
              //   }
              // },
              // {
              //   type: "image",
              //   props: {
              //     id: "magnifier",
              //     circular: true,
              //     //image: $file.read('assets/t.jpg').image
              //   },
              //   layout: function(make, view) {
              //     var pre = view.prev.prev
              //     make.left.equalTo(pre.right).offset(10)
              //     make.size.equalTo(40)
              //     make.top.bottom.inset(0)
              //   },
              //   views: [{
              //     type: "view",
              //     props: {
              //       circular: true,
              //       bgcolor: $color("black"),
              //       alpha: 0.5
              //     },
              //     layout: function(make, view) {
              //       var sup = view.super
              //       // 10 pixels, divided by 10
              //       make.width.height.equalTo(sup.height).multipliedBy(0.1)
              //       make.centerX.equalTo()
              //       make.centerY.equalTo()
              //     }
              //   }]
              // },
              {
                type: "canvas",
                layout: function(make, view) {
                  var pre = view.prev
                  make.left.equalTo(pre.right).offset(10)
                  make.width.equalTo(3)
                  make.top.bottom.inset(5)
                },
                events: {
                  draw: function(view, ctx) {
                    var width = view.frame.width
                    var height = view.frame.height
                    ctx.strokeColor = $color("lightGray")
                    ctx.setAlpha(0.3)
                    ctx.setLineWidth(3)
                    ctx.setLineDash(0, [5, 3], 2)
                    ctx.moveToPoint(width, 0)
                    ctx.addLineToPoint(width, height)
                    ctx.strokePath()
                  }
                }
              },
              {
                type: "view",
                layout: function(make, view) {
                  var pre = view.prev
                  make.left.equalTo(pre.right).offset(10)
                  make.top.right.bottom.inset(0)
                },
                views: [{
                    type: "label",
                    props: {
                      text: "HEX",
                      font: $font("bold", 15),
                      textColor: $color("darkGray"),
                      align: $align.center
                    },
                    layout: function(make, view) {
                      var sup = view.super
                      make.right.equalTo(sup.centerX).offset(-5)
                      make.height.equalTo(20)
                      make.top.left.inset(0)
                    }
                  },
                  {
                    type: "button",
                    props: {
                      id: "hex",
                      title: "#FFFFFF",
                      font: $font("ArialRoundedMTBold", 13),
                      titleColor: $color("lightGray"),
                      bgcolor: $color("clear")
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.left.equalTo(pre)
                      make.right.equalTo(pre)
                      make.top.equalTo(pre.bottom)
                      make.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        copy(sender.title)
                      }
                    }
                  },
                  {
                    type: "label",
                    props: {
                      text: "RGB",
                      font: $font("bold", 15),
                      textColor: $color("darkGray"),
                      align: $align.center
                    },
                    layout: function(make, view) {
                      var sup = view.super
                      make.left.equalTo(sup.centerX).offset(5)
                      make.height.equalTo(20)
                      make.top.right.inset(0)
                    }
                  },
                  {
                    type: "button",
                    props: {
                      id: "rgb",
                      title: "(255, 255, 255)",
                      font: $font("ArialRoundedMTBold", 13),
                      titleColor: $color("lightGray"),
                      bgcolor: $color("clear")
                    },
                    layout: function(make, view) {
                      var pre = view.prev
                      make.left.equalTo(pre)
                      make.right.equalTo(pre)
                      make.top.equalTo(pre.bottom)
                      make.bottom.inset(0)
                    },
                    events: {
                      tapped: function(sender) {
                        copy(sender.title)
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            type: "view",
            props: {
              id: "palette"
            },
            layout: function(make, view) {
              var pre = view.prev
              make.height.equalTo(40)
              make.top.equalTo(pre.bottom).offset(10)
              make.left.right.inset(10)
            },
            views: [{
              type: "matrix",
              props: {
                clipsToBounds: false,
                scrollEnabled: false,
                bgcolor: $color("clear"),
                columns: 6,
                itemHeight: 40,
                template: [{
                  type: "view",
                  props: {
                    id: "palette_color",
                    alpha: 0,
                    circular: true
                  },
                  layout: function(make) {
                    make.top.right.inset(5)
                    make.left.bottom.inset(0)
                  }
                }]
              },
              layout: $layout.fill,
              events: {
                didSelect: function(sender, indexPath) {
                  selectedHandler(sender, indexPath)
                },
                forEachItem: function(view) {
                  var color = view.views[0].bgcolor
                  shadowPalette(view, color)
                }
              }
            }]
          }
        ]
      }
    ]
  })
}

function initialize(imgView) {
  var cls = builder.define(imgView)
  $objc_retain(cls)
  $app.listen({
    exit: function() {
      $objc_release(cls)
    }
  })

  cls.$create()
  imgView.$superview().$setDelegate(cls)

  $thread.background({
    delay: 0.01,
    handler: function() {
      actions.renderPhoto(cls, imgView, DEMO)
    }
  })

  return cls
}

function selectedHandler(view, indexPath) {
  var sup = view.super.super
  var data = view.object(indexPath)

  var idx = indexPath.row
  var width = view.frame.width
  var per = width / 6
  var left = per * idx + (per - 5) * 0.5
  left = Math.round(left)

  if ($("palette_detail")) {

    $("palette_detail_canvas").updateLayout(function(make) {
      // +5px for the left-inset of super view
      // -8px for the middle of self
      make.left.inset(left + 5 - 8)
    })

    $ui.animate({
      duration: 0.3,
      option: 2 << 16,
      animation: function() {
        sup.runtimeValue().$layoutIfNeeded()
        $("palette_detail_hex").title = data.hex
        $("palette_detail_rgb").title = data.rgb
      }
    })

    return
  }

  sup.updateLayout(function(make) {
    make.height.equalTo(160)
  })

  $ui.animate({
    duration: 0.3,
    option: 2 << 16,
    animation: function() {
      sup.super.runtimeValue().$layoutIfNeeded()
    },
    completion: function() {
      addPaletteDetail(sup, left, data)
    }
  })
}

function addPaletteDetail(view, left, data) {
  view.add({
    type: "view",
    props: {
      id: "palette_detail",
      alpha: 0,
      bgcolor: $color("white")
    },
    layout: function(make, view) {
      var pre = view.prev
      make.height.equalTo(50)
      make.top.equalTo(pre.bottom).offset(10)
      make.left.right.inset(5)
      shadowMain(view)
    },
    views: [{
        type: "canvas",
        props: {
          id: "palette_detail_canvas"
        },
        layout: function(make) {
          make.top.inset(-8)
          make.height.equalTo(8)
          make.width.equalTo(16)
          // +5px for the left-inset of super view
          // -8px for the middle of self
          make.left.equalTo(left + 5 - 8)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var height = view.frame.height

            ctx.fillColor = $color("white")
            ctx.moveToPoint(width * 0.5, 0)
            ctx.addLineToPoint(0, height)
            ctx.addLineToPoint(width, height)
            ctx.fillPath()
          }
        }
      },
      {
        type: "label",
        props: {
          text: "HEX",
          font: $font("bold", 15),
          textColor: $color("darkGray"),
          align: $align.center
        },
        layout: function(make) {
          make.left.inset(20)
          make.right.equalTo().multipliedBy(0.5).offset(-20)
          make.top.inset(5)
        }
      },
      {
        type: "button",
        props: {
          id: "palette_detail_hex",
          title: data.hex,
          font: $font("ArialRoundedMTBold", 13),
          titleColor: $color("lightGray"),
          bgcolor: $color("white")
        },
        layout: function(make, view) {
          var pre = view.prev
          make.left.equalTo(pre)
          make.right.equalTo(pre)
          make.top.equalTo(pre.bottom)
          make.bottom.inset(0)
        },
        events: {
          tapped: function(sender) {
            copy(sender.title)
          }
        }
      },
      {
        type: "label",
        props: {
          text: "RGB",
          font: $font("bold", 15),
          textColor: $color("darkGray"),
          align: $align.center
        },
        layout: function(make, view) {
          var sup = view.super
          make.left.equalTo(sup.centerX).offset(20)
          make.right.inset(20)
          make.top.inset(5)
        }
      },
      {
        type: "button",
        props: {
          id: "palette_detail_rgb",
          title: data.rgb,
          font: $font("ArialRoundedMTBold", 13),
          titleColor: $color("lightGray"),
          bgcolor: $color("white")
        },
        layout: function(make, view) {
          var pre = view.prev
          make.left.equalTo(pre)
          make.right.equalTo(pre)
          make.top.equalTo(pre.bottom)
          make.bottom.inset(0)
        },
        events: {
          tapped: function(sender) {
            copy(sender.title)
          }
        }
      }
    ]
  })

  $ui.animate({
    duration: 0.3,
    option: 2 << 16,
    animation: function() {
      $("palette_detail").alpha = 1
    }
  })
}

function zoomButtonHandler(button) {
  var isEditing = Gesture.$isEditing()

  var title = isEditing ? $l10n("button_zoom") : $l10n("button_done")
  var enabled = isEditing ? false : true

  button.runtimeValue().$setTitle(title)
  $("scroll").scrollEnabled = enabled
  $("scroll").runtimeValue().$setZoomEnabled(enabled)
  $device.taptic(0)

  Gesture.$setIsEditing(!isEditing)
}

function copy(text) {
  $clipboard.text = text
  $ui.toast(text + $l10n("toast_copied"))
}

function shadowMain(view, alpha = 0.3) {
  var layer = view.runtimeValue().$layer()
  layer.$setCornerRadius(5)
  layer.$setShadowOffset($size(0, 0))
  layer.$setShadowColor($color("lightGray").runtimeValue().$CGColor())
  layer.$setShadowOpacity(alpha)
  layer.$setShadowRadius(15)
}

function shadowPalette(view, color, radius = null) {
  var layer = view.runtimeValue().$layer()
  layer.$setShadowOffset($size(0, 0))
  layer.$setShadowColor(color.runtimeValue().$CGColor())
  layer.$setShadowOpacity(0.3)
  layer.$setShadowRadius(5)
  layer.$setMasksToBounds(false)

  if (radius) layer.$setCornerRadius(radius)
}

function readMe() {
  $ui.push({
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
  init: init,
  readMe: readMe
}