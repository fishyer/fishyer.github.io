const fs = require( 'fs' );
const path = require('path');
const format = require('string-format')
format.extend(String.prototype)

// const util = require("util");

const curPath = path.resolve('./');
const data="test nodejs: "+__filename
console.log(data)

console.log(__dirname);  // 当前文件所在的绝对路径。
console.log(__filename);  // 当前文件的文件名,包括全路径。  __dirname和__filename都是全局对象。

const readDir = (entry)=>{
    const dirInfo = fs.readdirSync(entry);
    dirInfo.forEach(item => {
        const location = path.join(entry,item)
        const info = fs.statSync(location)
        if(info.isDirectory()){
            console.log(`dir: ${location}`)
            readDir(location)
        }else{
            console.log(`file: ${location}`)
        }
    })
}

function curDate(now) {
    var zeroFill = function(value) {
        if (value < 10) {
            value = '0' + value
        }
        return value
    }
    var now = new Date(now);
    var year = now.getFullYear();
    //年
    var month = zeroFill(now.getMonth() + 1);
    //月
    var day = zeroFill(now.getDate());
    //日
    var hh = zeroFill(now.getHours());
    //时
    var mm = zeroFill(now.getMinutes());
    //分
    var ss = zeroFill(now.getSeconds());
    return (`${year}-${month}-${day}`);
}

function curTime(now) {
    var zeroFill = function(value) {
        if (value < 10) {
            value = '0' + value
        }
        return value
    }
    var now = new Date(now);
    var year = now.getFullYear();
    //年
    var month = zeroFill(now.getMonth() + 1);
    //月
    var day = zeroFill(now.getDate());
    //日
    var hh = zeroFill(now.getHours());
    //时
    var mm = zeroFill(now.getMinutes());
    //分
    var ss = zeroFill(now.getSeconds());
    return (`${hh}:${mm}:${ss}`);
}

function curDateTime(now) {
    var zeroFill = function(value) {
        if (value < 10) {
            value = '0' + value
        }
        return value
    }
    var now = new Date(now);
    var year = now.getFullYear();
    //年
    var month = zeroFill(now.getMonth() + 1);
    //月
    var day = zeroFill(now.getDate());
    //日
    var hh = zeroFill(now.getHours());
    //时
    var mm = zeroFill(now.getMinutes());
    //分
    var ss = zeroFill(now.getSeconds());
    return (`${year}-${month}-${day} ${hh}:${mm}:${ss}`);
}

console.log(Date.now())
console.log(curDateTime(Date()))
console.log(curDate(Date()))
console.log(curTime(Date()))
// readDir('/Users/ufutx/Desktop/Inbox')

var logMsg="test nodejs "+curDateTime(Date())+"\n"
logName="DailyLog-{}.md".format(curDate(Date()))
logPath=path.join(__dirname,logName)
fs.appendFileSync( logPath, logMsg);