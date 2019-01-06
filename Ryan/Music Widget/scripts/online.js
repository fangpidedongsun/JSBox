/**
 *
 * 如为 US Apple Music 订阅者
 * 可以修改下 COUNTRY 参数为："us"
 * 默认(中国区)："cn"
 * 
 **/
const COUNTRY = "cn";
const QUERY = "?version=compress&country=" + COUNTRY;

const haptic = require("./haptic");

function playOnline(playlist, func=null) {
  $ui.loading(true);
  $http.get({
    url: "https://api.ryannn.com/music" + QUERY,
    handler: function(resp) {
      $ui.loading(false);
      let queue = resp.data[playlist].results.map((x) => {return x.toString();});
      playQueue(queue, playlist, func);
    }
  });
}

function playQueue(queue, playlist, func) {
  $ui.loading("Preparing");
  let player = $objc("MPMusicPlayerController").invoke("systemMusicPlayer");
  let handler = $block("void, NSError *", error => {
    $ui.loading(false);

    // From PromptView
    if ($("outter")) {
      $ui.animate({
        duration: 0.2,
        animation: () => {
          $("inner").alpha = 0.0;
        }
      });
      $("done").runtimeValue().$fadeToText(`Playing ${playlist} ...`);
      haptic();
    }

    $delay(1.5, () => {
      if (func) func();
      //player.$setShuffleMode(2);
    });
  });

  // Stop if playback state is not 0
  let state = player.$playbackState();
  if (state > 0) player.$stop();
  // Turn off shuffle mode
  player.$setShuffleMode(1);
  player.$setQueueWithStoreIDs(queue);
  player.$prepareToPlayWithCompletionHandler(handler);
}

module.exports = {
  play: playOnline
}
