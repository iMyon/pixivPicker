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

//desc 登陆
//param form        表单对象
//return string     cookie
var login = function (form, headless = true){
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
      const browser = await getHeadlessBrowser(headless);
      console.log('启动成功')
      const page = await browser.newPage();
      await page.setUserAgent(config.pixiv.headers['User-Agent']);
      await page.goto('https://accounts.pixiv.net/login', { waitUntil: 'networkidle2', timeout: 0 });
      // 登陆成功处理
      (async () => {
        await page.waitFor(() => !!document.querySelector('.header-settings'), {timeout: 600000});
        console.log('登陆成功')
        const cookies = await page.cookies();
        const cookie= cookies.map(e => `${e.name}=${encodeURIComponent(e.value)}`).join('; ');
        fs.writeFileSync(config.pixiv.cookieFile, cookie);
        emitter.cookie = cookies.join();
        emitter.emit("getCookie", emitter);
        await browser.close();
      })();
      // 等待验证码处理
      if (headless) {
        (async () => {
          await page.waitFor(() => !!document.querySelector('#g-recaptcha'), {timeout: 300000});
          browser.close();
          console.error('自动登陆失败，请手动登陆');
          login(form, false);
        })();
      }
      await page.waitForSelector('#LoginComponent .input-field:first-of-type');
      await page.click('#LoginComponent .input-field:first-of-type');
      await page.type('#LoginComponent .input-field:first-of-type', form.pixiv_id, {delay: 40});
      await page.click('#LoginComponent .input-field:last-of-type');
      await page.type('#LoginComponent .input-field:last-of-type', form.password, {delay: 40});
      await page.click('#LoginComponent .signup-form__submit');
    }
  });
};

async function getHeadlessBrowser(headless) {
  console.log(`正在启动${headless ? 'headless': ''}浏览器`)
  let path = await locateChrome();
  if (fs.existsSync(path)) {
  } else if (fs.existsSync(config.browser.chrome)) {
    path = config.browser.chrome;
  } else {
    console.error('找不到Chrome执行文件路径，请手动设置/lib/config.js配置文件，\n修改browser下面的chrome配置');
    throw -1;
  }
  return await require('puppeteer-core').launch({
    headless: headless,
    executablePath: path,
  })
}

emitter.login = login;
module.exports = emitter;
