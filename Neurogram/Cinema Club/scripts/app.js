const movieApp = require('/scripts/movie');
const general = require('/scripts/general');
const buyMeaCoffee = require('scripts/coffee')
buyMeaCoffee.showcoffee()

const theMovieMenu = ["全部", "电影", "电视剧", "纪录片", "动漫", "综艺", "电影系列", "我的收藏"]
const skyMovieMenu = ["全部", "最新增加", "海量电影", "电视剧", "动漫剧场", "综艺节目"]

var settings = JSON.parse($file.read("assets/settings.json").string)
if (settings.resourcesWeb == "Sky电影") {
    var menu = skyMovieMenu
} else {
    var menu = theMovieMenu
}

const screenWidth = $device.info.screen.width
const screenHeight = $device.info.screen.height
var menuIndex = 0

$ui.render({
    props: {
        id: "mainView",
        navBarHidden: 1,
        homeIndicatorHidden: 1
    },
    views: [{
        type: "image",
        props: {
            id: "bottomPoster",
            alpha: 0
        },
        layout: function (make, view) {
            make.top.left.right.inset(0)
            make.height.equalTo(screenWidth * 9 / 6)
        }
    }, {
        type: "blur",
        props: {
            style: 1,
            alpha: 0.3
        },
        layout: $layout.fill
    }, {
        type: "gradient",
        props: {
            id: "bottomGradient",
            colors: [$color("#4886f8"), $color("#771efb"), $color("#f1f1ee")],
            locations: [0.0, 0.2, 0.2],
            startPoint: $point(0.9, 0),
            endPoint: $point(1, 1)
        },
        layout: $layout.fill
    }, {
        type: "view",
        props: {
            id: "topBar"
        },
        layout: function (make, view) {
            make.top.left.right.inset(0)
            make.bottom.equalTo(view.super.topMargin).offset(80)
        },
        views: [{
            type: "label",
            props: {
                id: "topBarTitle",
                text: menu == theMovieMenu ? "THE MOVIE" : "SKY MOVIE",
                bgcolor: $color("clear"),
                font: $font(".SFUIText-Bold", 30),
                textColor: $color("#DDE2EA")
            },
            layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.top.equalTo(view.super.topMargin)
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    sender.animator.rotateX(360).animate(1.0)
                    menuUpdate(0)
                },
                longPressed: function (info) {
                    $device.taptic(2)
                    $("topBarTitle").animator.rotateX(360).animate(1.0)
                    general.generalViewIn(2)
                }
            }
        }, {
            type: "button",
            props: {
                bgcolor: $color("clear"),
                icon: $icon("067", $color("#DDE2EA"), $size(20, 20))
            },
            layout: function (make, view) {
                make.left.inset(15)
                make.top.equalTo(view.super.topMargin).inset(10)
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    filter()
                }
            }
        }, {
            type: "button",
            props: {
                id: "searchBt",
                icon: $icon("023", $color("#DDE2EA"), $size(20, 20)),
                bgcolor: $color("clear"),
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.top.equalTo(view.super.topMargin).inset(10)
            },
            events: {
                tapped: async function (sender) {
                    $device.taptic(2)
                    let searchText = await $input.text({
                        placeholder: "Input a keyword"
                    })
                    if (searchText) {
                        search(searchText)
                    }
                }
            }
        }]
    }]
})

function launch() {
    menuDataUpdate()
    galleryViewsUpdate()
}

$delay(0.3, function () {
    $("topBarTitle").animator.rotateX(360).animate(1.0)
    menuMatrixEffect(0)
});

function menuMatrixEffect(row) {
    for (var i = 0; i < menu.length; i++) {
        let cell = $("menuMatrix").cell($indexPath(0, i))
        let cellView = cell.views[0].views[0].views[0]
        if (i == row) {
            cellView.textColor = $color("#F9FAF1")
            cellView.font = $font(".SFUIText-Bold", 25)
        } else {
            cellView.textColor = $color("#DDE2EA")
            cellView.font = $font(".SFUIText", 20)
        }
    }
}

