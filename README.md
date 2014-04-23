###pixivPicker

抓取p站每日前50图片

###运行环境

使用前需安装nodejs，[官网下载](http://nodejs.org/)

###安装  

* 使用 git 下载  
    `git clone https://github.com/iMyon/pixivPicker.git -b beta`  
* 直接下载压缩包  
    点击右边的`download zip`

###使用说明

####不带参数运行

不带参数会保存在设置文件设置的路径里

  * linux
    * 命令行运行 `node app.js`
  * windows:
    * 右键使用nodejs打开`app.js`

####参数列表

参数名    | 描述
----------|------------
--path    | 保存路径
--url     | 请求网址，下面有列表
--abbr    | 文件夹命名后缀，如 `--abbr=r_18` 则文件存放路径大致如下path/to/2014/4/15_r18
--username| 用户id，用于模拟登录获取cookie
--passwd  | 用户密码，用于模拟登录获取cookie

示例：`node app.js --path=/home/myon/pixiv`

###设置

所有设置都在`lib/config.js`里，比较重要的选项：

* `saveFolder`：  下载图片保存的路径，可以填绝对或相对路径
* `maxRetryTime`：下载失败重试次数
* `tabPass` :根据tag过滤关键字，满足条件则此图片不下载  
* `tabOnly` :根据tag过滤关键字，只下载tag中包含关键字的图片  
    `tag`可以自行查看log日志文件分析，格式化日志文件可以[点这里](http://jsbeautifier.org/)
* `fetchUrl`:抓取网页的类型，列表 ,参数--url 可以设置的值 
* `pixiv_id`:用户id，用于模拟登录获取cookie，参数--username指定了的话则此设置不生效
* `pass`:    用户密码，用于模拟登录获取cookie，参数--passwd指定了的话则此设置不生效

说明             |   地址
----------------|---------------------------------
每日             |  http://www.pixiv.net/ranking.php?format=json&mode=daily&p=1
每日r18          |  http://www.pixiv.net/ranking.php?format=json&mode=daily_r18&p=1
每日r18g         |  http://www.pixiv.net/ranking.php?format=json&mode=daily_r18g&p=1
每周             |  http://www.pixiv.net/ranking.php?format=json&mode=weekly&p=1
每周r18          |  http://www.pixiv.net/ranking.php?format=json&mode=weekly_r18&p=1
每日 r18g        |  http://www.pixiv.net/ranking.php?format=json&mode=weekly_r18g&p=1
男性             |  http://www.pixiv.net/ranking.php?format=json&mode=male&p=1
女性             |  http://www.pixiv.net/ranking.php?format=json&mode=female&p=1

* `formatString`: 命名filename的格式 ，以下面为例子  
  如果填写`${user_name} - ${title}` 则输出 `nico - 勿忘草`   
  其它字段如下，都是字面意思

```  
  {
    "illust_id": 43014060,
    "title": "勿忘草",
    "width": 600,
    "height": 360,
    "date": "2014年04月21日 00:22",
    "tags": ["オリジナル", "女の子", "オリジナル100users入り", "青白黒"],
    "url": "http:\/\/i2.pixiv.net\/img32\/img\/apo_lovin\/mobile\/43014060_240mw.jpg",
    "user_id": 853948,
    "user_name": "nico",
    "profile_img": "http:\/\/i2.pixiv.net\/img32\/profile\/apo_lovin\/6488174_s.jpg",
    "rank": 53,
    "yes_rank": 71,
    "total_score": 1426,
    "view_count": 3673
  }  
```

反正就这几个参数，自己拼下  

#####cookie设置  

***如果模拟登录获取不到cookie的话可以试试手动填写***  
r18图片需要设置cookie才能下载，没有这个需求的的可无视此项设置  
app.js同目录新建`.cookie`（首次运行也会生成一个示例文件，需替换成自己的才能生效）文件，填写pixiv已登录状态的cookie

######获取cookie的方法

小书签：`javascript:alert(document.cookie);void(0);`  
小书签运行方法可参照[各种浏览器运行所谓「JS代码/脚本」的方法](http://tieba.baidu.com/p/1620692564)  
到p站点击，复制粘贴


###图片保存目录说明

默认保存在当前目录下的images目录 ，带参数的话保存在参数指定目录  
以`yyyy/mm/dd${abbr}`结构的目录保存每日图片，期中日期为服务器日期，不是本地日期

###日志说明
以`yyyy-MM-dd${abbr}.log`形式保存在`log`目录，json格式

###设置定时任务  
#### windows下设置定时执行的方法   

#####1.控制面板找到计划任务，点击创建任务  
![](http://imgsrc.baidu.com/forum/pic/item/06b921381f30e9242db7d2ab4e086e061c95f74e.jpg)  

#####2.按图示设置如下
![](http://imgsrc.baidu.com/forum/pic/item/29891630e924b8993f2f37a26c061d950b7bf64e.jpg)  
######新建触发器，图示为每隔20分执行一次，因为只有首次下载比较耗费网速，所以时间间隔任意
![](http://imgsrc.baidu.com/forum/pic/item/93e9d809b3de9c82ce14b1156e81800a18d84363.png)  

######启动程序填最新版本的run.vbe所在路径（需和app.js同路径）  
这个是后台静默运行run.bat，不会打开命令行窗口的，下载目录可以在run.bat设置
![](http://imgsrc.baidu.com/forum/pic/item/8ba26a2762d0f7033400dd460afa513d2797c52f.png)
  
######条件选任何连接
![](http://imgsrc.baidu.com/forum/pic/item/b928a0014c086e0684bb71d100087bf40bd1cb4e.jpg)  

####linux下设置定时任务  
`crontab -e`
具体百度，很简单

