// Javascript File
//Filename: pixivLogin.js
//Created: 2014-04-19 20:16:28
//Desc: pixiv 模拟登陆
//Author: Myon, myon.cn@gmail.com

var fs = require('fs');
var config = require('./config.js');
var events = require('events');
var emitter = new events.EventEmitter();
var request = require('request');
const locateChrome = require('locate-chrome')
const locateFirefox = require('locate-firefox')

//desc 登陆
//param form        表单对象
//return string     cookie
var login = function (form){
  //如果存在cookie文件则直接读取，不存在则登陆写入
  fs.exists(config.pixiv.cookieFile, async function(exists){
    if(exists){
      console.log("读取cookie文件");
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
      console.log("模拟登录");
      const browser = await getHeadlessBrowser();
      const page = await browser.newPage();
      await page.goto('https://accounts.pixiv.net/login', { waitUntil: 'networkidle2', timeout: 0 });
      const recaptchaV3Token = await page.evaluate(function () {
        return new Promise((resolve, reject) => {
          const _d = () => {
            const tokenElem = document.querySelector('#recaptcha-v3-token');
            if (tokenElem.value) {
              resolve(tokenElem.value);
            } else {
              setTimeout(_d, 200)
            }
          }
          _d();
        });
      });
      // const postKey = await page.evaluate(function () {
      //   return new Promise((resolve, reject) => {
      //     const _d = () => {
      //       const tokenElem = document.querySelector('#init-config');
      //       if (tokenElem.value) {
      //         resolve(tokenElem.value.match(/postKey":"([^"]*)"/)[1]);
      //       } else {
      //         setTimeout(_d, 200)
      //       }
      //     }
      //     _d();
      //   });
      // });
      await page.waitForSelector('#LoginComponent .input-field:first-of-type')
      await page.click('#LoginComponent .input-field:first-of-type');
      await page.type('#LoginComponent .input-field:first-of-type', form.pixiv_id, {delay: 100});
      await page.click('#LoginComponent .input-field:last-of-type');
      await page.type('#LoginComponent .input-field:last-of-type', form.password, {delay: 100});
      await page.click('#LoginComponent .signup-form__submit');
      await page.waitFor(3000);
      const cookies = await page.cookies();
      const cookie= cookies.map(e => `${e.name}=${encodeURIComponent(e.value)}`).join('; ');
      console.log(cookie)
      // doLogin(form, cookie);
      return;
    }
  });
};
/**
 * 登录操作
 * form 表单数据
 * cookie 进入登录页面时的默认cookie
 */
function doLogin(form, cookie) {
  var https = require("https");
  var querystring = require("querystring");

  var postData = querystring.stringify(form);

  var options = {
    host: "accounts.pixiv.net",
    path: "/api/login?lang=zh",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length,
      "Accept": "text/html, application/xhtml+xml, */*",
      "Accept-Language": "zh-CN",
      "Cache-Control": "no-cache",
      "Connection": "Keep-Alive",
      "Host": "accounts.pixiv.net",
      "Referer": "https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index",
      "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)",
      "Cookie": cookie
    }
  };

  var req = https.request(options,
    function (res) {
      res.setEncoding("utf8");
      var headers = res.headers;
      //console.log(headers);  
      var cookies = headers["set-cookie"] || [];
      fs.writeFile(config.pixiv.cookieFile, cookies.join(), function (err) {
        if (err) {
          console.log("获取cookie失败");
          throw err;
        }
        else {
          emitter.cookie = cookies.join();
          emitter.emit("getCookie", emitter);
        }
      });
      res.on("data",
        function (data) {
          console.log(data);
        });
      res.on("err",
        function (err) {
          console.log(err);
          throw -1;
        });
    });
  req.write(postData);
  req.end();
}


async function getHeadlessBrowser() {
  console.log('正在启动headless浏览器')
  let chromePath = await locateChrome();
  let firefoxPath = await locateFirefox();
  let browser = null;
  if (fs.existsSync(chromePath)) {
    browser = await require('puppeteer-core').launch({
      headless: false,
      executablePath: chromePath,
    })
  } else if (fs.existsSync(firefoxPath)) {
    browser = await require('foxr').launch({
      headless: true,
      executablePath: firefoxPath,
    })
  } else {
    console.error('找不到Chrome或Firefox执行文件路径，请手动设置');
    throw -1;
  }
  return browser;
}

emitter.login = login;
module.exports = emitter;
