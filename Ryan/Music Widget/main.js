let _app = require("./scripts/app");
_app.render();

if ($app.env == $env.app && $cache.get("new") !== false) {
  $ui.push({
    views: [{
      type: "markdown",
      props: {
        content: $file.read("./README.md").string
      },
      layout: $layout.fill
    }]
  });
  $cache.set("new", false);
}
