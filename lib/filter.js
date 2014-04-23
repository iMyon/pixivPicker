var config = require('./config.js');

module.exports = {
  //desc 根據tag篩選
  //param item    包含image信息的对象
  //return    bool
  tagFilter:function(item){
    var tagPass = config.pixiv.tagPass.split(",");
    var tagOnly = config.pixiv.tagOnly.split(",");
    var is_pass = false;      //是否跳过这个图片的下载
    //tagOnly
    if(config.pixiv.tagOnly !== ""){
      for(var k=0;k<tagOnly.length;k++){
        for(var j=0;j<item.tags.length;j++){
          //如果某个tag包含指定设置的关键字，则不跳过这个图片
          if(item.tags[j].indexOf(tagOnly[k]) != -1){
            is_pass = false;
            break;
          }
          else{
            is_pass = true;
          }
        }
        if(is_pass === false) break;
      }
    }
    //进入下一个循环
    if(is_pass === true){
      return is_pass;
    }
    //tagPass
    if(config.pixiv.tagPass !== ""){
      for(var k=0;k<tagPass.length;k++){
        for(var j=0;j<item.tags.length;j++){
          //如果某个tag包含指定设置的关键字，则跳过这个图片
          if(item.tags[j].indexOf(tagPass[k]) !== -1){
            is_pass = true;
            break;
          }
          else{
            is_pass = false;
          }
        }
        if(is_pass === true) break;
      }
    }
    return is_pass;
  }
}
