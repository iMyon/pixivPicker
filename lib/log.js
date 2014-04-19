// Javascript File
//Filename: log.js
//Created: 2014-04-19 17:09:16
//Desc: 记录每次下载的log ，json保存
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var config = require('./config.js');
var today  = require('./today-path.js');

module.exports = {
  //desc 写入日志文件
  //param images  images对象文件
  //param logFile log文件路径
  //return none
  writeLog:function(logFile,images){
    var log = {};
    log.date = new Date().format('yyyy-MM-dd hh:mm');
    log.filename = logFile;
    log.success = [];  //成功下载的
    log.fail  = [];     //下载失败的
    for(var i=0;i<images.length;i++){
      var image = images[i];
      if(image.complete){
        log.success.push(image);
      }
      else{
        log.fail.push(image);
      }
    }
    mkdirp(config.pixiv.logPath,function(err){
      if(err){
        throw(err);
      }
      else{
        fs.writeFile(log.filename,JSON.stringify(log),function(err){
          if(err){
            throw(err);
          }
        });
      }
    });
  },
  //desc    读取log文件
  //param logFile   日志文件路径
  //return images格式的对象
  readLog:function(logFile){
    var log = null;
    try{
      log = fs.readFileSync(logFile,'utf-8');
      log = JSON.parse(log);
    }catch(e){
    }
    return log;
  }
};
