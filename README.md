###pixivPicker

抓取p站每日前50图片

###运行环境

使用前需安装nodejs，[官网下载](http://nodejs.org/)

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

示例：`node app.js -p /home/myon/pixiv`

###设置

所有设置都在`lib/config.js`里，比较重要的选项：

* `saveFolder`：  下载图片保存的路径，可以填绝对或相对路径
* `maxRetryTime`：下载失败重试次数
* `fetchUrl`:抓取网页的类型，列表 ,参数--url 可以设置的值 

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

反正就这几个参数，自己拼下  

#####cookie设置  

当前目录新建.cookie文件，填写pixiv已登录状态的cookie

######获取cookie的方法

[拖拽我到书签栏](javascript:alert(document.cookie);void(0);)  到p站点击，复制粘贴


###图片保存目录说明

默认保存在当前目录下的images目录 ，带参数的话保存在参数指定目录  
以`yyyy/mm/dd`结构的目录保存每日图片

###日志说明
以`yyyy-MM-dd.log`形式保存在`log`目录，json格式

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

