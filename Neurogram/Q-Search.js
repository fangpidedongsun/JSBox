/*

Q-Search by Neurogram

参照 commmands 内格式可添加新的指令，":" 前为指令，":"后为搜索地址， "%s" 为搜索内容在地址中的位置

搜索时输入 指令 + 空格 + 搜索内容 即可

*/

const commands = {
    "b": "https://www.baidu.com/s?wd=%s", // 百度搜索
    "bi": "https://cn.bing.com/dict/search?q=%s", // bing 词典查询
    "g": "https://www.google.com/search?q=%s", // Google 搜索
    "gh": "https://github.com/search?q=%s", // GitHub 搜索
    "gm": "https://www.google.com/search?&tbm=isch&q=%s", // Google 图片搜索
    "ip": "http://www.ip138.com/ips138.asp?ip=%s", // ip 查询
    "jd": "https://so.m.jd.com/ware/search.action?keyword=%s", // 京东搜索
    "sp": "https://sspai.com/search/article?q=%s", // 少数派搜索
    "te": "https://translate.google.com/#view=home&op=translate&sl=zh-CN&tl=en&text=%s", // Google 中翻英
    "tb": "https://s.m.taobao.com/h5?&q=%s", // 淘宝搜索
    "tc": "https://translate.google.com/#view=home&op=translate&sl=en&tl=zh-CN&text=%s", // Google 英翻中
    "yd": "http://dict.youdao.com/search?q=%s", // 有道翻译
    "yt": "https://m.youtube.com/results?q=%s", // Youtube 搜索
    "zh": "https://www.zhihu.com/search?type=content&q=%s", // 知乎搜索
}

var text = await $input.text()

var command = text.match(/^\S+/)
webSearch(commands[command[0]], text)

function webSearch(web, text) {
    $app.openURL(web.replace(/\%s/, $text.URLEncode(text.replace(/^\S+\s*/, ""))))
}
