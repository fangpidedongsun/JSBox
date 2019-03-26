const general = require('/scripts/general');
const buyMeaCoffee = require('scripts/coffee')

const theMovieYears = ["全部", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2010", "更早"]
const theMovieGenres = ["全部", "动作", "科幻", "喜剧", "武侠", "古装"]
const theMovieCountries = ["全部", "中国大陆", "香港", "美国", "韩国", "日本"]
const skyMovieYears = ["全部", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2010", "2009", "2008", "2007"]
const skyMovieGenres = ["全部", "动作片", "喜剧片", "爱情片", "科幻片", "恐怖片", "剧情片", "战争片", "伦理", "国产剧", "港剧", "韩剧", "剧情", "欧美剧", "日剧", "台剧", "泰剧"]
const skyMovieCountries = ["全部", "大陆", "美国", "加拿大", "香港", "韩国", "日本", "台湾", "泰国", "西班牙", "法国 ", "印度", "英国"]
const screenWidth = $device.info.screen.width
const screenHeight = $device.info.screen.height
var resultType = 0
var page = 1
var playUrl
var movieKeyword = ""
var oldMovieData = []
var movieYear
var movieGenre
var movieCountry
var movieCategory
var menuIndex
var seriesType
var seriesId
$app.autoKeyboardEnabled = true

function launch() {
    let movieListViews = {
        type: "list",
        props: {
            id: "movieList",
            bgcolor: $color("clear"),
            rowHeight: 150,
            separatorHidden: 1,
            showsVerticalIndicator: 0,
            footer: {
                type: "label",
                props: {
                    id: "pageLabel",
                    height: 50,
                    text: "上拉加载更多",
                    textColor: $color("#79E3FE"),
                    align: $align.center,
                    font: $font(".SFUIText", 15)
                }
            },
            template: {
                props: {
                    bgcolor: $color("clear")
                },
                views: [
                    {
                        type: "view",
                        props: {
                            bgcolor: $color("white")
                        },
                        layout: function (make, view) {
                            make.edges.insets($insets(25, 90, 0, 25))
                            shadow(view, 5, $size(1, 1), $color("lightGray"), 0.3, 5)
                        },
                        views: [{
                            type: "label",
                            props: {
                                id: "movieTitle",
                                textColor: $color("black"),
                                align: $align.left,
                                font: $font(".SFUIText-Bold", 20),
                                autoFontSize: 1
                            },
                            layout: function (make, view) {
                                make.top.inset(10)
                                make.left.inset(50)
                                make.right.inset(15)
                            }
                        }, {
                            type: "label",
                            props: {
                                id: "movieDirector",
                                textColor: $color("lightGray"),
                                align: $align.left,
                                font: $font(".SFUIText", 15),
                                autoFontSize: 1
                            },
                            layout: function (make, view) {
                                make.top.inset(40)
                                make.left.inset(50)
                                make.right.inset(15)
                            }
                        }, {
                            type: "matrix",
                            props: {
                                id: "ratingMatrix",
                                columns: 5,
                                square: 1,
                                scrollEnabled: 0,
                                template: {
                                    props: {},
                                    views: [
                                        {
                                            type: "button",
                                            props: {
                                                id: "movieRating",
                                                bgcolor: $color("clear"),
                                                icon: $icon("062", $color("#79E3FE"))
                                            },
                                            layout: function (make, view) {
                                                make.center.equalTo(view.super)
                                                make.size.equalTo($size(15, 15))
                                            }
                                        }
                                    ]
                                }
                            },
                            layout: function (make, view) {
                                make.top.inset(65)
                                make.left.inset(50)
                                make.width.equalTo(105)
                                make.height.equalTo(20)
                            }
                        }, {
                            type: "label",
                            props: {
                                id: "movieGenres",
                                textColor: $color("black"),
                                align: $align.left,
                                font: $font(".SFUIText-Bold", 15),
                                autoFontSize: 1
                            },
                            layout: function (make, view) {
                                make.top.inset(95)
                                make.left.inset(50)
                                make.right.inset(15)
                            }
                        }]
                    }, {
                        type: "view",
                        layout: function (make, view) {
                            make.size.equalTo($size(110, 110))
                            make.left.inset(20)
                            make.top.inset(10)
                            shadow(view, 10, $size(0, 5), $color("lightGray"), 0.5, 5)
                        },
                        views: [{
                            type: "image",
                            props: {
                                id: "moviePoster",
                                radius: 10
                            },
                            layout: $layout.fill
                        }]
                    }, {
                        type: "label",
                        props: {
                            id: "movieYear",
                            textColor: $color("lightGray"),
                            align: $align.left,
                            font: $font(".SFUIText-Bold", 13),
                            autoFontSize: 1
                        },
                        layout: function (make, view) {
                            make.top.inset(125)
                            make.left.inset(20)
                            make.width.equalTo(60)
                        }
                    }
                ]
            }
        },
        layout: $layout.fill,
        events: {
            didScroll: function (sender) {
                gradientEffect(sender.contentOffset.y, $("topBar").frame.height / screenHeight, 0.2, 800)
            },
            didSelect: function (sender, indexPath, data) {
                $device.taptic(2)
                if (menuIndex == 6) {
                    page = 1
                    if (seriesType == 0) {
                        movieSeriesList(0, data.movieTitle.info)
                    } else {
                        movieDetail(data.movieTitle.info)
                    }
                } else {
                    movieDetail(data.movieTitle.info)
                }
            },
            didReachBottom: function (sender) {
                $delay(0.1, function () {
                    sender.endFetchingMore()
                    page = page + 1
                    if ($("topBarTitle").text == "THE MOVIE") {
                        if (menuIndex == 6) {
                            if (seriesType == 0) {
                                movieSeries(1)
                            } else {
                                movieSeriesList(1, seriesId)
                            }
                        } else if (menuIndex == 7) {
                            myFavorite(1)
                        } else {
                            if (resultType == 0) {
                                theMovieGallery(1, movieYear, movieGenre, movieCountry, movieCategory)
                            } else {
                                search(movieKeyword, 1, page)
                            }
                        }
                    } else {
                        skyMovieGallery(1, movieYear, movieGenre, movieCountry, movieCategory, movieKeyword)
                    }
                })
            }
        }
    }
    $("movieGallery").add(movieListViews)
    movieGallery()
}

function movieGallery() {
    oldMovieData = []
    page = 1
    if ($("topBarTitle").text == "THE MOVIE") {
        theMovieGallery(0, 0, 0, 0, 0)
    } else {
        skyMovieGallery(0, skyMovieYears[0], skyMovieGenres[0], skyMovieCountries[0], 0, "")
    }
}

async function theMovieGallery(type, year, genre, country, category) {
    resultType = 0
    movieYear = year
    movieGenre = genre
    movieCountry = country
    movieCategory = category
    if (type == 0) {
        $("movieList").data = []
    }
    let authentication = await getToken()
    $("pageLabel").text = "加载中......"
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/ApiVideo/FilmList",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "FilmType": category,
            "Page": page,
            "PageSize": "10",
            "Year": year,
            "Genre": genre,
            "Countries": country
        }
    })
    $("pageLabel").text = "上拉加载更多"
    if (results.data.Code != 200) {
        if (results.data.Code == 201) {
            $("pageLabel").text = "已经到底啦"
        } else {
            if (results.data.ErrMsg) {
                if (results.data.ErrMsg == "Key Error") {
                    tokenError()
                } else {
                    alert(results.data.ErrMsg)
                }
            } else {
                alert("出错啦，请稍后重试！")
            }
        }
    } else {
        listDataUpdata(results.data, type)
    }
}