function menuDataUpdate() {
    let menuData = []
    for (var i in menu) {
        menuData.push({
            menuLabel: {
                text: menu[i]
            }
        })
    }

    let menuViews = {
        type: "scroll",
        props: {
            id: "menuScroll",
            clipsToBounds: 0,
            bgcolor: $color("clear"),
            alwaysBounceVertical: 0,
            showsHorizontalIndicator: 0
        },
        layout: function (make, view) {
            make.width.equalTo(view.super)
            make.top.equalTo(view.super.topMargin).offset(40)
            make.height.equalTo(40)
        },
        views: [
            {
                type: "matrix",
                props: {
                    id: "menuMatrix",
                    scrollEnabled: 0,
                    bgcolor: $color("clear"),
                    columns: menu.length,
                    itemHeight: 30,
                    spacing: 5,
                    waterfall: 1,
                    data: menuData,
                    template: {
                        props: {},
                        views: [
                            {
                                type: "view",
                                props: {
                                    bgcolor: $color("clear")
                                },
                                layout: function (make, view) {
                                    make.center.equalTo(view.super)
                                    make.width.equalTo(view.super)
                                    make.height.equalTo(30)
                                },
                                views: [{
                                    type: "label",
                                    props: {
                                        id: "menuLabel",
                                        bgcolor: $color("clear"),
                                        textColor: $color("#DDE2EA"),
                                        align: $align.center,
                                        font: $font(".SFUIText", 20)
                                    },
                                    layout: $layout.fill
                                }]
                            }
                        ]
                    }
                },
                layout: function (make, view) {
                    make.width.equalTo(menu.length * 105 + 5)
                    make.height.equalTo(view.super)
                },
                events: {
                    didSelect: function (sender, indexPath, data) {
                        $device.taptic(2)
                        menuMatrixEffect(indexPath.row)
                        menuMatrix(indexPath.row)
                    }
                }
            }
        ]
    }
    $("topBar").add(menuViews)
}

var gallery = {
    type: "view",
    props: {
        id: "galleryView"
    },
    layout: function (make, view) {
        make.bottom.left.right.inset(0)
        make.top.equalTo(view.super.topMargin).offset(80)
    },
    views: [{
        type: "gallery",
        props: {
            bgcolor: $color("clear"),
            items: [
                {
                    type: "view",
                    props: {
                        bgcolor: $color("clear")
                    },
                    views: [{
                        type: "view",
                        props: {
                            id: "movieGallery",
                            bgcolor: $color("clear")
                        },
                        layout: $layout.fill
                    }]
                },
                {
                    type: "view",
                    props: {
                        bgcolor: $color("clear")
                    },
                    views: [{
                        type: "view",
                        props: {
                            id: "tvGallery",
                            bgcolor: $color("clear")
                        },
                        layout: $layout.fill
                    }]
                },
                {
                    type: "view",
                    props: {
                        bgcolor: $color("clear")
                    },
                    views: [{
                        type: "view",
                        props: {
                            id: "btGallery",
                            bgcolor: $color("clear")
                        },
                        layout: $layout.fill
                    }]
                }
            ],
            interval: 0
        },
        layout: $layout.fill,
        events: {
            changed: function (sender) {

            }
        }
    }, {
        type: "view",
        props: {
            id: "galleryShield",
            hidden: 1
        },
        layout: $layout.fill
    }]
}

$("mainView").add(gallery)

function galleryViewsUpdate() {
    movieApp.launch()

    tvGalleryViews = {
        type: "label",
        props: {
            text: "即将到来...",
            textColor: $color("#4886f8"),
            font: $font(".SFUIText-Bold", 45)
        },
        layout: function (make, view) {
            make.center.equalTo(view.super)
        }
    }

    btGalleryViews = {
        type: "label",
        props: {
            text: "敬请期待...",
            textColor: $color("#771efb"),
            font: $font(".SFUIText-Bold", 45)
        },
        layout: function (make, view) {
            make.center.equalTo(view.super)
        }
    }

    $("tvGallery").add(tvGalleryViews)
    $("btGallery").add(btGalleryViews)

}

function menuMatrix(row) {
    menuIndex = row
    let type = $("topBarTitle").text
    if (type == "THE MOVIE" || type == "SKY MOVIE") {
        movieApp.categoryUpdate(row)
    }
}

function filter() {
    let type = $("topBarTitle").text
    if (type == "THE MOVIE" || type == "SKY MOVIE") {
        movieApp.filter(menuIndex)
    }
}

function search(keyword) {
    let type = $("topBarTitle").text
    if (type == "THE MOVIE" || type == "SKY MOVIE") {
        movieApp.search(keyword, 0, 1)
    }
}

function menuUpdate(type) {
    let title = $("topBarTitle").text
    if (type == 0) {
        if (title == "THE MOVIE") {
            title = "SKY MOVIE"
            menu = skyMovieMenu
        } else if (title == "SKY MOVIE") {
            title = "THE MOVIE"
            menu = theMovieMenu
        }
        $delay(0.6, function () {
            movieApp.movieGallery()
        })
    }
    $("menuScroll").remove()
    menuDataUpdate()
    $delay(0.5, function () {
        $("topBarTitle").text = title
        menuMatrixEffect(0)

    })
}

module.exports = {
    launch: launch
}