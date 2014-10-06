// Javascript File
//Filename: today-path.js
//Created: 2014-04-19 02:30:29
//Desc:   和数据存储相关的函数
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var mkdirp = require('mkdirp');
var config = require('./config.js');
var path = require('path');


//格式化日期输出
Date.prototype.format = function(format) //author: meizz
{
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(), //day
    "h+" : this.getHours(), //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter
    "S" : this.getMilliseconds() //millisecond
  };
  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

//warn  此函数已废弃，直接读请求的json获取
//desc  创建并返回路径
//param none
//return
//  成功创建 - path
//  创建失败 - null
module.exports = {
  imagePath:function(){ 
    var todayPath = new Date().format("yyyy/MM/dd"); 
    todayPath = path.join(config.pixiv.saveFolder,todayPath);
    mkdirp(todayPath,function(err){ 
        //如果创建目录出错则将path置null
        if(err){ 
            console.log(err);
            todayPath = null;
        } 
    }); 
    return todayPath;
  },
  //停用，直接读取p站服务器图片排行日期作为日志文件保存路径
  logFile:function(){
    var filename = new Date().format('yyyy-MM-dd') + ".log";
    return path.join(config.pixiv.logPath,filename);
  },
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
  },
  //Desc                  格式化文件名
  //param  image          图像对象
  //param  formatString   格式化字符串
  //return String         新的文件名
  formatFilename: function(image,formatString){
    var matches = formatString.match(/\${[^}]*}/g);
    for(var i = 0;i<matches.length;i++){
      var m = matches[i].match(/\${([^}]*)}/)[1];
      var valStr = eval("image." + m);
      formatString = formatString.replace(matches[i],valStr);
    }
    //windows非法字符处理
    formatString = formatString.trim()
      .replace(/\?/g,"？")
      .replace(/\|/g,"¦")
      .replace(/(\\|\/|\:|\*|\"|\<|\>)/g," ");
    return formatString;
  }
};
