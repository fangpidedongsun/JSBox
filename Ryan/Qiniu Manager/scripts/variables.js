var DEFAULT_SETTING = [
  ["", ""],
  ["https://up-z2.qiniup.com", "", ""]
]

// Read Setting
var file = $file.read("Setting.conf")
var SETTING_FILE = (typeof file == "undefined") ? JSON.parse(JSON.stringify(DEFAULT_SETTING)) : JSON.parse(file.string)
// Read Downloads
var file = $file.list("downloads")
var DOWNLOADS_FILE = (typeof file == "undefined" || file.length === 0) ? [] : file.sort()

// URL
var URL_UP = SETTING_FILE[1][0]
var URL_SELF = (SETTING_FILE[1][2].indexOf("bkt.clouddn.com") === -1 ? "https://" : "http://") + SETTING_FILE[1][2] + "/"