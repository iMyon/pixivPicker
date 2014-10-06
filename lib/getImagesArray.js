
var fs = require('fs');
var path = require('path');
var request = require('request');
var argv = require('optimist').argv;
var storage = require('./storage.js');
var mkdirp = require('mkdirp');
var config = require('./config.js');
var filter = require('./filter.js');
var events = require('events');
var emitter = new events.EventEmitter();
var basePath = "";    //保存文件path日期部分，请求后获取


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

var images = [];

var rankImages = function(pixiv){
  //从每日图片排行网页抓图
  var j = request.jar();
  var rcookie = request.cookie(pixiv.cookie);
  j.setCookie(rcookie, config.pixiv.fetchUrl);
  console.log("获取列表中");
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
        fs.unlink(config.pixiv.cookieFile);
        console.log("cookie有误 或者 你的pixiv设置中未开启r18")
        console.log("请设置正确的账号密码和pixiv设置，并尝试重新运行");
        throw -1;
      }
      var items = JSON.parse(body).contents;
      basePath = JSON.parse(body).date
        .replace(/^(\d{4})(\d{2})(\d{2})$/g,path.join("$1","$2","$3"));
      basePath = path.join(config.pixiv.saveFolder,basePath+config.pixiv.pathAbbr);
      mkdirp.sync(basePath);

      // 获取并读取日志文件
      //今天日志
      logFile = JSON.parse(body).date
        .replace(/^(\d{4})(\d{2})(\d{2})$/g,path.join(config.pixiv.logPath,"$1-$2-$3"));
      logFile += config.pixiv.pathAbbr;
      var logImages = storage.readLog(logFile);   //读取log日志记录的文件
      //昨天日志(如果今日榜有昨天的则去除)
      var yesLogFile = JSON.parse(body).prev_date
        .replace(/^(\d{4})(\d{2})(\d{2})$/g,path.join(config.pixiv.logPath,"$1-$2-$3"));
      yesLogFile += config.pixiv.pathAbbr;
      var yesLogImages = storage.readLog(yesLogFile);   //读取log日志记录的文件

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
        // tempimg.url = item.url.replace(/^(.*\/)mobile\/(.*)_.*(\..*)$/g,"$1$2$3");
        tempimg.url = item.url.replace(/^(http:\/\/i\d.pixiv.net\/).*img-master\/(img\/.*_p0).*(\.jpg)$/g,"$1img-original/$2$3");
        if(tempimg.illust_page_count > 1)
          tempimg.is_xiangce = true;
        tempimg.filename = storage.formatFilename(tempimg,config.pixiv.filenameFormat) + ".jpg";
        tempimg.basePath = basePath;
        //查看是否成功已经下载过该文件
        //如果文件下载过则把image对象的替换，complete为true（之后download那边会判断）
        //今日
        if(logImages){
          for(var j=0;j<logImages.success.length;j++){
            var image = logImages.success[j];
            if(image.illust_id == tempimg.illust_id){
              tempimg = image;
            }
          }
        }
        //昨日
        if(yesLogImages){
          for(var j=0;j<yesLogImages.success.length;j++){
            var image = yesLogImages.success[j];
            if(image.illust_id == tempimg.illust_id){
              tempimg = image;
            }
          }
        }
        images.push(tempimg);
      }
      // console.log(images);
      console.log("下载开始");
      //发射获取图片信号
      emitter.emit("getImages",images);
    });
};
var authorImages = function(pixiv){
  Promise = require('promise');
  var promises = [];
  //获取一页的图片
  (function getAPage(url, promises){
    url = url ? url : config.pixiv.fetchUrl;
    var j = request.jar();
    var rcookie = request.cookie(pixiv.cookie);
    j.setCookie(rcookie, config.pixiv.fetchUrl);
    console.log("获取列表中");
    request(
      {
        url: url,
        headers: config.pixiv.headers,
        jar:j
      },
      function(err,res,body){
        if(res && res.statusCode == 200){
          var env = require('jsdom').env;
          env(body, function (errors, window) {
            var $ = require('jquery')(window);
            logFile = path.join(config.pixiv.logPath,$("title").text());
            logImages = storage.readLog(logFile);   //读取log日志记录的文件
            //初始化promise数组
            $('.work').each(function(){
              promises.push(getImagePage(config.pixiv.host + $(this).attr("href"),pixiv));
            });
            var currentPage = $(".page-list .current");
            if(currentPage.length && currentPage.next().length){
              //递归
              getAPage(url.replace(/\?.*$/,"") + currentPage.next().find('a').attr("href"), promises);
            }
            //全部请求完成后集中处理
            else{
              Promise.all(promises).then(function(){
                emitter.emit("getImages",images);
              });
            }
              
          });
        }
      }
    );
  })(config.pixiv.fetchUrl, promises);
};


//通过请求图片页面，获取图片详细信息
//@param url 图片页面
//@retrun promise
var getImagePage = function(url,pixiv){
  var promise = new Promise(function(resolve, reject){
    var j = request.jar();
    var rcookie = request.cookie(pixiv.cookie);
    j.setCookie(rcookie, config.pixiv.fetchUrl);
    request(
      {
        url:url,
        headers: config.pixiv.headers,
        jar:j
      },
      function(err,res,body){
        var env = require('jsdom').env;
        if(body){
          env(body, function (errors, window) {
            var $ = require('jquery')(window);
            var image = {};
            image.illust_id = $('.works_display a').attr("href").match(/illust_id=(\d+)/)[1];
            image.title = $('.works_display img').attr("title");
            // image.width = $('meta li').eq(1).text().match(/^(\d+)×/)[1];
            // image.height = $('meta li').eq(1).text().match(/×(\d+)/)[1];
            image.date = $('.meta li').eq(0).text();
            image.tags = Array.prototype.map.call($(".tag"),function(x){
              return $(x).text();
              });
            image.url = $(".works_display img").attr("src").replace("_m","");
            image.user_id = $(".user-link").attr("href").match(/id=(\d+)/)[1];
            image.user_name = $("h1.user").text();
            image.profile_img = $(".user-image").attr("src");
            image.total_score = $(".score-count").text();
            image.total_score = $("view-count").text();

            image.basePath = path.join(config.pixiv.saveFolder, $(".user").text());
            mkdirp.sync(image.basePath);
            image.filename = storage.formatFilename(image,config.pixiv.filenameFormat) + ".jpg";
            for(var i=0; i<images.length; i++)
            {
              if(image.filename == images[i].filename){
                image.title = image.title +  + new Date().getTime();
                image.filename = storage.formatFilename(image,config.pixiv.filenameFormat) + ".jpg";
              }
            }
            image.path = path.join(image.basePath, image.filename);
            if(logImages){
              for(var j=0;j<logImages.success.length;j++){
                var logImage = logImages.success[j];
                if(image.illust_id == logImage.illust_id){
                  image = logImage;
                }
              }
            }

            //过滤
            var is_pass = filter.tagFilter(image);
            if(is_pass !== true){
              images.push(image);
              console.log(image.filename);
            }
            resolve();
          });
        }
        else resolve();
      }
    );
  });
  return promise;
};

emitter.rankImages = rankImages;
emitter.authorImages = authorImages;
module.exports = emitter;
