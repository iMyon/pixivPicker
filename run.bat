set imagePath="E:\pixivPicker"
cd /d %~dp0
node app.js -p %imagePath% -u "http://www.pixiv.net/ranking.php?format=json&mode=daily&p=1"
ping 十秒后关闭窗口 -n 1 -w 15000 > nul