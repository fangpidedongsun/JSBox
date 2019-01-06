const WIDTH = 80, HEIGHT = 80;
const PLAYLIST = [["QQ","iTunes", "Billboard"], ["Random", "Recent"]];
const MESSAGE = {
  "qq": "Play QQ top-30 online playlist.",
  "itunes": "Play iTunes top-30 online playlist.",
  "billboard": "Play Billboard top-30 online playlist.",
  "random": "Play 30 Ramdom offline songs.",
  "recent": "Play 30 Recent Added offline songs."
};

let _online = require("./online");
let _local = require("./local");

function artworkButtons(obj) {
  let child = obj.child;
  let parent = obj.parent;
  
  // Cache Frame
  let frame = parent.frame;
  if ($app.env == $env.today) {
    if (frame.width === 0 && frame.height === 0 && $cache.get("widget-frame"))
      frame = $cache.get("widget-frame");
    else if (frame.width > 0 && frame.height > 0)
      $cache.set("widget-frame", frame);
    else {
      $delay(0.1, () => {
        artworkButtons({
          child: child,
          parent: $("main")
        });
      });
      return;
    }
  }
  
  let parentWidth = frame.width;
  let parentHeight = frame.height;

  let perY = parentHeight * 0.5;
  let padding = (parentWidth - child.length * WIDTH - child.map((x) => {return x.length-1;}).reduce((pre, cur) => {return pre+cur;}, 0) * 8) / (child.length+1);
  let left = 0;

  for (let i = 0; i < child.length; i++) {
    let len = child[i].length;
    left += padding * (i+1) - 8 * (Math.floor((len+1) * 0.5) - 1);
    
    for (let j = 0; j < len; j++) {
      let k = len - j - 1;
      let rect = $rect(left + j*8, perY - HEIGHT*0.5 + k*3, WIDTH - k*6, HEIGHT - k*6)
      
      let cell = {
        type: "image",
        props: {
          info: {frameOrigin: rect, playlist: PLAYLIST[i][j], group: i, len: len},
          frame: rect,
          data: child[i][j],
          clipsToBounds: false
        },
        events: {
          ready: sender => {
            addShadow(sender);
          },
          tapped: sender => {
            if (sender.super.info.isOut == false) {
              let group = sender.info.group;
              let len = sender.info.len;
              let views = sender.super.views;

              let hideViews = group === 0 ? views.slice(len) : views.slice(0, views.length-len);
              let showViews = group === 0 ? views.slice(0, len) : views.slice(views.length-len);

              alphaAnimation(hideViews, 0.0);
              popOutAnimation(showViews);
              sender.super.info = {isOut: true};
              return;
            }
            
            promptView(sender);
          }
        }
      };
      parent.add(cell);
    }
    
    left = WIDTH + (len-1) * 8;
  }

  return;
}

