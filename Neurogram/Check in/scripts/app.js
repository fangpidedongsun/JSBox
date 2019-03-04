var buyMeaCoffee = require('scripts/coffee')
var matrixData = []

module.exports = {
    checkData: checkData
}

$ui.render({
    props: {
        id: "mainView",
        navButtons: [
            {
                icon: "104",
                handler: function () {
                    var webData = require('scripts/data')
                    webData.webDataList()
                }
            }, {
                icon: "058",
                handler: function () {
                    buyMeaCoffee.coffee("mainView")
                }
            }
        ]
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
                        type: "label",
                        props: {
                            id: "webTitle",
                            text: "请输入站点名称",
                            font: $font("bold", 20),
                            textColor: $color("darkGray"),
                            bgcolor: $color("clear")
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo($("logo").centerY)
                            make.size.equalTo($size(200, 30))
                            make.left.inset(50)
                        }
                    }, {
                        type: "label",
                        props: {
                            id: "text0",
                            text: "请输入站点地址",
                            font: $font(15),
                            textColor: $color("#AAAAAA"),
                            bgcolor: $color("clear")
                        },
                        layout: function (make, view) {
                            make.left.right.inset(10)
                            make.top.inset(45)
                            make.height.equalTo(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            id: "text1",
                            text: "请输入站点邮箱",
                            font: $font(15),
                            textColor: $color("#AAAAAA"),
                            bgcolor: $color("clear")
                        },
                        layout: function (make, view) {
                            make.left.right.inset(10)
                            make.top.inset(70)
                            make.height.equalTo(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            id: "text2",
                            text: "请输入站点密码",
                            font: $font(15),
                            textColor: $color("#AAAAAA"),
                            bgcolor: $color("clear")
                        },
                        layout: function (make, view) {
                            make.left.right.inset(10)
                            make.top.inset(95)
                            make.height.equalTo(20)
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
        layout: $layout.fill
    }]
})

function checkData() {
    $("matrix").data = []
    matrixData = []
    let data = getData()
    let webNames = Object.keys(data)
    if (webNames.length == 0) {
        alert("请添加签到的站点信息")
    } else {
        for (var i = 0; i < webNames.length; i++) {
            checkin(data[webNames[i]].address, data[webNames[i]].email, data[webNames[i]].password, webNames[i])
        }
    }
}

function shadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 10)
    layer.invoke("setShadowOffset", $size(3, 3))
    layer.invoke("setShadowColor", $color("gray").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.3)
    layer.invoke("setShadowRadius", 5)
}

async function checkin(url, email, password, title) {
    if (url.indexOf("auth/login") != -1) {
        var checkinUrl = "user/checkin"
    } else {
        var checkinUrl = "user/_checkin.php"
    }
    let resp = await $http.post({
        url: url.replace(/user\/login.php|auth\/login/g, "") + checkinUrl
    })
    if (resp.data.msg) {
        dataResults(url, resp.data.msg, title)
    } else {
        login(url, email, password, title)
    }
}

async function login(url, email, password, title) {
    if (url.indexOf("auth/login") != -1) {
        var loginUrl = "auth/login"
    } else {
        var loginUrl = "user/_login.php"
    }
    let resp = await $http.request({
        method: "POST",
        url: url.replace(/user\/login.php|auth\/login/g, "") + loginUrl,
        header: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: {
            "email": email,
            "passwd": password,
            "rumber-me": "week"
        }
    })
    if (resp.response.statusCode == 200) {
        if (resp.data.msg == "邮箱或者密码错误") {
            $ui.toast(title + "邮箱或者密码错误")
        } else {
            checkin(url, email, password, title)
        }
    } else {
        $ui.toast(title + "登录失败")
    }
}

async function dataResults(url, checkInResult, title) {
    if (url.indexOf("auth/login") != -1) {
        var userUrl = "user"
    } else {
        var userUrl = "user/index.php"
    }
    let resp = await $http.get(url.replace(/user\/login.php|auth\/login/g, "") + userUrl)
    let usedData = resp.data.match(/(已用\s\d.+?%|>已用(里程|流量)|>\s已用流量)[^B]+/)
    if (usedData) {
        usedData = usedData[0].match(/\d\S*(K|G|M|T)/)
        let restData = resp.data.match(/(剩余\s\d.+?%|>剩余(里程|流量)|>\s剩余流量)[^B]+/)
        restData = restData[0].match(/\d\S*(K|G|M|T)/)
        matrixData.push({
            logo: {
                src: url.replace(/user\/login.php|auth\/login/g, "") + "favicon.ico"
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
    } else {
        $ui.toast(title + "登录失败")
    }
}

function getData() {
    return JSON.parse($file.read("assets/data.json").string)
}
