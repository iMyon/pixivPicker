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
//param filename    文件名
//return none
var download = function(uri,dir,filename){
  //启用cookie
  var j = request.jar();
  var cookie = request.cookie(config.pixiv.cookie);
  j.setCookie(cookie, uri);
  request(
    {
      url:uri,
      headers: config.pixiv.headers,
      jar:j
    },
    function(err,res,body){
      //反送404信号并删除错误文件，尝试用png下载
      if(res && res.statusCode == 404 && uri.match(/\.jpg$/)){
        emitter.emit("res404");
        fs.unlink(path.join(dir,filename));
        download(uri.replace(/\.jpg/,".png"),dir,filename.replace(/\.jpg/,".png"));
        return;
      }
      //发送图片下载完成信号
      else{
        emitter.emit("finishADownload");
      }
  }).pipe(fs.createWriteStream(path.join(dir||"",filename||".trash")));
};

emitter.gen = download;
module.exports = emitter;
