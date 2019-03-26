const webName = ["看电影网", "Sky电影"]
const btWebName = ["看电影网", "磁力搜"]

const screenWidth = $device.info.screen.width
const screenHeight = $device.info.screen.height
var playUrl

function generalViewIn(type, keyword) {

    let doubanViews = [{
        type: "web",
        props: {
            id: "doubanWeb",
            url: "https://m.douban.com/search/?query=" + $text.URLEncode(keyword),
            radius: 5
        },
        layout: $layout.fill,
        views: [{
            type: "view",
            props: {
                id: "webBtViews",
                bgcolor: $color("#79E3FE")
            },
            layout: function (make, view) {
                make.bottom.inset(30)
                make.right.inset(15)
                make.size.equalTo($size(60, 50))
                shadow(view, 10, $size(1, 1), $color("#79E3FE"), 0.8, 5)
            },
            views: [{
                type: "button",
                props: {
                    id: "webForwardBt",
                    src: "assets/forward.png",
                    alpha: 0
                },
                layout: function (make, view) {
                    make.right.inset(15)
                    make.bottom.inset(10)
                    make.size.equalTo($size(30, 30))
                },
                events: {
                    tapped: function (sender) {
                        $device.taptic(2)
                        webForwardEffect()
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "webBackBt",
                    src: "assets/back.png",
                    alpha: 0
                },
                layout: function (make, view) {
                    make.right.inset(15)
                    make.bottom.inset(10)
                    make.size.equalTo($size(30, 30))
                },
                events: {
                    tapped: function (sender) {
                        $device.taptic(2)
                        $("doubanWeb").goBack()
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "webCloseBt",
                    src: "assets/close.png",
                    alpha: 0
                },
                layout: function (make, view) {
                    make.right.inset(15)
                    make.bottom.inset(10)
                    make.size.equalTo($size(30, 30))
                },
                events: {
                    tapped: function (sender) {
                        $device.taptic(2)
                        generalViewOut(0)
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "feedBt",
                    src: "assets/web.png",
                },
                layout: function (make, view) {
                    make.right.inset(15)
                    make.bottom.inset(10)
                    make.size.equalTo($size(30, 30))
                },
                events: {
                    tapped: function (sender) {
                        $device.taptic(2)
                        webBtEffect()
                    }
                }
            }]
        }]
    }]

    let feedbackViews = [{
        type: "list",
        props: {
            bgcolor: $color("white"),
            separatorHidden: 1,
            showsVerticalIndicator: 0,
            radius: 5,
            data: [{
                title: "类型*",
                rows: [{
                    type: "tab",
                    props: {
                        id: "feedbackType",
                        items: ["无法播放", "播放卡顿", "资源错误", "其他"],
                        tintColor: $color("#79E3FE")
                    },
                    layout: function (make, view) {
                        make.center.equalTo(view.super)
                        make.height.equalTo(30)
                        make.left.right.inset(20)
                    }
                }]
            }, {
                title: "邮箱*",
                rows: [{
                    type: "input",
                    props: {
                        id: "emailInput",
                        type: $kbType.email,
                        placeholder: "请输入邮箱"
                    },
                    layout: function (make, view) {
                        make.edges.insets($insets(5, 15, 5, 15))
                    },
                    events: {
                        changed: function (sender) {
                            emailCheck($("emailInput").text)
                        },
                        returned: function (sender) {
                            $("emailInput").blur()
                        }
                    }
                }, {
                    type: "label",
                    props: {
                        id: "emailCheckResult",
                        text: "*该邮箱用于接收反馈结果，请正确填写",
                        textColor: $color("#AAAAAA"),
                        font: $font(10)
                    },
                    layout: function (make, view) {
                        make.top.inset(0)
                        make.left.inset(20)
                    }
                }]
            }, {
                title: "备注",
                rows: [{
                    type: "text",
                    props: {
                        id: "feedbackText",
                        bgcolor: $color("#EEF1F1"),
                        radius: 7,
                        placeholder: "请输入备注（可选）"
                    },
                    layout: function (make, view) {
                        make.edges.insets($insets(0, 15, 0, 15))
                    }
                }]
            }],
            header: {
                type: "view",
                props: {
                    height: 15,
                }
            },
            footer: {
                type: "view",
                props: {
                    height: 32,
                }
            }
        },
        layout: $layout.fill,
        events: {
            rowHeight: function (sender, indexPath) {
                if (indexPath.section == 2) {
                    return 150.0
                } else if (indexPath.row == 1) {
                    return 15
                }
            }
        }
    }, {
        type: "view",
        props: {
            id: "videoBtViews",
            bgcolor: $color("#79E3FE")
        },
        layout: function (make, view) {
            make.bottom.inset(30)
            make.right.inset(15)
            make.size.equalTo($size(60, 50))
            shadow(view, 10, $size(1, 1), $color("#79E3FE"), 0.8, 5)
        },
        views: [{
            type: "button",
            props: {
                id: "videoForwardBt",
                src: "assets/forward.png",
                alpha: 0
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.bottom.inset(10)
                make.size.equalTo($size(30, 30))
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    videoForwardEffect()
                }
            }
        }, {
            type: "button",
            props: {
                id: "videoCloseBt",
                src: "assets/close.png",
                alpha: 0
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.bottom.inset(10)
                make.size.equalTo($size(30, 30))
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    generalViewOut(1)
                }
            }
        }, {
            type: "button",
            props: {
                id: "videoFeedBt",
                src: "assets/web.png"
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.bottom.inset(10)
                make.size.equalTo($size(30, 30))
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    videoBtEffect()
                }
            }
        }]
    }]

    let settingViews = [{
        type: "list",
        props: {
            bgcolor: $color("white"),
            showsVerticalIndicator: 0,
            separatorHidden: 1,
            radius: 5,
            data: [{
                title: "电影资源站",
                rows: [{
                    type: "tab",
                    props: {
                        id: "resourcesTab",
                        items: webName,
                        tintColor: $color("#79E3FE")
                    },
                    layout: function (make, view) {
                        make.edges.insets($insets(0, 15, 0, 15))
                    }
                }]
            }, {
                title: "磁力资源站",
                rows: [{
                    type: "tab",
                    props: {
                        id: "btTab",
                        items: btWebName,
                        tintColor: $color("#79E3FE")
                    },
                    layout: function (make, view) {
                        make.edges.insets($insets(0, 15, 0, 15))
                    }
                }]
            }, {
                title: "Token",
                rows: [{
                    type: "input",
                    props: {
                        id: "tokenInput",
                        type: $kbType.search,
                        placeholder: "请输入Token"
                    },
                    layout: function (make, view) {
                        make.edges.insets($insets(0, 15, 0, 15))
                    },
                    events: {
                        returned: function (sender) {
                            $("tokenInput").blur()
                        }
                    }
                }, {
                    type: "label",
                    props: {
                        text: "*如未申请 Token, 请侧滑进入官网申请",
                        textColor: $color("#AAAAAA"),
                        font: $font(10)
                    },
                    layout: function (make, view) {
                        make.top.inset(0)
                        make.left.inset(20)
                    }
                }]
            }, {
                title: "关于",
                rows: [{
                    type: "view",
                    layout: function (make, view) {
                        make.edges.insets($insets(5, 0, 5, 0))
                    },
                    events: {
                        tapped: function (sender) {
                            $safari.open({
                                url: "https://www.notion.so/neurogram/Cinema-Club-0585b5ab248646c3a9772bdabdd66ffc"
                            })
                        }
                    },
                    views: [{
                        type: "label",
                        props: {
                            text: "📚 使用说明",
                            font: $font(18)
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.left.inset(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            text: "› ",
                            font: $font(30),
                            textColor: $color("#AAAAAA")
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.right.inset(10)
                        }
                    }],
                }, {
                    type: "view",
                    layout: function (make, view) {
                        make.edges.insets($insets(5, 0, 5, 0))
                    },
                    events: {
                        tapped: function (sender) {
                            scriptUpdata(1)
                        }
                    },
                    views: [{
                        type: "label",
                        props: {
                            id: "updateLabel",
                            text: "🤖 更新脚本",
                            font: $font(18)
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.left.inset(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            text: "› ",
                            font: $font(30),
                            textColor: $color("#AAAAAA")
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.right.inset(10)
                        }
                    }],
                }, {
                    type: "view",
                    layout: function (make, view) {
                        make.edges.insets($insets(5, 0, 5, 0))
                    },
                    events: {
                        tapped: function (sender) {
                            $safari.open({
                                url: "https://airtable.com/shrA1vmSMRtTZBdqb"
                            })
                        }
                    },
                    views: [{
                        type: "label",
                        props: {
                            text: "📥 脚本反馈",
                            font: $font(18)
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.left.inset(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            text: "› ",
                            font: $font(30),
                            textColor: $color("#AAAAAA")
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.right.inset(10)
                        }
                    }],
                }, {
                    type: "view",
                    layout: function (make, view) {
                        make.edges.insets($insets(5, 0, 5, 0))
                    },
                    events: {
                        tapped: function (sender) {
                            const buyMeaCoffee = require('scripts/coffee')
                            buyMeaCoffee.coffee("mainView")
                        }
                    },
                    views: [{
                        type: "label",
                        props: {
                            text: "☕️ 买杯咖啡",
                            font: $font(18)
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.left.inset(20)
                        }
                    }, {
                        type: "label",
                        props: {
                            text: "› ",
                            font: $font(30),
                            textColor: $color("#AAAAAA")
                        },
                        layout: function (make, view) {
                            make.centerY.equalTo(view.super)
                            make.right.inset(10)
                        }
                    }],
                }]
            }],
            header: {
                type: "view",
                props: {
                    height: 15,
                },
                views: []
            },
            footer: {
                type: "view",
                props: {
                    height: 80,
                },
                views: [{
                    type: "label",
                    props: {
                        text: "Sky Movie by Neurogram",
                        align: $align.center,
                        font: $font(".SFUIText", 12),
                        textColor: $color("#AAAAAA")
                    },
                    layout: function (make, view) {
                        make.centerX.equalTo(view.super)
                        make.top.inset(0)
                    }
                }]
            },
            actions: [
                {
                    title: "登陆",
                    color: $color("#79E3FE"),
                    handler: function (sender, indexPath) {
                        tokenGet("signIn")
                    }
                },
                {
                    title: "注册",
                    color: $color("#ED314A"),
                    handler: function (sender, indexPath) {
                        tokenGet("signUp")
                    }
                }
            ]
        },
        layout: $layout.fill,
        events: {
            rowHeight: function (sender, indexPath) {
                if (indexPath.section == 2 && indexPath.row == 1) {
                    return 15.0
                } else {
                    return 32
                }
            },
            swipeEnabled: function (sender, indexPath) {
                return indexPath.section == 2 && indexPath.row == 0
            }
        }
    }, {
        type: "view",
        props: {
            id: "settingBtViews",
            bgcolor: $color("#79E3FE")
        },
        layout: function (make, view) {
            make.bottom.inset(30)
            make.right.inset(15)
            make.size.equalTo($size(60, 50))
            shadow(view, 10, $size(1, 1), $color("#79E3FE"), 0.8, 5)
        },
        views: [{
            type: "button",
            props: {
                id: "settingFeedBt",
                src: "assets/save.png"
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.bottom.inset(10)
                make.size.equalTo($size(30, 30))
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    saveSettings()
                }
            }
        }]
    }]

    if (type == 0) {
        var subsetView = doubanViews
    } else if (type == 1) {
        playUrl = keyword
        var subsetView = feedbackViews
    } else {
        var subsetView = settingViews
    }

    let generalViews = {
        type: "view",
        props: {
            id: "generalBgView",
        },
        layout: $layout.fill,
        views: [{
            type: "blur",
            props: {
                id: "generalBlur",
                style: 1,
                alpha: 0
            },
            layout: $layout.fill,
        }, {
            type: "view",
            props: {
                id: "generalView"
            },
            layout: function (make, view) {
                make.left.right.inset(15)
                make.height.equalTo(screenHeight * 2.5 / 4)
                make.top.equalTo(view.super.bottom)
                shadow(view, 5, $size(1, 1), $color("lightGray"), 0.5, 10)
            },
            views: subsetView
        }]
    }

    $("mainView").add(generalViews)

    if (type == 2) {
        let settingConf = getConf()
        $("tokenInput").text = settingConf.movieToken
        $("resourcesTab").index = settingConf.resourcesWeb == "看电影网" ? 0 : 1
        $("btTab").index = settingConf.btWeb == "看电影网" ? 0 : 1
        scriptUpdata(0)
    }

    $delay(0.3, function () {
        $("generalBlur").animator.makeOpacity(0.3).animate(1)
        $("generalView").animator.moveY(-screenHeight * 2.5 / 4).easeOutBack.animate(1)
    });

}

function webBtEffect() {
    if ($("webBtViews").frame.width == 60) {
        $("webBtViews").animator.moveWidth(screenWidth - 120).anchorRight.easeOutExpo.animate(0.5)
        $("feedBt").animator.makeX(screenWidth - 105).animate(0.4)
        $("feedBt").src = "assets/feedback.png"
        $("webBackBt").animator.makeOpacity(1).makeX((screenWidth - 60) / 3 - 5).animate(0.4)
        $("webCloseBt").animator.makeOpacity(1).makeX((screenWidth - 60) / 3 * 2 - 15).animate(0.4)
        $("webForwardBt").animator.makeOpacity(1).animate(0.5)
    } else {
        let doubanUrl = $("doubanWeb").url.match(/movie\/subject\/\d+/)
        if (doubanUrl) {
            let id = doubanUrl[0].match(/\d+/)
            doubanFeeback(id[0])
        } else {
            alert("请打开影视详情页面后点击反馈")
        }
    }
}

function videoBtEffect() {
    if ($("videoBtViews").frame.width == 60) {
        $("videoBtViews").animator.moveWidth(screenWidth - 120).anchorRight.easeOutExpo.animate(0.5)
        $("videoFeedBt").animator.makeX(screenWidth - 105).animate(0.4)
        $("videoFeedBt").src = "assets/feedback.png"
        $("videoCloseBt").animator.makeOpacity(1).makeX((screenWidth - 60) / 2 - 15).animate(0.4)
        $("videoForwardBt").animator.makeOpacity(1).animate(0.5)
    } else {
        if (!$("emailInput").text || $("emailCheckResult").text == "*请输入正确的邮箱") {
            alert("请输入正确的邮箱")
        } else {
            videoFeedback()
        }
    }
}

async function doubanFeeback(id) {
    let idCheck = await $http.get("https://api.douban.com/v2/movie/subject/" + id)
    if (idCheck.data.msg == "movie_not_found") {
        alert("未找到该影片")
    } else {
        $ui.alert({
            title: "反馈以下影视到影视库",
            message: "《" + idCheck.data.title + "  " + idCheck.data.original_title + "》",
            actions: [
                {
                    title: "确定",
                    handler: function () {
                        keyWordsUpload(id)
                    }
                },
                {
                    title: "取消",
                    handler: function () {

                    }
                }
            ]
        })
    }
}

async function keyWordsUpload(id) {
    let authentication = await getToken()
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/ApiVideo/InputKeyWord",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "InputKey": "https://movie.douban.com/subject/" + id,
            "EVideoType": "3",
            "ObjectId": "1"
        }
    })
    if (results.data.Code != 200) {
        if (results.data.ErrMsg) {
            alert(results.data.ErrMsg)
        } else {
            alert("出错啦，请稍后重试！")
        }
    } else {
        alert(results.data.ResultData)
        generalViewOut(0)
    }
}

