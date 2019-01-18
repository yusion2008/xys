const fs = require('fs');
const path = require('path');
const config = require('../conf/config.js').config();

const getLogPath = dirname => {
    const date = new Date();
    let dir = dirname || "logs"
    const logPath = path.join(
        __dirname.toString().replace("lib", dir),
        `${date.Format('yyyy-MM')}`
    )
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath)
    }
    return logPath
}

// 写入文件,返回一个`promise`
const write = (filePath, data) =>
    new Promise((resolve, reject) => {
        fs.appendFile(filePath, data, 'utf8', err => {
            if (err) {
                reject(err)
            } else {
                resolve(true)
            }
        })
    })

// 事件触发
const writeLog = (logData, filename) => {
    let fileName = filename || "logs";
    const logPath = getLogPath(fileName);
    const date = new Date();
    write(path.join(logPath, `${date.Format('MM-dd')}-${fileName}.txt`), logData).then(() => {
        //console.log("日志写入成功！");
    })
}


/**
 * [log 写入日志的方法]
 * @param  {[type]} msg [需要写入的内容字符串]
 */
const log=function(msg) {
    const date = new Date();
    const time = `[${date.Format("yyyy-MM-dd hh:mm:ss")}] `;
    writeLog(time + msg + '\n\n');
}
/**
 * [trace 写入跟踪的方法]
 * @param  {[type]} msg [需要写入的内容字符串]
 */
const trace=function(msg) {
    if (!config.trace) { return }
    const date = new Date();
    const time = `${date.Format("yyyy-MM-dd hh:mm:ss")} `;
    writeLog(time + msg + '\n\n', "trace");
}

exports.log=log;
exports.trace=trace;