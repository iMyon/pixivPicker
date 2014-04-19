// Javascript File
//Filename: today-path.js
//Created: 2014-04-19 02:30:29
//Desc: 获取今天的目录
//Author: Myon, myon.cn@gmail.com

var mkdirp = require('mkdirp');


//格式化日期输出
Date.prototype.format = function(format) //author: meizz
{
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(), //day
    "h+" : this.getHours(), //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter
    "S" : this.getMilliseconds() //millisecond
  };
  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

//desc  创建并返回路径
//param none
//return
//  成功创建 - path
//  创建失败 - null
module.exports = (function(){ 
  var now = new Date(); 
  var path = now.format("yyyy/MM/dd"); 
  mkdirp(path,function(err){ 
      //如果创建目录出错则将path置null
      if(err){ 
          console.log(err);
          path = null;
      } 
  }); 
  return path;
})();
