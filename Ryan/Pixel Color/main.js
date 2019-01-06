$app.rotateDisabled = true

var app = require("scripts/app")

app.init()

if (!$cache.get("README")) {
  $cache.set("README", true)
  app.readMe()
}