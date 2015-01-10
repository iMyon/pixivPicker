//用于检测图片是否完整
 
var events = require('events');
var emitter = new events.EventEmitter();


var check = function(image){
  var fs = require('fs'); 
  fs.readFile(image.path, function(err, data) { 
    if(err) { 
      console.error(err); 
    } else{ 
      //发射信号
      if(isComplete(data))
        emitter.emit("image_complete", image);
      else
        emitter.emit("image_not_complete", image);
    } 
  }); 
}

//图片完整性检查算法来自http://blog.csdn.net/osmeteor/article/details/40299357
var isComplete = function(szBuffer){
  //png检查  
  if (szBuffer[0] == 137 && szBuffer[1] == 80 && szBuffer[2] == 78 && szBuffer[3] == 71 && szBuffer[4] == 13  
      && szBuffer[5] == 10 && szBuffer[6] == 26 && szBuffer[7] == 10)  
  {  
      //&& szBuffer[szBuffer.length - 8] == 73 && szBuffer[szBuffer.length - 7] == 69 && szBuffer[szBuffer.length - 6] == 78  
      if (szBuffer[szBuffer.length - 5] == 68 && szBuffer[szBuffer.length - 4] == 174 && szBuffer[szBuffer.length - 3] == 66  
          && szBuffer[szBuffer.length - 2] == 96 && szBuffer[szBuffer.length - 1] == 130)  
          return true;  
      //有些情况最后多了些没用的字节  
      for (var i = szBuffer.length - 1; i > szBuffer.length / 2; --i)  
      {  
          if (szBuffer[i - 5] == 68 && szBuffer[i - 4] == 174 && szBuffer[i - 3] == 66  
           && szBuffer[i - 2] == 96 && szBuffer[i - 1] == 130)  
              return true;  
      }  


  }  

  else if (szBuffer[0] == 255 && szBuffer[1] == 216) //jpg  
  {  
      //标准jpeg最后出现ff d9  
      if (szBuffer[szBuffer.length - 2] == 255 && szBuffer[szBuffer.length - 1] == 217)  
          return true;  
      else  
      {  
          //有好多jpg最后被人为补了些字符也能打得开, 算作完整jpg, ffd9出现在近末端  
          //jpeg开始几个是特殊字节, 所以最后大于10就行了 从最后字符遍历  
          //有些文件会出现两个ffd9 后半部分ffd9才行  
          for (var i = szBuffer.length - 2; i > szBuffer.length / 2; --i)  
          {  
              //检查有没有ffd9连在一起的  
              if (szBuffer[i] == 255 && szBuffer[i + 1] == 217)  
                  return true;  
          }  
      }  
  }  
}

emitter.check = check;
module.exports = emitter;