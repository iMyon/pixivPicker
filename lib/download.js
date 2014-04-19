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
var emitter = new events.EventEmitter();

//desc 下载网络文件到本地目录
//param uri 文件链接
//param dir 文件保存目录
//param cookie      cookie
//param filename    文件名
//return none
var download = function(image,dir){
  //如果已经下载过则跳过
  if(image.complete){
    emitter.emit("hasDownloaded",image);
    return;
  }
  request(
    {
      url:image.url,
      headers: config.pixiv.headers
    },
    function(err,res,body){
      //同步获取文件信息
      var stats = fs.statSync(path.join(dir,image.filename));
      (function(){
        image.size = stats.size;
        //如果size大于1000判定为正常图片
        //并标志成已完成
        if(image.size > 1000){
          image.complete = true;
        }
        else{
          image.complete = false;
        }
      })();

      //反送404信号并删除错误文件，尝试用png下载
      if(res && res.statusCode == 404 && image.url.match(/\.jpg$/)){
        fs.unlink(path.join(dir,image.filename));   //删除jpg文件
        emitter.emit("res404",image);
      }
      
      //发送图片下载完成信号
      else if(image.size && image.size > 1000){
        emitter.emit("finishADownload",image);
      }
      else{
        fs.unlink(path.join(dir,image.filename));   //删除文件
        emitter.emit("failDownload",image);
      }
  }).pipe(fs.createWriteStream(path.join(dir||"",image.filename||".trash")));
};

emitter.gen = download;
module.exports = emitter;