function listDataUpdata(data, type) {
    let resultData = data.ResultData
    let movieListData = []
    for (var i = 0; i < resultData.length; i++) {
        let ratingNum = Math.round(resultData[i].VideoRating / 2)
        let ratingData = ratingDataMaker(ratingNum, "movieRating")

        movieListData.push({
            moviePoster: {
                src: resultData[i].ResultImg
            },
            movieTitle: {
                text: resultData[i].ResultName,
                info: resultData[i].objectId.toString()
            },
            movieDirector: {
                text: resultData[i].VideoDirectors ? "by " + resultData[i].VideoDirectors : "by 无"
            },
            ratingMatrix: {
                data: ratingData
            },
            movieGenres: {
                text: dataCheck(resultData[i].VideoGenres)
            },
            movieYear: {
                text: resultData[i].VideoYear.toString()
            }
        })
    }

    if (type == 0) {
        oldMovieData = movieListData
    } else {
        oldMovieData = oldMovieData.concat(movieListData)
    }
    $("movieList").data = oldMovieData
}

async function skyMovieGallery(type, year, genre, country, category, keyword) {
    const skyMovieTypeData = ["dyList", "updatetime", "movie", "tv", "comic", "variety", "other"]

    movieYear = year
    movieGenre = genre
    movieCountry = country
    movieCategory = category

    if (type == 0) {
        $("movieList").data = []
    }
    $("pageLabel").text = "加载中......"
    let categoryNum = category
    category = skyMovieTypeData[category] == "updatetime" || skyMovieTypeData[category] == "dyList" ? "&orderBy=" : "&type="
    genre = genre == "全部" ? "" : genre
    country = country == "全部" ? "" : country
    year = year == "全部" ? "" : year
    if (keyword) {
        movieKeyword = keyword
    } else {
        keyword = ""
    }

    let skyMovieFilter = "pageIndex=" + page + category + skyMovieTypeData[categoryNum] + "&CategoryType=" + $text.URLEncode(genre) + "&CategoryArea=" + $text.URLEncode(country) + "&Year=" + year + "&searchKey=" + $text.URLEncode(keyword)
    let results = await $http.get("http://api.skyrj.com/api/movies?" + skyMovieFilter)
    $("pageLabel").text = "上拉加载更多"
    if (results.data.length == 0) {
        $("pageLabel").text = "已经到底啦"
        if (page == 1) {
            alert("未找到相关影视")
            movieGallery()
        }
    } else {
        skyListDataUpdata(results.data, type)
    }
}

