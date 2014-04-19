#!/usr/bin/env:node
// Javascript File
//Filename: app.js
//Created: 2014-04-19 02:26:07
//Desc: 主程序入口，执行 node app.js
//Author: Myon, myon.cn@gmail.com

var $ = require('jquery').create();
var basePath = require('./lib/today-path.js');
var download = require('./lib/download.js');

//存放图片信息 []
var images = [];
//存放push到images的临时信息

//download.gen('http://i2.pixiv.net/img30/img/motott/42916137.jpg',basePath,'test.png');

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
    var ilustSrc = $(item).find('IMG._thumbnail.ui-scroll-view').attr("data-src");
    tempimg.url = $(item).find('IMG._thumbnail.ui-scroll-view')
      .attr("data-src")
      .replace(/^(.*\/)mobile\/(.*)_.*(\..*)$/g,"$1$2$3");
    tempimg.filename = "#"+tempimg.rank+"."+ tempimg.url.match(/[^/]*(\.gif|\.jpg|\.jpeg|\.png)$/g)[0];
    images.push(tempimg);
  });
  console.log(images);
  //下载图片
  $.each(images,function(index,image){
    //console.log(image);
    download.gen(image.url,basePath,image.filename);
  });
});


//处理每个图片下载完成信号
(function(){
  var ccount = 0;             //已完成数量
  download.on("finishADownload",function(){
    ccount++;
    console.log("已完成 " + ccount + " , 剩余 " + (images.length - ccount));
  });
})();//(闭包)

