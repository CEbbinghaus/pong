TouchList.prototype.forEach = function(f){for(let i in this){if(!isNaN(parseInt(i)))f(this[i])}};
String.prototype.forEach = function(c){
  let r;
  for(i = 0; i < this.length; i++){
      if(i == 0){r = c(this.charAt(i))}
      else{r += c(this.charAt(i))}
  }
  return r;
}
String.prototype.rand = function() {
  return this.charAt(Math.random() * this.length | 0);
};
Number.prototype.loop = function(c){
  let r = null;
  for(i = 0; i < this; i++){
      if(i == 0){r = c(i)}
      else{r += c(i)}
  }
  return r;
}

const randChar = (p = 0) => {
  p = p > 3 ? 3 : p;
  let Alphabet = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789"]
  let a  = '';
  a = Alphabet[Math.random() * p | 0];
  a = a.charAt(Math.random() * a.length | 0);
  return a;
}
const genId = (len = 1, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") => {
  return len.loop(() => chars.rand());
};
const trueType = v => {
  switch(typeof v){
      case "object":
          if(v == null)return "null";
          if(v.length != undefined) return "array";
          return "object"
      break;
      case "number":
          if(isNaN(v))return "nan";
          return "number";
      break;
      case "function":
      return "function"
          try{
              let k = new v();
              return v.name;
          }catch(err){
              return "function"
          }
      break;
      default:
          return typeof v;
  }
}

Array.prototype.copy = function(){
    return this.slice(0);
}

const point = (p1, p2, p) => {
  p = p < 1 ? 1 - p : (100 - p) / 100;
  let x = (p2.x - p1.x) * p;
  let y = (p2.y - p1.y) * p;
  return {x: p1.x + x, y: p1.y + y}
}

function isFullScreen()
{
    return (document.fullScreenElement && document.fullScreenElement !== null)
         || document.mozFullScreen
         || document.webkitIsFullScreen;
}


function requestFullScreen(element)
{
    if (element.requestFullscreen)
        element.requestFullscreen();
    else if (element.msRequestFullscreen)
        element.msRequestFullscreen();
    else if (element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
}

function exitFullScreen()
{
    if (document.exitFullscreen)
        document.exitFullscreen();
    else if (document.msExitFullscreen)
        document.msExitFullscreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen)
        document.webkitExitFullscreen();
}

function toggleFullScreen(element)
{
    if (isFullScreen())
        exitFullScreen();
    else
        requestFullScreen(element || document.documentElement);
}