function skyListDataUpdata(resultData, type) {
    let movieListData = []
    for (var i = 0; i < resultData.length; i++) {
        let ratingNum = Math.round(resultData[i].Score / 2)
        let ratingData = ratingDataMaker(ratingNum, "movieRating")

        movieListData.push({
            moviePoster: {
                src: resultData[i].Cover
            },
            movieTitle: {
                text: resultData[i].Name,
                info: resultData[i].ID.toString()
            },
            movieDirector: {
                text: resultData[i].MovieTitle ? resultData[i].MovieTitle : "可观看"
            },
            ratingMatrix: {
                data: ratingData
            },
            movieGenres: {
                text: dataCheck(resultData[i].Tags)
            },
            movieYear: {
                text: resultData[i].Year.toString()
            }
        })
    }
    if (type == 0) {
        oldMovieData = movieListData
    } else {
        oldMovieData = oldMovieData.concat(movieListData)
    }
    $("movieList").data = oldMovieData
}

async function movieDetail(movieId) {
    $("galleryShield").hidden = 0
    if ($("topBarTitle").text == "THE MOVIE") {
        let authentication = await getToken()
        let results = await $http.post({
            url: "https://api.wxkdy666.com/KdyApi/ApiVideo/Detail",
            header: {
                "OpenToken": authentication.openToken,
                "Timestamp": authentication.timestamp,
                "Key": authentication.key
            },
            body: {
                "ObjectId": movieId,
                "pagesize": "100"
            }
        })
        $("galleryShield").hidden = 1
        let resultsData = results.data.ResultData
        let resourcesData = []
        for (var i in resultsData.EpisodeList) {
            resourcesData.push({
                playName: {
                    text: " " + resultsData.EpisodeList[i].EpisodeName + " ",
                    info: "https://www.wxkdy666.com/Movie/VodPlay/" + resultsData.EpisodeList[i].EpisodeUrl
                }
            })
        }
        let ratingNum = Math.round(resultsData.VideoRating / 2)
        let ratingData = ratingDataMaker(ratingNum, "movieDetailRating")
        var detailsData = {
            title: resultsData.ResultName,
            director: resultsData.VideoDirectors ? "by " + resultsData.VideoDirectors : "by 无",
            ratingStar: ratingData,
            ratingNum: resultsData.VideoRating.toString() + "/10",
            genres: dataCheck(resultsData.VideoGenres),
            intro: `主演：${dataCheck(resultsData.VideoCasts)}\n\n剧情简介：${resultsData.VideoSummary}`,
            poster: resultsData.ResultImg,
            resources: resourcesData,
            videoCode: resultsData.VideoContentFeature,
            movieId: movieId,
            favorite: resultsData.SubscribeId ? resultsData.SubscribeId : "0"
        }
    } else {
        let results = await $http.get("http://api.skyrj.com/api/movie?id=" + movieId)
        $("galleryShield").hidden = 1
        let resultsData = results.data
        let resourcesData = []
        for (var i in resultsData.MoviePlayUrls) {
            resourcesData.push({
                playName: {
                    text: " " + resultsData.MoviePlayUrls[i].Name + " ",
                    info: resultsData.MoviePlayUrls[i].PlayUrl
                }
            })
        }
        let ratingNum = Math.round(resultsData.Score / 2)
        let ratingData = ratingDataMaker(ratingNum, "movieDetailRating")
        var detailsData = {
            title: resultsData.Name,
            director: resultsData.MovieTitle ? resultsData.MovieTitle : "可观看",
            ratingStar: ratingData,
            ratingNum: resultsData.Score.toString() + "/10",
            genres: dataCheck(resultsData.Tags),
            intro: resultsData.Introduction,
            poster: resultsData.Cover,
            resources: resourcesData
        }

    }
    movieDetailIn(detailsData)
}

var moveBeganLocationY
var movieInfoLocationY
var movieDetailPosterLocationY
var movieInfoConfirm = 0