function emailCheck(email) {
    let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
    let isok = reg.test(email);
    if (!isok) {
        var result = false
    } else {
        var result = true
    }
    $("emailCheckResult").text = result == true ? "*该邮箱用于接收反馈结果" : "*请输入正确的邮箱"
    $("emailCheckResult").textColor = result == true ? $color("#AAAAAA") : $color("#D23f40")
}

async function videoFeedback() {
    let fbType = ["notplay", "slow", "error", "other"]
    let authentication = await getToken()
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/ApiVideo/Feedback",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "Url": playUrl,
            "Name": $("movieDetailTitle").text,
            "Type": fbType[$("feedbackType").index],
            "Email": $("emailInput").text,
            "Remark": $("feedbackText").text
        }
    })
    if (results.data.Code != 200) {
        if (results.data.ErrMsg) {
            alert(results.data.ErrMsg)
        } else {
            alert("出错啦，请稍后重试！")
        }
    } else {
        alert(results.data.ResultData)
        generalViewOut(1)
    }
}

function generalViewOut(type) {
    if (type == 0) {
        webForwardEffect()
    } else if (type == 1) {
        videoForwardEffect()
    }
    $delay(0.2, function () {
        $("generalView").animator.moveY(screenHeight * 2.5 / 4).easeInOutExpo.animate(1)
        $delay(0.3, function () {
            $ui.animate({
                duration: 0.4,
                animation: function () {
                    $("generalBgView").alpha = 0
                },
                completion: function () {
                    $("generalBgView").remove()
                    if (type == 0) {
                        let moviejs = require('/scripts/movie')
                        moviejs.movieGallery()
                    } else if (type == 1) {
                        $("movieDetailViews").animator.makeY(0).easeOutBack.animate(1)
                    }
                }
            })
        });
    });
}

