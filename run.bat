set imagePath="images"
set url="http://www.pixiv.net/ranking.php?format=json&mode=daily&p=1"
set abbr="_daily"
set username=""
set passwd=""
cd /d %~dp0
node app.js --path=%imagePath% --url=%url% --abbr=%abbr% --username=%username% --passwd=%passwd%
ping window-will-close-in-5-second -n 1 -w 15000 > nul