function movieDetailIn(detailsData) {

    let moviePlayViews = {
        type: "view",
        props: {
            id: "moviePlayViews",
            bgcolor: $color("clear"),
            alpha: 0
        },
        layout: $layout.fill,
        views: [
            {
                type: "view",
                props: {
                    bgcolor: $color("clear"),
                },
                layout: function (make, view) {
                    make.left.right.inset(15)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo((screenWidth - 30) * 3 / 4)
                    make.bottom.inset(screenHeight * 2.5 / 4 - 125)
                    shadow(view, 5, $size(1, 1), $color("lightGray"), 1, 5)
                },
                views: [
                    {
                        type: "video",
                        props: {
                            radius: 5,
                            alpha: 0
                        },
                        layout: $layout.fill,
                        views: [
                            {
                                type: "view",
                                props: {
                                    bgcolor: $color("#232323"),
                                    radius: 10,
                                    hidden: $("topBarTitle").text == "THE MOVIE" ? 0 : 1
                                },
                                layout: function (make, view) {
                                    make.centerX.equalTo(view.super)
                                    make.top.inset(6)
                                    make.size.equalTo($size(50, 30))
                                },
                                views: [{
                                    type: "button",
                                    props: {
                                        src: "assets/feedbackGray.png"
                                    },
                                    layout: function (make, view) {
                                        make.center.equalTo(view.super)
                                        make.size.equalTo($size(20, 20))
                                    },
                                    events: {
                                        tapped: function (sender) {
                                            $device.taptic(2)
                                            general.generalViewIn(1, playUrl)
                                        }
                                    }
                                }]
                            }
                        ]
                    }
                ]
            },
            {
                type: "matrix",
                props: {
                    id: "playMatrix",
                    bgcolor: $color("white"),
                    columns: 4,
                    itemHeight: 32,
                    spacing: 5,
                    showsVerticalIndicator: 0,
                    data: detailsData.resources,
                    footer: {
                        type: "label",
                        props: {
                            height: 80,
                        }
                    },
                    template: {
                        views: [
                            {
                                type: "view",
                                props: {
                                    bgcolor: $color("white")
                                },
                                layout: function (make, view) {
                                    make.edges.insets(0, 0, 0, 0)
                                    shadow(view, 5, $size(1, 1), $color("lightGray"), 0.3, 5)
                                },
                                views: [{
                                    type: "label",
                                    props: {
                                        id: "playName",
                                        textColor: $color("gray"),
                                        align: $align.center,
                                        autoFontSize: true
                                    },
                                    layout: function (make, view) {
                                        make.center.equalTo(view.super)
                                        make.edges.equalTo(0)
                                    }
                                }]
                            }
                        ]
                    }
                },
                layout: function (make, view) {
                    make.top.equalTo(view.super.bottom)
                    make.height.equalTo(screenHeight * 2.5 / 4 - 125)
                    make.left.right.inset(30)
                },
                events: {
                    didSelect: function (sender, indexPath, data) {
                        $device.taptic(2)
                        watchOrShare(data.playName.info, "watch", indexPath, detailsData.resources)
                    },
                    didLongPress: function (sender, indexPath, data) {
                        $device.taptic(2)
                        watchOrShare(data.playName.info, "share", indexPath, detailsData.resources)
                    }
                }
            }

        ]
    }

    let movieIntroHeight = introHeight(detailsData.intro)
    let movieInfoViewHeight = movieIntroHeight + 200
    if (movieInfoViewHeight < screenHeight * 2.5 / 4) {
        movieInfoViewHeight = screenHeight * 2.5 / 4
    }
    let movieDetailViews = {
        type: "view",
        props: {
            id: "movieDetailViews",
            bgcolor: $color("clear"),
        },
        layout: function (make, view) {
            make.left.right.inset(0)
            make.height.equalTo(screenHeight)
            make.centerY.equalTo(screenHeight)
        },
        views: [{
            type: "button",
            props: {
                id: "favoriteBt",
                bgcolor: $color("clear"),
                alpha: 0.8
            },
            layout: function (make, view) {
                make.right.inset(15)
                make.top.inset($("searchBt").frame.y)
            },
            events: {
                tapped: function (sender) {
                    $device.taptic(2)
                    movieFavorite(detailsData.movieId, detailsData.favorite)
                }
            }
        }, {
            type: "view",
            props: {
                id: "movieInfoView",
                bgcolor: $color("white"),
            },
            layout: function (make, view) {
                make.left.right.inset(15)
                make.height.equalTo(movieInfoViewHeight)
                make.top.equalTo(view.super.bottom)
                shadow(view, 5, $size(1, 1), $color("lightGray"), 0.5, 10)
            },
            events: {
                touchesBegan: function (sender, location) {
                    moveBeganLocationY = location.y
                },
                touchesMoved: function (sender, location) {
                    movieInfoEffect(moveBeganLocationY - location.y)
                },
                touchesEnded: function (sender, location) {
                    movieDetailCancelOut(movieInfoViewHeight)
                }
            },
            views: [{
                type: "label",
                props: {
                    id: "movieDetailTitle",
                    text: detailsData.title,
                    textColor: $color("black"),
                    align: $align.left,
                    font: $font(".SFUIText-Bold", 25),
                    autoFontSize: 1
                },
                layout: function (make, view) {
                    make.top.inset(25)
                    make.left.inset((screenWidth - 30) * 1 / 3 + 30)
                    make.right.inset(15)
                }
            }, {
                type: "label",
                props: {
                    id: "movieDetailDirector",
                    text: detailsData.director,
                    textColor: $color("lightGray"),
                    align: $align.left,
                    font: $font(".SFUIText", 15),
                    lines: 2
                },
                layout: function (make, view) {
                    make.top.inset(60)
                    make.left.inset((screenWidth - 30) * 1 / 3 + 30)
                    make.right.inset(15)
                }
            }, {
                type: "matrix",
                props: {
                    id: "ratingDetailMatrix",
                    columns: 5,
                    square: 1,
                    scrollEnabled: 0,
                    data: detailsData.ratingStar,
                    template: {
                        props: {},
                        views: [
                            {
                                type: "button",
                                props: {
                                    id: "movieDetailRating",
                                    bgcolor: $color("clear"),
                                    icon: $icon("062", $color("#79E3FE"))
                                },
                                layout: function (make, view) {
                                    make.center.equalTo(view.super)
                                    make.size.equalTo($size(15, 15))
                                }
                            }
                        ]
                    }
                },
                layout: function (make, view) {
                    make.top.inset(105)
                    make.left.inset((screenWidth - 30) * 1 / 3 + 30)
                    make.width.equalTo(105)
                    make.height.equalTo(20)
                }
            }, {
                type: "label",
                props: {
                    id: "movieDetailRatingNum",
                    text: detailsData.ratingNum,
                    textColor: $color("#79E3FE"),
                    align: $align.left,
                    font: $font(".SFUIText", 15)
                },
                layout: function (make, view) {
                    make.centerY.equalTo($("ratingDetailMatrix").centerY)
                    make.left.equalTo($("ratingDetailMatrix").right).inset(15)
                }
            }, {
                type: "label",
                props: {
                    id: "movieDetailGenres",
                    text: detailsData.genres,
                    textColor: $color("black"),
                    align: $align.center,
                    font: $font(".SFUIText-Bold", 16),
                    autoFontSize: 1
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(15)
                    make.top.equalTo($("ratingDetailMatrix").bottom).inset(20)
                }
            }, {
                type: "label",
                props: {
                    id: "movieDetailIntro",
                    text: detailsData.intro,
                    textColor: $color("lightGray"),
                    align: $align.left,
                    font: $font(".SFUIText", 15),
                    lines: 0
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(15)
                    make.height.equalTo(movieIntroHeight)
                    make.top.equalTo($("movieDetailGenres").bottom).inset(20)
                }
            }]
        }, {
            type: "view",
            props: {
                id: "movieDetailPosterView",
                bgcolor: $color("white")
            },
            views: [{
                type: "image",
                props: {
                    id: "movieDetailPoster",
                    src: detailsData.poster,
                    bgcolor: $color("white"),
                    radius: 5
                },
                layout: $layout.fill
            }],
            layout: function (make, view) {
                let width = (screenWidth - 30) * 1 / 3
                make.left.inset(30)
                make.bottom.inset(screenHeight * 2.5 / 4 - width * 4 / 3 + 30)
                make.size.equalTo($size(width, width * 4 / 3))
                shadow(view, 10, $size(0, 5), $color("lightGray"), 0.5, 5)
            }
        },
            moviePlayViews
            , {
            type: "view",
            props: {
                id: "ticketViews",
                bgcolor: $color("#79E3FE")
            },
            layout: function (make, view) {
                make.right.bottom.inset(30)
                make.size.equalTo($size(60, 50))
                shadow(view, 10, $size(1, 1), $color("#79E3FE"), 0.8, 5)
            },
            views: [{
                type: "button",
                props: {
                    id: "forwardBt",
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
                        forwardEffect(detailsData.resources)
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "coffeeBt",
                    src: "assets/coffee.png",
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
                        buyMeaCoffee.coffee("mainView")
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "ticketBt",
                    src: "assets/ticket.png",
                },
                layout: function (make, view) {
                    make.right.inset(15)
                    make.bottom.inset(10)
                    make.size.equalTo($size(30, 30))
                },
                events: {
                    tapped: function (sender) {
                        $device.taptic(2)
                        ticketEffect()
                    }
                }
            }]
        }]
    }

    $("mainView").add(movieDetailViews)
    $("gallery").hidden = 1
    $("topBar").hidden = 1

    if (detailsData.favorite) {
        var favoriteColor = detailsData.favorite == "0" ? $color("#DDE2EA") : $color("#ED314A")
        $("favoriteBt").info = detailsData.favorite
        $("favoriteBt").icon = $icon("061", favoriteColor, $size(20, 20))
        $("movieDetailTitle").info = detailsData.videoCode
    } else {
        $("favoriteBt").hidden = 1
    }

    $delay(0.3, function () {
        $("bottomPoster").src = detailsData.poster
        $("movieDetailViews").animator.moveY(-screenHeight).easeOutBack.animate(1)
        $("movieInfoView").animator.moveY(-screenHeight * 2.5 / 4).easeOutBack.animate(1)
        $ui.animate({
            duration: 1,
            animation: function () {
                $("bottomGradient").locations = [0.0, 0.5, 0.5]
                $("bottomGradient").colors = [$color("clear"), $color("clear"), $color("#f1f1ee")]
                $("bottomPoster").alpha = 1
            },
            completion: function () {
                movieInfoLocationY = $("movieInfoView").frame.y
                movieDetailPosterLocationY = $("movieDetailPosterView").frame.y
            }
        })

    })
}

