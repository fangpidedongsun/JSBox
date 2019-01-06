const CryptoJS = require("crypto-js")
const MIME = {
  ".zip": "application/zip",
  ".html": "text/html",
  ".css": "text/css",
  ".py": "text/x-python-script",
  ".js": "application/javascript",
  ".json": "text/json"
}

var _alert = require("scripts/alert")

String.prototype.urlsafe = function() {
  return this.replace(/\+/g, "-").replace(/\//g, "_")
}

/*
 * Authentication
 */
function authManageQiniu(path, body = "") {
  var signingStr = path + "\n" + body
  var sign = CryptoJS.HmacSHA1(signingStr, SETTING_FILE[0][0])
  var signEncoded = sign.toString(CryptoJS.enc.Base64).urlsafe()
  var token = SETTING_FILE[0][1] + ":" + signEncoded

  return token
}

function authUploadQiniu(fileName, override = false) {
  var para = {
    "scope": SETTING_FILE[1][1] + ":" + fileName,
    "insertOnly": Number(!override),
    "deadline": Math.round(new Date().getTime() / 1000) + 1 * 3600
  }
  var policy = JSON.stringify(para)
  var policyEncoded = $text.base64Encode(policy).urlsafe()
  var sign = CryptoJS.HmacSHA1(policyEncoded, SETTING_FILE[0][0])
  var signEncoded = sign.toString(CryptoJS.enc.Base64).urlsafe()
  var token = SETTING_FILE[0][1] + ":" + signEncoded + ":" + policyEncoded

  return token
}

/*
 * Base HTTP
 */
function getQiniu(token, url, host, handler) {
  $ui.loading(true)
  $("home").endRefreshing()
  $http.get({
    url: url,
    header: {
      "Host": host,
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "QBox " + token
    },
    handler: function(resp) {
      $ui.loading(false)
      $("spinner").stop()
      var code = resp.response.statusCode
      if (200 === code) {
        var data = resp.data
        handler(data)
      } else {
        _alert.error(code, resp.data.error)
      }
    }
  })
}

function postQiniu(token, url, handler, body = null) {
  $http.post({
    url: url,
    header: {
      "Content-Type": "application/json",
      "Authorization": "QBox " + token
    },
    body: body,
    handler: function(resp) {
      var code = resp.response.statusCode
      if (200 === code) {
        handler()
      } else {
        _alert.error(code, resp.data.error)
      }
    }
  })
}

function uploadQiniu(token, file, fileName) {
  $http.upload({
    url: URL_UP,
    form: {
      "key": fileName,
      "token": token
    },
    files: [{
      "data": file,
      "name": "file",
      "filename": fileName,
      "content-type": MIME[fileName.extension()] ? MIME[fileName.extension()] : file.mimeType
    }],
    handler: function(resp) {
      var code = resp.response.statusCode
      if (200 === code) {
        actionRefresh(URL_SELF + resp.data.key, fileName)
      } else if (614 === code) {
        _alert.fileExists(fileName, function() {
          var token = authUploadQiniu(fileName, true)
          uploadQiniu(token, file, fileName)
        })
      } else {
        _alert.error(code, resp.data.error)
      }
    }
  })
}

function actionRefresh(rawURL, fileName) {
  var host = "http://fusion.qiniuapi.com"
  var path = "/v2/tune/refresh"
  var body = {
    "urls": [rawURL]
  }

  var token = authManageQiniu(path)
  var url = host + path
  var handler = function() {
    _alert.uploaded(fileName)
  }
  postQiniu(token, url, handler, body)
}

module.exports = {
  authManage: authManageQiniu,
  authUpload: authUploadQiniu,
  get: getQiniu,
  post: postQiniu,
  upload: uploadQiniu
}