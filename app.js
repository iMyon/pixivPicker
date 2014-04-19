#!/usr/bin/env:node
// Javascript File
//Filename: app.js
//Created: 2014-04-19 02:26:07
//Desc: 主程序入口，执行 node app.js
//Author: Myon, myon.cn@gmail.com

var $ = require('jquery').create();
var today = require('./lib/today-path.js');
var basePath = today.imagePath();
var logFile = today.logFile();
var download = require('./lib/download.js');
var config = require('./lib/config.js');
var writeLog = require('./lib/log.js').writeLog;
var readLog = require('./lib/log.js').readLog;
var pixiv = require('./lib/pixivLogin.js');

//获取cookie 成功后发送getCookie信号
pixiv.login();

var logImages = readLog(logFile);   //读取log日志记录的文件

//存放图片信息的数组
var images = [];
//存放push到images的临时信息


//从每日图片排行网页抓图
pixiv.on("getCookie",function(pixiv){
  $.get('http://www.pixiv.net/ranking.php?mode=daily',function(data){
    //图片列表
    var items = $(data).find('.ranking-item');
    //遍历获取所有图片信息
    $.each(items,function(index,item){
      var tempimg = {};
      tempimg.rank = $(item).attr("data-rank");
      tempimg.username = $(item).attr("data-user-name");
      tempimg.title = $(item).attr("data-title");
      tempimg.date = $(item).attr("data-date");
      tempimg.ilustSrc = $(item).find('IMG._thumbnail.ui-scroll-view').attr("data-src");
      tempimg.url = $(item).find('IMG._thumbnail.ui-scroll-view')
        .attr("data-src")
        .replace(/^(.*\/)mobile\/(.*)_.*(\..*)$/g,"$1$2$3");
      tempimg.filename = "#"+tempimg.rank+"."+ tempimg.url.match(/[^/]*(\.gif|\.jpg|\.jpeg|\.png)$/g)[0];
      //查看是否成功已经下载过该文件
      //如果文件下载过则把image对象的替换，complete为true（之后download那边会判断）
      if(logImages){
            console.log(9);
        $.each(logImages.success,function(index,image){
          if(image.ilustSrc == tempimg.ilustSrc){
            tempimg = image;
          }
        });
      }
      images.push(tempimg);
    });
    console.log(images);
    //下载图片
    $.each(images,function(index,image){
      //console.log(image);
      download.gen(image,basePath,pixiv);
    });
  });

  //处理每个图片下载完成信号
  (function(){
    var ccount = 0;             //已完成数量
    var succount = 0;           //下载成功
    var failcount = 0;          //下载失败
    download.on("finishADownload",function(image){
      succount++;
      ccount++;
      if(ccount >= images.length){
        download.emit("allFinished");
      }
      console.log(image.filename + " 已完成 " + "   剩余 " + (images.length - ccount) + " 个下载任务");
      writeLog(logFile,images);     //每下载完一个 写入日志
    });
    download.on("hasDownloaded",function(image){
      succount++;
      ccount++;
      if(ccount >= images.length){
        download.emit("allFinished");
      }
      console.log(image.filename + " 已经下载过 " + "   剩余 " + (images.length - ccount) + " 个下载任务");
      writeLog(logFile,images);     //每下载完一个 写入日志
    });
    //404错误处理
    download.on('res404',function(image){
      console.warn(image.filename + " 发生404错误,尝试使用png下载该图");
      image.url = image.url.replace(/\.jpg/,".png");
      image.filename = image.filename.replace(/\.jpg/,".png");
      download.gen(image,basePath,pixiv);
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
        download.gen(image,basePath,pixiv);
      }
      else{
        console.warn(image.filename + " 下载失败,已达到下载次数限制");
        ccount++;
        failcount++;
        if(ccount >= images.length){
          download.emit("allFinished");
        }
      }
    });
  })();//(闭包)
});