function movieDetailCancelOut(viewHeight) {
    let range = $("movieInfoView").frame.y - movieInfoLocationY

    if (range < 100 && range > 0) {
        $("movieInfoView").animator.makeY(movieInfoLocationY).easeOutBack.animate(1)
        $("movieDetailPosterView").animator.makeY(movieDetailPosterLocationY).easeOutBack.animate(1)
    } else if (range < - viewHeight / 2) {
        movieIntroReset("easeInBack", 1)
    }
}

function movieInfoEffect(num) {
    if ($("movieInfoView").frame.y > movieInfoLocationY + 100) {
        if (movieInfoConfirm == 1) {
            $device.taptic(2)
            $("movieDetailViews").animator.moveY(screenHeight).easeInOutExpo.animate(1)
            $("movieInfoView").animator.moveY(screenHeight * 2.5 / 4 + 100).easeInOutExpo.animate(1)
            movieInfoConfirm = 0
            if (menuIndex == 7) {
                page = 1
                myFavorite(0)
            }
            $delay(0.3, function () {
                $ui.animate({
                    duration: 1,
                    animation: function () {
                        $("bottomGradient").locations = [0.0, 0.2, 0.2]
                        $("bottomGradient").colors = [$color("#4886f8"), $color("#771efb"), $color("#f1f1ee")]
                        $("bottomPoster").alpha = 0

                        $("gallery").hidden = 0
                        $("topBar").hidden = 0
                    },
                    completion: function () {
                        $("movieDetailViews").remove()
                    }
                })
            });
        }
    } else {
        movieInfoConfirm = 1
        $("movieDetailPosterView").animator.moveY(-num).easeOutBack.animate(1)
        $("movieInfoView").animator.moveY(-num).easeOutBack.animate(1)
        gradientEffect(movieInfoLocationY - $("movieInfoView").frame.y, 0.3, 0.5, 1600)
    }
}

