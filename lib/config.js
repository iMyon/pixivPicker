// Javascript File
//Filename: config.js
//Created: 2014-04-19 04:00:28
//Desc: 各种设置
//Author: Myon, myon.cn@gmail.com

module.exports = {
  browser: {
    chrome: '' // 例：C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
  },
  pixiv:{
    fetchUrl:'https://www.pixiv.net/ranking.php?format=json&mode=daily&p=1',       //抓图网页
    login:{
      form:{
        pixiv_id: "",             //登录名
        password: "",             //密码
        captcha:  "",
        g_recaptcha_response:"",
        post_key: "",
        source: "accounts",
        ref: '',
        return_to: 'https://www.pixiv.net/'
      }
    },
    //根据tag过滤不喜欢的图片，英文逗号分隔，满足条件的图片pass
    // tag的话可以自行分析log日志文件（js-beautify一下）
    //！！！！特别提醒：逗号要用英文的逗号，即"," ！！！！！
    tagPass:"腐,巨人",
    //根据tag过滤出包含设置字符的图片，逗号分隔，不满足的图片pass
    //不填则不进行过滤 
    tagOnly: "",
    saveFolder:"images",              //保存目录
    pathAbbr: "",                     //目录追加内容
    logPath:"log",                    //日志文件目录
    //文件命名格式，可用字段详细说明请到github查看
    filenameFormat: "${user_name} - ${title}[pid=${illust_id}]",
    maxRetryTime:5,                   //下载失败重下次数
    host:"https://www.pixiv.net/",
    headers:{
      'Referer':"https://www.pixiv.net",
      'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.",
    },
    cookieFile:".cookie"
  },
  //超过时间未完成直接结束进程（毫秒）
  timeout:10*60*1000  //10分钟
};
