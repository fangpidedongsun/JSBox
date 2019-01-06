function throttle(fn, context, delay, text, mustApplyTime) {
  if (fn.timer)
    fn.timer.cancel()
  fn._cur = Date.now()

  if (!fn._start) {
    fn._start = fn._cur
  }
  if (fn._cur - fn._start > mustApplyTime) {
    fn.call(context, text)
    fn.timer.cancel()
    fn._start = fn._cur
  } else {
    fn.timer = $delay(delay, function() {
      fn.call(context, text)
    })
  }
}

function getPalette(sourceImage, colorCount = 10, quality = 10) {
  var sourceCount = sourceImage.size.width * sourceImage.size.height
  var image = sourceImage
  if (sourceCount > 100000) {
    var ratio = Math.sqrt(sourceImage.size.width / sourceImage.size.height)
    image = sourceImage.resized($size(sourceImage.size.height * 320 / ratio, 320 / ratio))
  }

  // console.info(sourceImage)
  // console.info(image)

  var pixelWidth = image.size.width, pixelHeight = image.size.height
  
  $thread.background({
    delay: 0.1,
    handler: function() {
      var pixelArray = []
      for (var x = 0, pixel, r, g, b; x < pixelWidth; x += quality) {
        for (var y = 0, pixel; y < pixelHeight; y += quality) {
          pixel = image.colorAtPixel($point(x, y)).components
          r = pixel.red
          g = pixel.green
          b = pixel.blue
          // If pixel is mostly opaque and not white
          if (!(r > 250 && g > 250 && b > 250)) {
            pixelArray.push([r, g, b])
          }
        }
      }
      
      if (typeof MMCQ === "undefined") $include("./quantize")

      var cmap = MMCQ.quantize(pixelArray, colorCount)
      var palette = cmap ? cmap.palette() : null
      
      if (palette) {
        renderPalette(palette)
        $delay(0.3, function() {
          guideAnimation()
        })
      }
    }
  })
}

function renderPhoto(self, view, image) {
  view.$superview().$setZoomScale(1.0)

  view = view.rawValue()

  var imgWidth = image.size.width
  var imgHeight = image.size.height

  var frameWidth = view.super.frame.width
  var frameHeight = view.super.frame.height

  var ratio = 1.0

  if (imgWidth >= imgHeight) {
    ratio = frameWidth / imgWidth
    frameHeight = imgHeight * ratio
  } else {
    ratio = frameHeight / imgHeight
    frameWidth = imgWidth * ratio

    if (frameWidth > view.super.frame.width) {
      frameWidth = view.super.frame.width
      ratio = frameWidth / imgWidth
      frameHeight = imgHeight * ratio
    }
  }

  var x = (view.super.frame.width - frameWidth) * 0.5
  var y = (view.super.frame.height - frameHeight) * 0.5

  view.image = image
  view.frame = $rect(x, y, frameWidth, frameHeight)
  view.super.contentSize = $size(frameWidth, frameHeight)

  if (self) {
    self.$setFrame(view.frame)
    self.$setRatio(1 / ratio)
  }

  getPalette(image, 6, 10)
}

function renderPalette(colors) {
  var data = []
  for (var color of colors) {
    var hex = $rgb(...color).hexCode
    var rgb = `(${color.join(", ")})`

    data.push({
      palette_color: {
        bgcolor: $color(hex)
      },
      hex: hex,
      rgb: rgb
    })
  }

  var mainColor = data[0]
  $("hex").title = mainColor.hex
  $("rgb").title = mainColor.rgb
  $("matrix").data = data
  
  $ui.animate({
    duration: 0.5,
    option: 2 << 16,
    animation: function() {
      $("color").bgcolor = $color(mainColor.hex)
    }
  })
}

function renderColor(obj) {
  var cls = obj.class
  var location = obj.location
  var image = obj.image.$image().rawValue()

  var ratio = cls.$ratio()
  var point = $point(Math.round(location.x * ratio), Math.round(location.y * ratio))

  var color = image.colorAtPixel(point)
  $("color").bgcolor = color
  $("hex").title = color.hexCode
  $("rgb").title = `(${color.components.red}, ${color.components.green}, ${color.components.blue})`

  //renderMagnifier(image)
}

function renderMagnifier(image) {
  var view = $("magnifier")

  //image = $file.read('assets/t.jpg').image.runtimeValue()
  const size = $size(20, 20)
  let render = $objc("UIGraphicsImageRenderer").$alloc().$initWithSize(size)
  let img = render.$imageWithActions($block("void, UIGraphicsImageRendererContext *", function(ctx) {
    image.$image().$drawInRect($rect(10, 0, 20, 20))
  }))

  view.image = img.rawValue()
}

function togglePalette(view) {
  var isOut = view.frame.height == 50 ? false : true

  var cells = $("palette").views[0].runtimeValue().$visibleCells().rawValue()
  var defaultFrame = cells[0].frame
  var movedFrame = JSON.parse(JSON.stringify(defaultFrame))
  movedFrame.y -= 10

  isOut ? outAnimation(view, cells, movedFrame) : inAnimation(view, cells, defaultFrame, movedFrame)
}

function guideAnimation() {
  $thread.background({
    delay: 0.3,
    handler: function() {
      if ($("color").super.super.frame.height == 50) {
        togglePalette($("color").super.super)
      }
    }
  })

  var count = 4
  inner()

  function inner(positive = false) {
    if (count === 0) {
      togglePalette($("color").super.super)
      return
    }
    var size = positive ? 1.0 : 0.8
    $ui.animate({
      duration: 0.4,
      option: 2 << 16,
      animation: function() {
        $("color").scale(size)
        count--
      },
      completion: function() {
        inner(!positive)
      }
    })
  }
}

function inAnimation(view, cells, defaultFrame, movedFrame) {
  view.updateLayout(function(make) {
    make.height.equalTo(100)
  })

  $ui.animate({
    duration: 0.3,
    option: 2 << 16,
    animation: function() {
      view.super.runtimeValue().$layoutIfNeeded()
    },
    completion: function() {
      for (let i = 0; i < cells.length; i++) {
        cells[i].views[0].frame = movedFrame
        $ui.animate({
          delay: i * 0.1,
          duration: 0.3,
          animation: function() {
            // View under UIView
            cells[i].views[0].views[0].alpha = 1
            // UIView
            cells[i].views[0].frame = defaultFrame
          }
        })
      }
    }
  })
}

function outAnimation(view, cells, movedFrame) {
  view.updateLayout(function(make) {
    make.height.equalTo(50)
  })

  if ($("palette_detail")) {
    $ui.animate({
      duration: 0.6,
      option: 2 << 16,
      animation: function() {
        $("palette_detail").alpha = 0
      },
      completion: function() {
        $("palette_detail").remove()
      }
    })
  }

  var len = cells.length
  for (let i = 0; i < len; i++) {
    $ui.animate({
      delay: (len - i) * 0.1,
      duration: 0.3,
      option: 2 << 16,
      animation: function() {
        // View under UIView
        cells[i].views[0].views[0].alpha = 0
        // UIView
        cells[i].views[0].frame = movedFrame
      }
    })
  }

  $ui.animate({
    delay: len * 0.1 + 0.2,
    duration: 0.3,
    option: 2 << 16,
    animation: function() {
      view.super.runtimeValue().$layoutIfNeeded()
    }
  })
}

module.exports = {
  throttle: throttle,
  getPalette: getPalette,
  renderPhoto: renderPhoto,
  renderColor: renderColor,
  togglePalette: togglePalette
}