function movieIntroReset(curve, time) {
    $("movieInfoView").animator.makeY(movieInfoLocationY)[curve].animate(time)
    $("movieDetailPosterView").animator.makeY(movieDetailPosterLocationY)[curve].animate(time)
    $("bottomGradient").locations = [0.0, 0.5, 0.5]
    $("bottomGradient").startPoint = $point(0.9, 0)
}

function ticketEffect() {
    if ($("ticketViews").frame.width == 60) {
        $("ticketViews").animator.moveWidth(screenWidth - 120).anchorRight.easeOutExpo.animate(0.5)
        $("ticketBt").animator.makeX((screenWidth - 60) / 2 - 15).animate(0.4)
        $("coffeeBt").animator.makeX(screenWidth - 105).makeOpacity(1).animate(0.8)
        $("forwardBt").animator.makeOpacity(1).animate(0.5)
        $("moviePlayViews").animator.makeOpacity(1).animate(0.1)
        movieIntroReset("easeOutExpo", 0.5)
        $("playMatrix").animator.moveY(-screenHeight * 2.5 / 4 + 145).animate(0.3)
    } else {
        $ui.alert({
            title: "希望您支持正版影视",
            message: "\n版权声明：此脚本为非赢利性项目，脚本所有内容均来源于互联网相关站点自动搜索采集信息。\n\n免责声明：脚本所有信息均为采集引用,不存有资源,若有侵权行为,请在任意影视详情内反馈。请大家支持正版。"
        })
    }
}

function forwardEffect(resourcesData) {
    $("ticketViews").animator.moveWidth(- screenWidth + 120).anchorRight.easeOutQuint.animate(1)
    $("ticketBt").animator.makeX(15).animate(0.5)
    $("coffeeBt").animator.makeX(15).makeOpacity(0).animate(0.1)
    $("forwardBt").animator.makeOpacity(0).animate(0.1)
    $("moviePlayViews").animator.makeOpacity(0).animate(0.5)
    $("playMatrix").animator.moveY(screenHeight * 2.5 / 4 - 145).animate(0.3)
    if ($("video").alpha != 0) {
        $("video").animator.rotateX(90).thenAfter(0.1).makeOpacity(0).thenAfter(0.1).rotateX(-90).animate(0.3)
        playStatus("", resourcesData, "")
    }
}

function playStatus(indexPath, origData, text) {
    $("playMatrix").data = origData
    if (indexPath) {
        $delay(0.1, function () {
            let cell = $("playMatrix").cell($indexPath(indexPath.section, indexPath.row))
            cell.views[0].views[0].views[0].text = text + "            "
        })
    }
}

async function watchOrShare(link, type, indexPath, resourcesData) {
    if ($("topBarTitle").text == "THE MOVIE") {
        playStatus(indexPath, resourcesData, "加载中")
        var resp = await $http.get(link)
        var data = resp.data.match(/<iframe src="[^"]+/)
        playStatus("", resourcesData, "")
    } else {
        var data = [link]
    }
    if (data) {
        if ($("video").alpha == 0) {
            $("video").animator.rotateX(90).thenAfter(0.1).makeOpacity(1).rotateX(-90).animate(0.3)
        }
        let videoUrl = data[0].replace(/<iframe src="/, "https:")
        if (type == "watch") {
            $("video").url = videoUrl
            playUrl = link
            playStatus(indexPath, resourcesData, "正在播放")
        } else {
            $share.sheet(videoUrl)
        }
    } else {
        let resource = resp.data.indexOf("资源已屏蔽")
        if (resource != -1) {
            alert("应版权方要求，资源已屏蔽！")
        }
    }
}

function categoryUpdate(index) {
    page = 1
    menuIndex = index
    if ($("topBarTitle").text == "THE MOVIE") {
        if (index == 6) {
            movieSeries(0)
        } else if (index == 7) {
            myFavorite(0)
        } else {
            theMovieGallery(0, 0, 0, 0, index)
        }
    } else {
        skyMovieGallery(0, skyMovieYears[0], skyMovieGenres[0], skyMovieCountries[0], index, "")
    }
}

async function filter(index) {
    page = 1
    if ($("topBarTitle").text == "THE MOVIE") {
        let picker = await $pick.data({
            props: {
                items: [theMovieYears, theMovieGenres, theMovieCountries]
            }
        })
        let year = picker[0]
        if (year == "全部") {
            year = 0
        } else if (year == "更早") {
            year = -1
        }
        let genre = arrCheck(theMovieGenres, picker[1])
        let country = arrCheck(theMovieCountries, picker[2])
        theMovieGallery(0, year, genre, country, index)
    } else {
        let picker = await $pick.data({
            props: {
                items: [skyMovieYears, skyMovieGenres, skyMovieCountries]
            }
        })
        skyMovieGallery(0, picker[0], picker[1], picker[2], index, "")
    }
}

