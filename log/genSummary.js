const fs = require('fs');
const path = require('path');
const format = require('string-format')
format.extend(String.prototype)

// D:/Dropbox/MyChromeDown/MyObsidian/MyDocsify
const dirPath = "D:/Dropbox/MyChromeDown/MyObsidian/MyDocsify"
const mdPath='D:/Dropbox/MyChromeDown/MyObsidian/MyDocsify/GenOutline.md'

var prev = ""
var post = ""
var ext = {
    "零": "00",
    "一": '01',
    "二": '02',
    "三": '03',
    "四": '04',
    "五": '05',
    "六": '06',
    "七": '07',
    "八": '08',
    "九": '09',
    "十": '10',
    "十一": '11',
    "十二": '12',
    "十三": '13',
    "十四": '14',
    "十五": '15',
    "十六": '16',
    "十七": '17',
    "十八": '18',
    "十九": '19',
    "二十": '20',
    "“": "",
    "”": "",
    ".": "-",
    "/": "-",
    "：": "-",
    "&": "and",
}

var md = ""

function print(s) {
    console.log(s)
    md = md + s + "\n"
}

function replaceName(src) {
    src = src.replace(/ /g, '_');
    for (let key in ext) {
        src = prev + src.replace(key, ext[key]) + post
    }
    return src
}

function traverseDir(level, dir) {
    console.log("mfile.traverseDir()",level,dir);
    var prev = "    ".repeat(level) + "- "
    var l = level + 1
    list = fs.readdirSync(dir).sort()
    list.forEach(file => {
        fileName = path.parse(file).name;
        extName = path.parse(file).ext;
        newFileName = replaceName(fileName)
        fs.renameSync(path.join(dir, file), path.join(dir, newFileName + extName))
        let fullPath = path.join(dir, newFileName + extName);
        if (fs.lstatSync(fullPath).isDirectory()) {
            print(prev + newFileName);
            traverseDir(l, fullPath);
        } else {
            //file:///E:/BaiduNetdiskDownload/python-%E9%A3%8E%E5%8F%98-2021/1-%E5%9F%BA%E7%A1%80%E8%AF%AD%E6%B3%95/%E8%AF%AD%E6%B3%95%E7%9B%AE%E5%BD%95.html
            link = "file:///" + fullPath
            print("{0}[{1}]({2})".format(prev, newFileName + extName, link));
        }
    });
}

function main(dirPath,mdPath) {
    console.log("mfile.main()",dirPath);
    md = ""
    traverseDir(0, dirPath)
    try {
        const data = fs.writeFileSync(mdPath, md)
    } catch (err) {
        console.error(err)
    }
}

function test(dirPath,mdPath) {
    console.log("mfile.test()",dirPath,mdPath);
    file=mdPath
    fileName = path.parse(file).name;
    ext = path.parse(file).ext;
    console.log(fileName)
    console.log(ext)
    result = file.replace(/ /g, '_');
    console.log(result);
    console.log("{0}[{1}]({2})".format("prev", "name", "link"));
}

function start(content) {
    if (content == "test") {
        test(dirPath,mdPath)
    } else if (content == "main") {
        main(dirPath,mdPath)
    } else {
        console.log("没有匹配的方法")
    }
}

exports.start = start
exports.main = main
exports.test = test

// main()
// test()
// console.log("end")