function promptView(view) {
  let frame = view.frame
  let playlist = view.info.playlist;
  let group = view.info.group;
  let source = group === 0 ? _online : _local;

  $ui.window.add({
    type: "view",
    props: {
      id: "outter",
      alpha: 0.0
    },
    layout: $layout.fill,
    events: {
      tapped: sender => {
        if (sender.info == "disable") return;
        remove();
      }
    },
    views: [{
        type: "blur",
        props: {
          style: 5,
          alpha: 0.8,
        },
        layout: $layout.fill
      },
      {
        type: "label",
        props: {
          id: "done",
          font: $font("PingFangSC-Semibold", 16),
          align: $align.center
        },
        layout: $layout.fill
      },
      {
        type: "view",
        props: {
          id: "inner"
        },
        layout: $layout.fill,
        views: [{
          type: "label",
          props: {
            text: playlist,
            font: $font("PingFangSC-Medium", 20),
            align: $align.center
          },
          layout: (make, view) => {
            make.bottom.equalTo(view.super.centerY).offset(-10);
            make.height.equalTo(30);
            make.left.right.inset(0);
          }
        },
        {
          type: "label",
          props: {
            text: MESSAGE[playlist.toLowerCase()],
            font: $font("PingFangSC-Semibold", 13),
            align: $align.center,
            textColor: $color("darkGray")
          },
          layout: (make, view) => {
            make.height.equalTo(15);
            make.centerY.equalTo().offset(-5);
            make.left.right.inset(0);
          }
        },
        {
          type: "spinner",
          props: {
            loading: false
          },
          layout: (make, view) => {
            make.size.equalTo($size(30, 30));
            make.top.equalTo(view.prev.bottom);
            make.centerX.equalTo();
          },
        },
        {
          type: "button",
          props: {
            icon: $icon("icon_049.png", $color("black"), $size(25, 25)),
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.size.equalTo($size(30, 30));
            make.top.equalTo(view.prev.prev.bottom).offset(5);
            make.centerX.equalTo();
          },
          events: {
            tapped: sender => {
              $("outter").info = "disable";
              source.play(playlist, () => {
                remove();
                popInAnimation();
                $("main").info = {isOut: false};
              });
              sender.prev.start();
              sender.remove();
            }
          }
        }]
      }
    ]
  });

  $ui.animate({
    duration: 0.3,
    animation: () => {
      $("outter").alpha = 1.0;
      view.frame = $rect(frame.x - 5, frame.y - 5, frame.width + 10, frame.height + 10);
    }
  });

  function remove() {
    $ui.animate({
      duration: 0.3,
      animation: () => {
        $("outter").alpha = 0;
        view.frame = frame;
      },
      completion: () => {
        if ($("outter")) $("outter").remove();
      }
    });
  }
}

function popInAnimation(views=null) {
  if (!views) views = $("main").views;

  let len = views.length;
  for (let i=0; i<len; i++) {
    $ui.animate({
      delay: i*0.05,
      duration: 0.3,
      animation: () => {
        views[i].frame = views[i].info.frameOrigin;
      }
    });
  }

  $delay(len * 0.05 + 0.15, () => {
    alphaAnimation(views, 1.0);
  });
}

function popOutAnimation(views=null) {
  if (!views) return;

  let len = views.length;

  let parentWidth = views[0].super.frame.width;
  let padding = (parentWidth - len*WIDTH) / (len+1);

  let y = views[len-1].frame.y;
  let left = (len-1) * (padding+WIDTH);
  for (let i = len-1; i >= 0; i--) {
    $ui.animate({
      delay: i*0.05,
      duration: 0.3,
      animation: () => {
        views[i].frame = $rect(left + padding, y, WIDTH, HEIGHT);
      }
    });
    left -= (padding + WIDTH);
  }
}

function alphaAnimation(views, alpha) {
  if (!views) return;

  for (let view of views) {
    $ui.animate({
      duration: 0.2,
      animation: () => {
        view.alpha = alpha;
      }
    });
  }
}

function addShadow(view, alpha=0.8) {
  let layer = view.runtimeValue().$layer();

  layer.$setCornerRadius(10);
  layer.$setShadowOffset($size(5, 5));
  layer.$setShadowColor($color("gray").runtimeValue().$CGColor());
  layer.$setShadowOpacity(alpha);
  layer.$setShadowRadius(10);
}

function render() {
  let files = [];
  for (let i = 0; i < PLAYLIST.length; i++) {
    files.push([]);
    for (let j = 0; j < PLAYLIST[i].length; j++) {
      files[i].push(
        $file.read(`assets/artworks/${PLAYLIST[i][j].toLowerCase()}.png`)
      );
    }
  }

  $ui.render({
    views: [{
      type: "view",
      props: {
        id: "main",
        info: {isOut: false}
      },
      layout: $layout.fill,
      events: {
        ready: sender => {
          $delay(0, () => {
            artworkButtons({
              child: files,
              parent: sender
            });
          });
        },
        tapped: sender => {
          let isOut = sender.info.isOut;
          if (isOut) {
            popInAnimation(sender.views);
            sender.info = {isOut: !isOut};
          };
          return;
        }
      }
    }]
  });
}

module.exports = {
  render: render
}