async function search(keyword, type, searchPage) {
    page = searchPage
    movieKeyword = keyword
    if ($("topBarTitle").text == "THE MOVIE") {
        resultType = 1
        if (type == 0) {
            $("movieList").data = []
        }
        let authentication = await getToken()
        $("pageLabel").text = "加载中......"
        let results = await $http.post({
            url: "https://api.wxkdy666.com/KdyApi/ApiVideo/Index",
            header: {
                "OpenToken": authentication.openToken,
                "Timestamp": authentication.timestamp,
                "Key": authentication.key
            },
            body: {
                "KeyWord": keyword,
                "Page": page,
                "EngineId": 0,
                "SearchType": 0,
                "ObjectId": "1",
                "PageSize": "10"
            }
        })
        $("pageLabel").text = "上拉加载更多"
        if (results.data.Code != 200) {
            if (results.data.Code == 202 && page != 1) {
                $("pageLabel").text = "已经到底啦"
            } else if (results.data.Code == 202) {
                $ui.alert({
                    title: "未找到相关影视\n是否进入豆瓣搜索并反馈",
                    actions: [
                        {
                            title: "好的",
                            handler: function () {
                                general.generalViewIn(0, keyword)
                            }
                        },
                        {
                            title: "取消",
                            handler: function () {
                                movieGallery()
                            }
                        }
                    ]
                })
            } else {
                if (results.data.ErrMsg) {
                    if (results.data.ErrMsg == "Key Error") {
                        tokenError()
                    } else {
                        alert(results.data.ErrMsg)
                    }
                } else {
                    alert("出错啦，请稍后重试！")
                }
            }
        } else {
            listDataUpdata(results.data, type)
        }
    } else {
        skyMovieGallery(type, skyMovieYears[0], skyMovieGenres[0], skyMovieCountries[0], 0, keyword)
    }
}

function gradientEffect(num, minNum, maxNum, rateNum) {
    let numX = 0.9 + num / rateNum
    let numY = maxNum - num / 800
    if (numX < 0.9) {
        numX = 0.9
    } else if (numX > 1) {
        numX = 1
    }
    if (numY < minNum) {
        numY = minNum
    } else if (numX > maxNum) {
        numY = maxNum
    }
    $("bottomGradient").startPoint = $point(numX, 0)
    $("bottomGradient").locations = [0.0, numY, numY]
}

function ratingDataMaker(ratingNum, id) {
    let ratingData = []
    for (var i = 0; i < 5; i++) {
        if (i < ratingNum) {
            var radiusAlpha = 1
        } else {
            var radiusAlpha = 0.3
        }
        ratingData.push({
            [id]: {
                alpha: radiusAlpha
            }
        })
    }
    return ratingData
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

function dataCheck(text) {
    if (text) {
        return text.replace(/,|，|\//g, " | ")
    } else {
        return "无"
    }
}

function arrCheck(arr, items) {
    let exist = false
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == items) {
            exist = true
            return i
        }
    }
    if (exist == false) {
        return -1
    }
}

function introHeight(text) {
    let size = $text.sizeThatFits({
        text: text,
        width: screenWidth - 60,
        font: $font(".SFUIText", 15)
    })
    return size.height
}

function shadow(view, scr, ssos, ssc, sso, ssr) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", scr)
    layer.invoke("setShadowOffset", ssos)
    layer.invoke("setShadowColor", ssc.runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", sso)
    layer.invoke("setShadowRadius", ssr)
}

