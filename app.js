#!/usr/bin/env:node
// Javascript File
//Filename: app.js
//Created: 2014-04-19 02:26:07
//Desc: 主程序入口，执行 node app.js
//Author: Myon, myon.cn@gmail.com

var request = require('request');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var argv = require('optimist').argv;
var today = require('./lib/today-path.js');
var basePath = "";    //保存文件path日期部分，请求后获取
var logFile = today.logFile();
var download = require('./lib/download.js');
var config = require('./lib/config.js');
var writeLog = require('./lib/log.js').writeLog;
var readLog = require('./lib/log.js').readLog;
var pixiv = require('./lib/pixivLogin.js');
var filter = require('./lib/filter.js');

//如果传入了 -p 参数，则替换保存目录
if(argv.path){
  config.pixiv.saveFolder = argv.path;
}
//如果传入了 -url 参数，则替换请求网址
if(argv.url){
  config.pixiv.fetchUrl = argv.url;
}
//如果传入了 -abbr 参数，则替换目录追加路径
if(argv.abbr){
  config.pixiv.pathAbbr = argv.abbr;
}
if(argv.username){
  config.pixiv.login.form.pixiv_id = argv.username;
}
if(argv.passwd){
  config.pixiv.login.form.pass = argv.passwd;
}

//获取cookie 成功后发送getCookie信号
pixiv.login(config.pixiv.login.form);

logFile += config.pixiv.pathAbbr;

var logImages = readLog(logFile);   //读取log日志记录的文件

//存放图片信息的数组
var images = [];
//存放push到images的临时信息

//获取cookie之后
pixiv.on("getCookie",function(pixiv){
  //从每日图片排行网页抓图
  var j = request.jar();
  var rcookie = request.cookie(pixiv.cookie);
  j.setCookie(rcookie, config.pixiv.fetchUrl);
  request(
    {
      url:config.pixiv.fetchUrl,
      headers: config.pixiv.headers,
      jar:j
    },
    function(err,res,body){
      //图片列表
      try{
        JSON.parse(body);
      }catch(e){
        throw "cookie有误，请设置正确的账号密码，并尝试重新运行";
      }
      var items = JSON.parse(body).contents;
      basePath = JSON.parse(body).date
        .replace(/^(\d{4})(\d{2})(\d{2})$/g,path.join("$1","$2","$3"));
      basePath = path.join(config.pixiv.saveFolder,basePath+config.pixiv.pathAbbr);
      mkdirp.sync(basePath);

      //遍历获取所有图片信息
      for(var i=0;i<items.length;i++){
        var item = items[i];
        var is_pass = filter.tagFilter(item);
        //进入下一个循环
        if(is_pass === true){
          continue;
        }
        var tempimg = item;
        tempimg.illustSrc = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + item.illust_id;
        tempimg.url = item.url.replace(/^(.*\/)mobile\/(.*)_.*(\..*)$/g,"$1$2$3");
        tempimg.filename = "#"+tempimg.rank+"."+ tempimg.url.match(/[^\/]*(\.gif|\.jpg|\.jpeg|\.png)$/g)[0];
        tempimg.basePath = basePath;
        //查看是否成功已经下载过该文件
        //如果文件下载过则把image对象的替换，complete为true（之后download那边会判断）
        if(logImages){
          for(var j=0;j<logImages.success.length;j++){
            var image = logImages.success[j];
            if(image.illust_id == tempimg.illust_id){
              tempimg = image;
            }
          }
        }
        images.push(tempimg);
      }
      // console.log(images);
      //下载图片
      for(var k=0;k<images.length;k++){
        download.gen(images[k],images[k].basePath,pixiv);
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
      image.path = path.join(image.basePath,image.filename);
      writeLog(logFile,images);     //每下载完一个 写入日志
    });
    download.on("hasDownloaded",function(image){
      succount++;
      ccount++;
      console.log(image.filename + " 已经下载过 " + "   剩余 " + (images.length - ccount) + " 个下载任务");
      if(ccount >= images.length){
        download.emit("allFinished");
      }
    });
    //404错误处理
    download.on('res404',function(image){
      console.warn(image.filename + " 发生404错误,尝试使用png下载该图");
      image.url = image.url.replace(/\.jpg/,".png");
      image.filename = image.filename.replace(/\.jpg/,".png");
      download.gen(image,image.basePath,pixiv);
    });
    //全部下载完成信号处理
    download.on('allFinished',function(){
      console.log("下载结束，成功 " + succount + " ,失败 " + failcount);
      writeLog(logFile,images);
    });
    //处理下载失败/相册下载
    download.on('failDownload',function(image){
      if((image.retryTime||0) < config.pixiv.maxRetryTime){
        //下载次数+1
        image.retryTime = (image.retryTime||0) + 1;
        console.warn(image.filename + " 下载失败,尝试重新下载");
        download.gen(image,image.basePath,pixiv);
      }
      else{
        //删除临时文件
        fs.unlinkSync(path.join(image.basePath,image.filename));
        // 尝试使用图册方式下载图片
        if(!image.is_xiangce){ //如果是一个顶级对象
          download.emit("xiangceDownload",image);   //发送相册下载信号
        }
        else{
          ccount++;
          console.warn(image.filename + " 下载失败,已达到下载次数限制");
          if(image.is_xiangce){
            image.complete = true;
            succount++;
            console.log(image.illust_id+" 下载完成"
             + "   剩余 " + (images.length - ccount) + " 个下载任务");
          }
          else{
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
      if(!image.is_xiangce){   //没有则创建并初始化
        image.xiangce = [];
        console.log(image.filename+"  猜测下载图片为相册形式")
        image.url = image.url.replace(/(\.gif|\.jpg|\.jpeg|\.png)$/,"_p" + 0 + ".jpg");
        image.filename = image.url.match(/\/([^\/]+)$/)[1];
        image.xiangce.push(image.filename);
        image.is_xiangce = true;
        image.count = 0;
        //创建目录
        image.basePath = path.join(image.basePath,"#"+image.rank+"."+image.illust_id);
        mkdirp.sync(image.basePath);
        // 开始下载
        download.gen(image,image.basePath,pixiv);
      }
      else{
        console.log(image.filename + " 下载成功");
        image.count++;
        image.url = image.url.replace(/_p\d+(\.gif|\.jpg|\.jpeg|\.png)$/,"_p" + image.count + ".jpg");
        image.filename = image.url.match(/\/([^\/]+)$/)[1];
        image.xiangce.push(image.filename);
        download.gen(image,image.basePath,pixiv);
      }
    });
  })();//(闭包)
});