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
-p        | 保存路径

示例：`node app.js -p /home/myon/pixiv`

###设置

所有设置都在`lib/config.js`里，比较重要的选项：

* `saveFolder`：  下载图片保存的路径，可以填绝对或相对路径
* `maxRetryTime`：下载失败重试次数

###图片保存目录说明

默认保存在当前目录下的images目录  带参数的话保存在参数指定目录
以`yyyy/mm/dd`结构的目录保存每日图片

###日志说明
以`yyyy-MM-dd.log`形式保存在`log`目录，json格式

###其他

推荐设置定时任务每天执行，手动执行的话也比较麻烦

