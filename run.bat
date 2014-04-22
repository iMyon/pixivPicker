set imagePath="E:\pixivPicker"
set url="http://www.pixiv.net/ranking.php?format=json&mode=daily18&p=1"
set abbr="_daily"
set username=""
set passwd=""
cd /d %~dp0
node app.js --path=%imagePath% --url=%url% --abbr=%abbr% --username=%username% --passwd=%passwd%
ping 十秒后关闭窗口 -n 1 -w 15000 > nul