function webForwardEffect() {
    $("webBtViews").animator.moveWidth(- screenWidth + 120).anchorRight.easeOutQuint.animate(0.8)
    $("feedBt").animator.makeX(15).animate(0.2)
    $("feedBt").src = "assets/web.png"
    $("webBackBt").animator.makeX(15).makeOpacity(0).animate(0.1)
    $("webCloseBt").animator.makeX(15).makeOpacity(0).animate(0.1)
    $("webForwardBt").animator.makeOpacity(0).animate(0.1)
}

function videoForwardEffect() {
    $("videoBtViews").animator.moveWidth(- screenWidth + 120).anchorRight.easeOutQuint.animate(0.8)
    $("videoFeedBt").animator.makeX(15).animate(0.1)
    $("videoFeedBt").src = "assets/web.png"
    $("videoCloseBt").animator.makeX(15).makeOpacity(0).animate(0.1)
    $("videoForwardBt").animator.makeOpacity(0).animate(0.1)
}

function shadow(view, scr, ssos, ssc, sso, ssr) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", scr)
    layer.invoke("setShadowOffset", ssos)
    layer.invoke("setShadowColor", ssc.runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", sso)
    layer.invoke("setShadowRadius", ssr)
}

async function getToken() {
    let token = JSON.parse($file.read("assets/settings.json").string)
    let timestamp = new Date().getTime().toString()
    timestamp = timestamp.match(/\d{10}/)
    let openToken = $text.MD5(token.movieToken + "parse_api" + timestamp[0])
    return {
        "openToken": openToken,
        "timestamp": timestamp[0],
        "key": token.movieToken
    }
}

