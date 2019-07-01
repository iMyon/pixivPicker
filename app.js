#!/usr/bin/env:node
// Javascript File
//Filename: app.js
//Created: 2014-04-19 02:26:07
//Desc: 主程序入口，执行 node app.js
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var argv = require('optimist').argv;
var storage = require('./lib/storage.js');
var download = require('./lib/download.js');
var config = require('./lib/config.js');
var pixiv = require('./lib/pixivLogin.js');
var getImages = require('./lib/getImagesArray.js');

if(argv.username){
  config.pixiv.login.form.pixiv_id = argv.username;
}
if(argv.passwd){
  config.pixiv.login.form.password = argv.passwd;
}

//获取cookie 成功后发送getCookie信号
pixiv.login(config.pixiv.login.form);

if(config.pixiv.fetchUrl.match("https://www.pixiv.net/ranking.php")){
  pixiv.on("getCookie",getImages.rankImages);
}
else{
  pixiv.on("getCookie",getImages.authorImages);
}
getImages.on("getImages",function(images){
  //处理每个图片下载完成信号
  (function(){
    var ccount = 0;             //已完成数量
    var succount = 0;           //下载成功
    var failcount = 0;          //下载失败
    download.on("finishADownload",function(image){
      succount++;
      ccount++;
      image.complete = true;
      console.log(" 下载成功  -> " + image.filename + "   剩余 " + (images.length - ccount));
      if(ccount >= images.length){
        download.emit("allFinished");
      }
      image.path = path.join(image.basePath,image.filename);
      storage.writeLog(logFile,images);     //每下载完一个 写入日志
    });
    download.on("hasDownloaded",function(image){
      succount++;
      ccount++;
      console.log("已经下载过 -> " + image.filename + "   剩余 " + (images.length - ccount));
      if(ccount >= images.length){
        download.emit("allFinished");
      }
    });
    //404错误处理
    download.on('res404',function(image){
      console.warn("  png下载  -> " + image.filename);
      image.url = image.url.replace(/\.jpg/,".png");
      image.filename = image.filename.replace(/\.jpg/,".png");
      download.gen(image,path.join(image.basePath, image.filename),pixiv);
    });
    //全部下载完成信号处理
    download.on('allFinished',function(){
      storage.writeLog(logFile,images);
      console.log("下载结束，成功 " + succount + " ,失败 " + failcount);
      //显式结束进程
      setTimeout(function(){
        process.exit()
      },2000);
    });
    //处理下载失败/相册下载
    download.on('failDownload',function(image){
      if((image.retryTime||0) < config.pixiv.maxRetryTime){
        //下载次数+1
        image.retryTime = (image.retryTime||0) + 1;
        console.warn(" 重新下载  -> " + image.filename);
        download.gen(image,path.join(image.basePath, image.filename),pixiv);
      }
      else{
        //删除临时文件
        var filePath = path.join(image.basePath,image.filename);
        try{
          fs.unlinkSync(filePath);
        } catch (e) {

        }
        // 尝试使用图册方式下载图片
        if(!image.is_xiangce){ //如果是一个顶级对象
          download.emit("xiangceDownload",image);   //发送相册下载信号
        }
        else{
          ccount++;
          if(!image.is_xiangce)
            console.warn(" 下载失败  -> " + image.filename + " -> 已达到下载次数限制");
          if(image.is_xiangce && image.xiangce && image.xiangce.length > 1){
            image.complete = true;
            image.xiangce.pop();
            succount++;
            console.log(" 下载成功  -> " + image.basePath
             + "   剩余 " + (images.length - ccount));
            storage.writeLog(logFile,images);
          }
          else{
            image.complete = false;
            failcount++;
          }
          if(ccount >= images.length){
            download.emit("allFinished");
          }
        }
      }
    });
    //开始相册下载
    download.on("xiangceDownload",function(image){
      if(! image.xiangce){   //没有则创建并初始化
        image.xiangce = [];
        console.log("画册下载 -> " + image.filename);
        // image.url = image.url.replace(/(\.gif|\.jpg|\.jpeg|\.png)$/,"_p" + 0 + ".jpg");
        image.filename = image.url.match(/\/[^\/]+_p([^\/]+)$/)[1];
        image.is_xiangce = true;
        image.xiangce_init = true;
        //创建目录
        image.basePath = path.join(image.basePath,storage.formatFilename(image,config.pixiv.filenameFormat));
        mkdirp.sync(image.basePath);
        // 开始下载
        download.gen(image,path.join(image.basePath, image.filename),pixiv);
      }
      else{
        console.log("下载成功 -> " + path.join(
          storage.formatFilename(image,config.pixiv.filenameFormat)
          ,image.filename
        ));
        if(image.filename != image.xiangce[image.xiangce.length-1])
          image.xiangce.push(image.filename);
        storage.writeLog(logFile,images);
        image.filename = image.xiangce.length + ".jpg";
        image.url = image.url.replace(/_p\d+(\.gif|\.jpg|\.jpeg|\.png)$/,"_p"
          + image.filename);
        download.gen(image,path.join(image.basePath, image.filename),pixiv);
      }
    });
  })();

  for(var k=0;k<images.length;k++){
    if(images[k].is_xiangce)
      download.emit("xiangceDownload", images[k]);
    else
      download.gen(images[k],path.join(images[k].basePath, images[k].filename),pixiv);
  }
});

//超过时间就结束进程
setTimeout(function(){
  process.exit()
},config.timeout);
