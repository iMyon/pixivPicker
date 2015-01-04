// Javascript File
//Filename: download.js
//Created: 2014-04-19 03:15:19
//Desc: 下载
//Author: Myon, myon.cn@gmail.com

var request = require('request');
var path = require('path');
var fs = require('fs');
var config = require('./config.js');
var events = require('events');
var checkComplete = require('./checkComplete.js');
var emitter = new events.EventEmitter();

//desc 下载网络文件到本地目录
//param image 包含图片信息的对象
//param dir 文件保存目录
//param pixiv    模拟登录后获得的信息
//return none
var download = function(image,dir,pixiv){
  //如果已经下载过则跳过
  if(image.complete === true){
    emitter.emit("hasDownloaded",image);
    return;
  }
  //启用cookie
  var j = request.jar();
  var rcookie = request.cookie(pixiv.cookie);
  j.setCookie(rcookie, image.url);
  request(
    {
      url:image.url,
      headers: config.pixiv.headers,
      jar:j
    },
    function(err,res,body){


      //反送404信号并删除错误文件，尝试用png下载
      if(res && res.statusCode == 404 && image.url.match(/\.jpg$/)){
        fs.unlink(path.join(dir,image.filename));   //删除jpg文件
        emitter.emit("res404",image);
        return;
      }
      //403 fobidden
      else if(res && res.statCode == 403){
      }
      
      //发送图片下载完成信号
      else if(res && res.statusCode == 200){
        if(image.is_xiangce){
          emitter.emit("xiangceDownload",image);
        }
        else{
          // emitter.emit("finishADownload",image);
          //检查图片完整性
          image.path = path.join(dir,image.filename);
          checkComplete.check(image);
        }
      }
      else{
        // fs.unlink(path.join(dir,image.filename));   //删除文件
        emitter.emit("failDownload",image);
        return;
      }
  }).pipe(fs.createWriteStream(path.join(dir||"",image.filename||".trash")));
};

checkComplete.on("image_complete", function(image){
  emitter.emit("finishADownload",image);
});
checkComplete.on("image_not_complete", function(image){
  emitter.emit("failDownload",image);
});

emitter.gen = download;
module.exports = emitter;
