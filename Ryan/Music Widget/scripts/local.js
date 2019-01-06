const CLOUD = $device.networkType === 1 ? true : false;
const INDEX = {
  "Random": 0,
  "Newest": 1
}

const haptic = require("./haptic");

function playLocal(playlist, func=null) {
  let songs = getItems(CLOUD);
  let collection = INDEX[playlist] === 0 ? sortByRandom(songs) : sortByNewest(songs);
  playCollection(collection, playlist, func);
}

function getItems(cloud) {
  let MPMediaQuery;
  if (!cloud) {
    let isCloud = $objc("MPMediaPropertyPredicate").$predicateWithValue_forProperty(Number(cloud), "isCloudItem");
    let predicate = NSSet.$setWithObject(isCloud);
    MPMediaQuery = $objc("MPMediaQuery").$alloc().$initWithFilterPredicates(predicate);
  } else {
    MPMediaQuery = $objc("MPMediaQuery").$alloc().$init();
  }
  let songs = MPMediaQuery.$items();

  return songs; // ObjC object
}

function sortByNewest(query, number=30) {
  let sort = $objc("NSSortDescriptor").$alloc().$initWithKey_ascending("dateAdded", 0);
  let songs = query.$sortedArrayUsingDescriptors([sort]);

  let allAlbums = songs.$valueForKey("albumTitle");
  let subAlbums = $objc("NSOrderedSet").$orderedSetWithArray(allAlbums).$allObjects();
  let len = subAlbums.$count();
  if (number > len) number = len;
  subAlbums = subAlbums.$subarrayWithRange($range(0, number));

  let items = [];
  for (let album of subAlbums.rawValue()) {
    album = album.replace(/'/g, "\\'");
    let predicate = $objc("NSPredicate").$predicateWithFormat(`albumTitle == '${album}'`);
    let item = songs.$filteredArrayUsingPredicate(predicate);
    let i = item.$count();
    let count = i > 1 ? parseInt(Math.random() * i) : 0;
    items.push(item.$objectAtIndex(count));
  }
  let collection = $objc("MPMediaItemCollection").$alloc().$initWithItems(items);

  return collection; // ObjC object
}

function sortByRandom(query, number=30) {
  function randomSort(arr, newArr, count) {
    if (arr.length == 1 || newArr.length == count - 1) {
      newArr.push(arr[0]);
      return newArr;
    }
    let random = Math.ceil(Math.random() * arr.length) - 1;
    newArr.push(arr[random]);
    arr.splice(random, 1);
    return randomSort(arr, newArr, count);
  }

  let items = [];
  randomSort(query.rawValue(), items, number);
  let collection = $objc("MPMediaItemCollection").$alloc().$initWithItems(items);

  return collection; // ObjC object
}

function playCollection(collection, playlist, func) {
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
      player.$setShuffleMode(2);
    });
  });

  // Stop if playback state is not 0
  let state = player.$playbackState();
  if (state > 0) player.$stop();
  // Turn off shuffle mode
  player.$setShuffleMode(1);
  player.$setQueueWithItemCollection(collection);
  player.$prepareToPlayWithCompletionHandler(handler);
}

module.exports = {
  play: playLocal
}
