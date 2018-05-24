

var newTitle
var newEmail
var newPassword
var newAddress
var matrixData = []

$ui.render({
  props: {
    id: "mainView",
  },
  views: [{
    type: "matrix",
    props: {
      columns: 1,
      itemHeight: 120,
      spacing: 20,
      template: {
        props: {
          bgcolor: $color("clear"),
        },
        views: [{
          type: "view",
          props: {
            clipsToBounds: false,
            bgcolor: $color("white")
          },
          views: [{
            type: "image",
            props: {
              id: "logo",
              bgcolor: $color("clear")
            },
            layout: function (make, view) {
              make.top.left.inset(10)
              make.size.equalTo($size(30, 30))
            }
          }, {
            type: "input",
            props: {
              id: "webTitle",
              placeholder: "请输入站点名称",
              font: $font("bold", 20),
              textColor: $color("darkGray"),
              bgcolor: $color("clear")
            },
            layout: function (make, view) {
              make.centerY.equalTo($("logo").centerY)
              make.size.equalTo($size(200, 30))
              make.left.inset(50)
            },
            events: {
              changed: function (sender) {
                newTitle = $("webTitle").text
              }
            }
          }, {
            type: "input",
            props: {
              id: "text0",
              placeholder: "请输入站点地址",
              font: $font(15),
              textColor: $color("#AAAAAA"),
              bgcolor: $color("clear")
            },
            layout: function (make, view) {
              make.left.right.inset(10)
              make.top.inset(45)
              make.height.equalTo(20)
            },
            events: {
              changed: function (sender) {
                newAddress = $("text0").text
              }
            }
          }, {
            type: "input",
            props: {
              id: "text1",
              placeholder: "请输入站点邮箱",
              font: $font(15),
              textColor: $color("#AAAAAA"),
              bgcolor: $color("clear")
            },
            layout: function (make, view) {
              make.left.right.inset(10)
              make.top.inset(70)
              make.height.equalTo(20)
            },
            events: {
              changed: function (sender) {
                newEmail = $("text1").text
              }
            }
          }, {
            type: "input",
            props: {
              id: "text2",
              placeholder: "请输入站点密码",
              font: $font(15),
              textColor: $color("#AAAAAA"),
              bgcolor: $color("clear")
            },
            layout: function (make, view) {
              make.left.right.inset(10)
              make.top.inset(95)
              make.height.equalTo(20)
            },
            events: {
              changed: function (sender) {
                newPassword = $("text2").text
              }
            }
          }],
          layout: function (make, view) {
            make.top.bottom.inset(0)
            make.left.right.inset(0)
            shadow(view)
          }
        }]
      }
    },
    layout: $layout.fill,
    events: {
      longPressed: function (sender) {
        deleteData()
      }
    }
  }, {
    type: "view",
    props: {
      id: "addBtView",
      clipsToBounds: false,
      bgcolor: $color("white")
    },
    views: [{
      type: "button",
      props: {
        title: "╋",
        titleColor: $color("#AAAAAA"),
        bgcolor: $color("clear")
      },
      layout: $layout.fill,
      events: {
        tapped: function (sender) {
          if ($("button").title == "╋") {
            $("button").title = "↺"
            addData()
          } else if($("button").title == "↺"){
            $("button").title = "╋"
            saveData()
          }else{
            let name = $addin.current.name.split(".js")
            $app.openURL("jsbox://run?name=" + $text.URLEncode(name[0]))
          }
        }
      }
    }],
    layout: function (make, view) {
      make.size.equalTo($size(40, 40))
      make.centerX.equalTo(view.super.centerX)
      make.bottom.inset(20)
      shadow(view)
    }
  }]
})


function shadow(view) {
  var layer = view.runtimeValue().invoke("layer")
  layer.invoke("setCornerRadius", 10)
  layer.invoke("setShadowOffset", $size(3, 3))
  layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
  layer.invoke("setShadowOpacity", 0.3)
  layer.invoke("setShadowRadius", 5)
}