function getConf() {
    return JSON.parse($file.read("assets/settings.json").string)
}

function tokenGet(type) {
    let step0 = type == "signIn" ? "\n1. 登陆" : "\n1. 注册登陆"
    let path = type == "signIn" ? "NewAdminMgr/AdminHome/Login" : "User/Register"
    $ui.alert({
        title: "申请流程",
        message: step0 + "\n\n2. 点击右上角 ≡ 菜单\n\n3. 点击 ❖ 个人中心\n\n4. 点击申请 𝖎 ApiKey\n\n5. 长按复制用户Token并粘贴到脚本内",
        actions: [
            {
                title: "我已认真阅读",
                handler: function () {
                    $safari.open({
                        url: "https://www.wxkdy666.com/" + path
                    })
                }
            }
        ]
    })
}

function settings() {
    $cache.set("settings", {
        "status": "updated"
    })
    scriptUpdata(1)
}

function saveSettings() {
    $("tokenInput").blur()
    let settingConf = getConf()
    settingConf.movieToken = $("tokenInput").text
    settingConf.resourcesWeb = webName[$("resourcesTab").index]
    settingConf.btWeb = btWebName[$("btTab").index]
    $file.write({
        data: $data({ string: JSON.stringify(settingConf) }),
        path: "assets/settings.json"
    })
    $delay(0.2, function () {
        generalViewOut(2)
    })
}

async function scriptUpdata(type) {
    let name = $addin.current.name
    if ($("updateLabel")) {
        if (type == 0) {
            $("updateLabel").text = "🤖 检测更新中..."
        } else {
            $("updateLabel").text = "⚠️ 请勿操作，更新中❗"
        }
    }
    let conf = await $http.get("https://raw.githubusercontent.com/Neurogram-R/JSBox/master/Neurogram/Conf.json")
    if (type == 0) {
        if (conf.data["Cinema Club"].version != "1.0.0(190325)") {
            $("updateLabel").text = "🤖 更新脚本 ❗"
        } else {
            $("updateLabel").text = "🤖 更新脚本"
        }
    } else {
        let link = conf.data["Cinema Club"].link
        let script = await $http.download(link)
        let settingConf = getConf()
        $addin.save({
            name: name,
            data: script.data,
            handler: function (success) {
                $addin.run({
                    name: name,
                    query: {
                        "settings": settingConf
                    }
                })
            }
        })
    }
}

module.exports = {
    generalViewIn: generalViewIn,
    settings: settings
}