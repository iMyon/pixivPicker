// Javascript File
//Filename: pixivLogin.js
//Created: 2014-04-19 20:16:28
//Desc: pixiv 模拟登陆
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var config = require('./config.js');
var events = require('events');
var emitter = new events.EventEmitter();

//desc 登陆
//param form        表单对象
//return string     cookie
var login = function(form){
  //如果存在cookie文件则直接读取，不存在则登陆写入
  fs.exists(config.pixiv.cookieFile,function(exists){
    if(exists){
      console.log("读取cookie文件")
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
      console.log("模拟登录")
      var https = require("https");
      var querystring = require("querystring");
      var url = "https://www.secure.pixiv.net/login.php";

      var contents = querystring.stringify(form);

      var options = {
        host: "www.secure.pixiv.net",
        path: "/login.php",
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": contents.length,
          "Accept": "text/html, application/xhtml+xml, */*",
          "Accept-Language": "zh-CN",
          "Cache-Control": "no-cache",
          "Connection": "Keep-Alive",
          "Host": "www.secure.pixiv.net",
          "Referer": "http://www.pixiv.net/",
          "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)"
        }
      };

      var req = https.request(options,
      function(res) {
        res.setEncoding("utf8");
        var headers = res.headers;
        //console.log(headers);  
        var cookies = headers["set-cookie"];
        fs.writeFile(config.pixiv.cookieFile,cookies.join(),function(err){
          if(err){
            console.log("获取cookie失败");
            throw err;
          }
          else{
            emitter.cookie = cookies.join();
            emitter.emit("getCookie",emitter);
          }
        });
        res.on("data",
        function(data) {
          console.log(data);
        });
        res.on("err",
        function(err) {
          console.log(err);
          throw -1;
        });
      });
      req.write(contents);  
      req.end(); 
    }
  });
};

emitter.login = login;
module.exports = emitter;
