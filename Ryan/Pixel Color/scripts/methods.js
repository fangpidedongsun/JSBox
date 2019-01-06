var actions = require("./actions")

function define(imgView) {
  $define({
    type: "Gesture: NSObject",
    props: ["isFirst", "isEditing", "frame", "ratio"],
    events: {
      create: function() {
        addGesture(self, imgView)
      },
      panEvent: function(gesture) {
        panHandler(self, gesture, imgView)
      },
      doubleTapEvent: function(gesture) {
        doubleTapHandler(self, gesture, imgView)
      },
      tapEvent: function(gesture) {
        tapHandler(self, imgView)
      },
      "viewForZoomingInScrollView:": function(scrollView) {
        return imgView
      },
      "scrollViewDidZoom": function(scrollView) {
        var frame = imgView.$frame()
        var viewFrame = imgView.$frame()
        var scrollFrame = scrollView.$frame()

        frame.y = (scrollFrame.height - viewFrame.height) >= -0.1 ? (scrollFrame.height - viewFrame.height) * 0.5 : 0
        frame.x = (scrollFrame.width - viewFrame.width) >= -0.1 ? (scrollFrame.width - viewFrame.width) * 0.5 : 0
        imgView.$setFrame(frame)
      }
    }
  })

  return $objc("Gesture").$new()
}

function addGesture(self, view) {
  self.$setIsFirst(true)
  self.$setIsEditing(false)

  // Pan Gesture
  var pan = $objc("UIPanGestureRecognizer").$alloc().$initWithTarget_action(self, "panEvent:")
  view.$addGestureRecognizer(pan)
  // Double Tap Gesture
  var doubleTap = $objc("UITapGestureRecognizer").$alloc().$initWithTarget_action(self, "doubleTapEvent:")
  doubleTap.$setNumberOfTapsRequired(2)
  view.$addGestureRecognizer(doubleTap)
  // Single Tap Gesture
  var tap = $objc("UITapGestureRecognizer").$alloc().$initWithTarget_action(self, "tapEvent:")
  view.$addGestureRecognizer(tap)
  
  tap.$requireGestureRecognizerToFail(doubleTap)
}

function panHandler(self, gesture, view) {
  if (self.$isEditing()) return

  var location = gesture.$locationInView(view)
  var frame = self.$frame()

  if (location.x < 0 || location.y <0 || location.x > frame.width || location.y > frame.height) return
  actions.throttle(actions.renderColor, null, 0.1, {class: self, location:location, image: view}, 80)
}

function doubleTapHandler(self, gesture, view) {
  if (!self.$isEditing()) return

  var scrollView = view.$superview()
  if (scrollView.$zoomScale() < 3.0) {
    var location = gesture.$locationInView(view)
    var rect = zoomRectForScrollView(scrollView, 3.0, location)
    scrollView.$zoomToRect_animated(rect, true)
  }
  else scrollView.$setZoomScale_animated(1.0, true)
}

function zoomRectForScrollView(scrollView, scale, point) {
  var width = scrollView.$frame().width / scale
  var height = scrollView.$frame().height / scale
  var x = point.x - width * 0.5
  var y = point.y - height * 0.5

  return $rect(x, y, width, height)
}

function tapHandler(self, view) {
  if (self.$isEditing()) return
  
  $photo.pick({
    format: "image",
    handler: function(resp) {
      var image = resp.image
      if (!image) return

      if (resp.metadata.UIImagePickerControllerPHAsset.runtimeValue().$filename().rawValue().match(/\.heic$/i)) {
        image = image.jpg(0.1).image
      }
      
      if (self.$isFirst()) {
        view.rawValue().views[0].remove()
        self.$setIsFirst(false)
      }

      actions.renderPhoto(self, view, image)
      $device.taptic(0)
    }
  })
}

module.exports = {
  define: define
}