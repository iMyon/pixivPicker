#!/usr/bin/env:node
// Javascript File
//Filename: app.js
//Created: 2014-04-19 02:26:07
//Desc: 主程序入口，执行 node app.js
//Author: Myon, myon.cn@gmail.com

var request = require('request');
var fs = require('fs');
var path = require('path');
var today = require('./lib/today-path.js');
var basePath = today.imagePath();
var logFile = today.logFile();
var download = require('./lib/download.js');
var config = require('./lib/config.js');
var writeLog = require('./lib/log.js').writeLog;
var readLog = require('./lib/log.js').readLog;

var logImages = readLog(logFile);   //读取log日志记录的文件

//存放图片信息的数组
var images = [];
//存放push到images的临时信息


//从每日图片排行网页抓图
request.get(config.pixiv.fetchUrl,function(err,res,body){
    //图片列表
  var items = JSON.parse(body).contents;

  //遍历获取所有图片信息
  for(var i=0;i<items.length;i++){
    var item = items[i];
    var tempimg = {};
    tempimg.rank = item.rank;
    tempimg.username = item.user_name;
    tempimg.title = item.title;
    tempimg.date = item.date;
    tempimg.illustSrc = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + item.illust_id;
    tempimg.url = item.url.replace(/^(.*\/)mobile\/(.*)_.*(\..*)$/g,"$1$2$3");
    tempimg.filename = "#"+tempimg.rank+"."+ tempimg.url.match(/[^/]*(\.gif|\.jpg|\.jpeg|\.png)$/g)[0];
    //查看是否成功已经下载过该文件
    //如果文件下载过则把image对象的替换，complete为true（之后download那边会判断）
    if(logImages){
          console.log(9);
      for(var j=0;j<logImages.success.length;j++){
        var image = logImages.success[j];
        if(image.illustSrc == tempimg.illustSrc){
          tempimg = image;
        }
      }
    }
    images.push(tempimg);
  }
  console.log(images);
  //下载图片
  for(var k=0;k<images.length;k++){
    download.gen(images[k],basePath);
  }
});


//处理每个图片下载完成信号
(function(){
  var ccount = 0;             //已完成数量
  var succount = 0;           //下载成功
  var failcount = 0;          //下载失败
  download.on("finishADownload",function(image){
    succount++;
    ccount++;
    console.log(image.filename + " 已完成 " + "   剩余 " + (images.length - ccount) + " 个下载任务");
    if(ccount >= images.length){
      download.emit("allFinished");
    }
    writeLog(logFile,images);     //每下载完一个 写入日志
  });
  download.on("hasDownloaded",function(image){
    succount++;
    ccount++;
    console.log(image.filename + " 已经下载过 " + "   剩余 " + (images.length - ccount) + " 个下载任务");
    if(ccount >= images.length){
      download.emit("allFinished");
    }
    writeLog(logFile,images);     //每下载完一个 写入日志
  });
  //404错误处理
  download.on('res404',function(image){
    console.warn(image.filename + " 发生404错误,尝试使用png下载该图");
    image.url = image.url.replace(/\.jpg/,".png");
    image.filename = image.filename.replace(/\.jpg/,".png");
    download.gen(image,basePath);
  });
  //全部下载完成信号处理
  download.on('allFinished',function(){
    console.log("下载结束，成功 " + succount + " ,失败 " + failcount);
  });
  //处理下载失败
  download.on('failDownload',function(image){
    if((image.retryTime||0) < config.pixiv.maxRetryTime){
      //下载次数+1
      image.retryTime = (image.retryTime||0) + 1;
      console.warn(image.filename + " 下载失败,尝试重新下载");
      download.gen(image,basePath);
    }
    else{
      //删除临时文件
      fs.unlink(path.join(basePath,image.filename));   //删除文件
      console.warn(image.filename + " 下载失败,已达到下载次数限制");
      ccount++;
      failcount++;
      if(ccount >= images.length){
        download.emit("allFinished");
      }
    }
  });
})();//(闭包)