function addData() {
  var ssData = $cache.get("ssData")
  if (ssData) {
    ssData.push({
      logo: {
        src: ""
      },
      webTitle: {
        text: ""
      },
      text0: {
        text: ""
      },
      text1: {
        text: ""
      },
      text2: {
        text: ""
      }
    })
  } else {
    ssData = [{
      logo: {
        src: ""
      },
      webTitle: {
        text: ""
      },
      text0: {
        text: ""
      },
      text1: {
        text: ""
      },
      text2: {
        text: ""
      }
    }]
  }
  $("matrix").data = ssData
}

function saveData() {
  var newData = $cache.get("ssData")
  if (newData) {
    newData.push({
      logo: {
        src: newAddress + "favicon.ico"
      },
      webTitle: {
        text: newTitle
      },
      text0: {
        text: newAddress
      },
      text1: {
        text: newEmail
      },
      text2: {
        text: newPassword
      }
    })
  } else {
    newData = [{
      logo: {
        src: newAddress + "favicon.ico"
      },
      webTitle: {
        text: newTitle
      },
      text0: {
        text: newAddress
      },
      text1: {
        text: newEmail
      },
      text2: {
        text: newPassword
      }
    }]
  }
  $cache.set("ssData",
    newData
  )
  alert("保存成功")
}


var checkInData = $cache.get("ssData")
var matrixData = []

if (checkInData) {
  for (var i = 0; i < checkInData.length; i++) {
    checkin(checkInData[i].text0.text, checkInData[i].text1.text, checkInData[i].text2.text, checkInData[i].webTitle.text)
  }
} else {
  alert("请点击下方按钮添加站点信息")
}

function login(url, email, password, title) {
  $http.request({
    method: "POST",
    url: url + "auth/login",
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "email": email,
      "passwd": password,
      "rumber-me": "week"
    },
    handler: function (resp) {
      if (resp.response.statusCode == 200) {
        if(resp.data.msg == "邮箱或者密码错误"){
          $ui.toast(title + "邮箱或者密码错误")
        }else{
          checkin(url, title)
        }
      } else {
        $ui.toast(title + "登录失败")
      }
    }
  })
}

function checkin(url, email, password, title) {
  $http.post({
    url: url + "user/checkin",
    handler: function (resp) {
      if(resp.data.msg){
        dataResults(url,resp.data.msg, title)
      }else{
        login(url, email, password, title)
      }
    }
  })
}

function dataResults(url, checkInResult, title) {
  $http.get({
    url: url + "user",
    handler: function (resp) {
      var usedData = resp.data.match(/(已用\s\d.+?%|>已用(里程|流量)|>\s已用流量)[^B]+/)
      usedData = usedData[0].match(/\d\S*(K|G|M|T)/)
      var restData = resp.data.match(/(剩余\s\d.+?%|>剩余(里程|流量)|>\s剩余流量)[^B]+/)
      restData = restData[0].match(/\d\S*(K|G|M|T)/)
      matrixData.push({
        logo: {
          src: url + "favicon.ico"
        },
        webTitle: {
          text: title
        },
        text0: {
          text: checkInResult
        },
        text1: {
          text: "已用流量：" + usedData[0] + "B"
        },
        text2: {
          text: "剩余流量：" + restData[0] + "B"
        }
      })
      $("matrix").data = matrixData.reverse()
    }
  })
}



function deleteData() {
  if ($("button").title == "╋") {
    alert("如需删除站点，请点击下方按钮；" + "\n" + "进入添加站点页面后，长按站点右上角")
  } else {
    var delData = $cache.get("ssData")
    if (delData) {
      var allDelData = []
      for (var i in delData) {
        allDelData.push(delData[i].webTitle.text)
      }
      $ui.menu({
        items: allDelData,
        handler: function (title, idx) {
          delData.splice(idx, 1)
          if (delData == "") {
            $cache.clear()
            $("button").title = "╋"
          } else {
            $cache.set("ssData", 
            delData
            )
          }
          var dataUpdate = $cache.get("ssData")
          if (dataUpdate) {
            $("matrix").data = dataUpdate
          } else {
            $("matrix").data = []
          }
        }
      })
    } else {
      alert("无任何可删除站点，请先添加站点")
    }
    $("button").title = "←"
  }
}