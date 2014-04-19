// Javascript File
//Filename: pixivLogin.js
//Created: 2014-04-19 20:16:28
//Desc: pixiv 模拟登陆
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var request = require('request');
var config = require('./config.js');
var events = require('events');
var emitter = new events.EventEmitter();

//desc 登陆
//param username   用户名
//param passwd      密码
//return string     cookie
var login = function(username,passwd){
  //如果存在cookie文件则直接读取，不存在则登陆写入
  fs.exists(config.pixiv.cookieFile,function(exists){
    if(exists){
      fs.readFile(config.pixiv.cookieFile,"utf-8",function(err,data){
        if(err){
          throw err;
        }
        else{
          emitter.cookie = data;
          emitter.emit("getCookie",emitter);
        }
      });
    }

    //模拟登陆并写入cookie文件
    else{
      request.post({
          url:config.pixiv.login.url,
          from:config.pixiv.login.form,
        },
        function(err,r,b){
          fs.writeFile(config.pixiv.cookieFile,r.headers["set-cookie"].join(),function(err){
            if(err){
              console.log("获取cookie失败");
              throw err;
            }
            else{
              emitter.cookie = r.headers["set-cookie"].join();
              emitter.emit("getCookie",emitter);
            }
          });
        }
       );
    }
  });
};

emitter.login = login;
module.exports = emitter;
