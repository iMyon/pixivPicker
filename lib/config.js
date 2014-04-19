// Javascript File
//Filename: config.js
//Created: 2014-04-19 04:00:28
//Desc: 各种设置
//Author: Myon, myon.cn@gmail.com

module.exports = {
  pixiv:{
    fetchUrl:'http://www.pixiv.net/ranking.php?mode=daily',       //抓图网页
    login:{
      url:"https://www.secure.pixiv.net/login.php", //登陆网址
      //表单信息
      form:{
        pixiv_id:"",       //p站用户名(唯一id)
        pass:"",             //p站密码
        mode:"login",
        skip:1
      }
    },
    saveFolder:"images",              //保存目录
    logPath:"log",                    //日志文件目录
    maxRetryTime:5,                   //下载失败重下次数
    host:"http://www.pixiv.net/",
    headers:{
      'Referer':"http://www.pixiv.net",
      'User-Agent':"Great Firefox",
    },
    cookieFile:".cookie"
  }
};