function tokenError() {
    $ui.alert({
        title: "Token 错误",
        message: "\n是否进入设置重新设置",
        actions: [
            {
                title: "好的",
                handler: function () {
                    general.generalViewIn(2)
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

async function movieFavorite(movieId, subscribeId) {
    let authentication = await getToken()
    if ($("favoriteBt").info == "0") {
        favoriteBtEffect(1, subscribeId)
        let results = await $http.post({
            url: "https://api.wxkdy666.com/KdyApi/Subscribe/Create",
            header: {
                "OpenToken": authentication.openToken,
                "Timestamp": authentication.timestamp,
                "Key": authentication.key
            },
            body: {
                "SubscribeType": 0,
                "Feature": $("movieDetailTitle").info,
                "ObjectId": movieId
            }
        })
        if (results.data.Code != 200) {
            if (results.data.ErrMsg) {
                alert(results.data.ErrMsg)
            } else {
                alert("出错啦，请稍后重试！")
            }
            favoriteBtEffect(0, subscribeId)
        }
    } else {
        favoriteBtEffect(0, subscribeId)
        let results = await $http.post({
            url: "https://api.wxkdy666.com/KdyApi/Subscribe/Remove",
            header: {
                "OpenToken": authentication.openToken,
                "Timestamp": authentication.timestamp,
                "Key": authentication.key
            },
            body: {
                "ObjectId": subscribeId
            }
        })
        if (results.data.Code != 200) {
            if (results.data.ErrMsg) {
                alert(results.data.ErrMsg)
            } else {
                alert("出错啦，请稍后重试！")
            }
            favoriteBtEffect(1, subscribeId)
        }
    }
}

function favoriteBtEffect(type, subscribeId) {
    if (type == 0) {
        $("favoriteBt").info = "0"
        $("favoriteBt").icon = $icon("061", $color("#DDE2EA"), $size(20, 20))
    } else {
        $("favoriteBt").info = subscribeId
        $("favoriteBt").icon = $icon("061", $color("#ED314A"), $size(20, 20))
    }
}

async function myFavorite(type) {
    if (type == 0) {
        $("movieList").data = []
    }
    let authentication = await getToken()
    $("pageLabel").text = "加载中......"
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/Subscribe/MySubscribe",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "SubscribeType": 0,
            "ObjectId": "1",
            "Page": page,
            "PageSize": "10"
        }
    })
    $("pageLabel").text = "上拉加载更多"
    if (results.data.Code != 200) {
        if (results.data.Code == 201) {
            $("pageLabel").text = "已经到底啦"
        } else {
            if (results.data.ErrMsg) {
                if (results.data.ErrMsg == "Key Error") {
                    tokenError()
                } else {
                    alert(results.data.ErrMsg)
                }
            } else {
                alert("出错啦，请稍后重试！")
            }
        }
    } else {
        favoriteListUpdata(results.data, type)
    }
}

function favoriteListUpdata(data, type) {
    let resultData = data.ResultData
    let movieListData = []
    for (var i = 0; i < resultData.length; i++) {
        let ratingData = ratingDataMaker(0, "movieRating")

        movieListData.push({
            moviePoster: {
                src: resultData[i].Img
            },
            movieTitle: {
                text: resultData[i].Name,
                info: resultData[i].ObjectId.toString()
            },
            movieDirector: {
                text: resultData[i].Time.replace(/T.+/, "")
            },
            ratingMatrix: {
                data: ratingData
            },
            movieGenres: {
                text: dataCheck(resultData[i].Genre)
            },
            movieYear: {
                text: "已收藏"
            }
        })
    }

    if (type == 0) {
        oldMovieData = movieListData
    } else {
        oldMovieData = oldMovieData.concat(movieListData)
    }
    $("movieList").data = oldMovieData
}

async function movieSeries(type) {
    seriesType = 0
    if (type == 0) {
        $("movieList").data = []
    }
    let authentication = await getToken()
    $("pageLabel").text = "加载中......"
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/ApiVideo/SeriesList",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "ObjectId": "1",
            "Page": page,
            "PageSize": "10"
        }
    })
    $("pageLabel").text = "上拉加载更多"
    if (results.data.Code != 200) {
        if (results.data.Code == 201) {
            $("pageLabel").text = "已经到底啦"
        } else {
            if (results.data.ErrMsg) {
                if (results.data.ErrMsg == "Key Error") {
                    tokenError()
                } else {
                    alert(results.data.ErrMsg)
                }
            } else {
                alert("出错啦，请稍后重试！")
            }
        }
    } else {
        seriesListUpdata(results.data, type)
    }
}

function seriesListUpdata(data, type) {
    let resultData = data.ResultData
    let movieListData = []
    for (var i = 0; i < resultData.length; i++) {
        let ratingData = ratingDataMaker(0, "movieRating")

        movieListData.push({
            moviePoster: {
                src: resultData[i].SeriesImg ? resultData[i].SeriesImg.replace(/^\/\//, "http://") : ""
            },
            movieTitle: {
                text: resultData[i].SeriesName,
                info: resultData[i].objectId.toString()
            },
            movieDirector: {
                text: resultData[i].ModifyTime.replace(/T.+/, "")
            },
            ratingMatrix: {
                data: ratingData
            },
            movieGenres: {
                text: resultData[i].SeriesRemark
            },
            movieYear: {
                text: "系列"
            }
        })
    }

    if (type == 0) {
        oldMovieData = movieListData
    } else {
        oldMovieData = oldMovieData.concat(movieListData)
    }
    $("movieList").data = oldMovieData
}


async function movieSeriesList(type, id) {
    seriesType = 1
    seriesId = id
    if (type == 0) {
        $("movieList").data = []
    }
    let authentication = await getToken()
    $("pageLabel").text = "加载中......"
    let results = await $http.post({
        url: "https://api.wxkdy666.com/KdyApi/ApiVideo/MoviesForSeriesId",
        header: {
            "OpenToken": authentication.openToken,
            "Timestamp": authentication.timestamp,
            "Key": authentication.key
        },
        body: {
            "ObjectId": id,
            "Page": page,
            "PageSize": "10"
        }
    })
    $("pageLabel").text = "上拉加载更多"
    if (results.data.Code != 200) {
        if (results.data.Code == 201) {
            $("pageLabel").text = "已经到底啦"
        } else {
            if (results.data.ErrMsg) {
                if (results.data.ErrMsg == "Key Error") {
                    tokenError()
                } else {
                    alert(results.data.ErrMsg)
                }
            } else {
                alert("出错啦，请稍后重试！")
            }
        }
    } else {
        listDataUpdata(results.data, type)
    }
}

module.exports = {
    launch: launch,
    categoryUpdate: categoryUpdate,
    filter: filter,
    search: search,
    movieGallery: movieGallery
}