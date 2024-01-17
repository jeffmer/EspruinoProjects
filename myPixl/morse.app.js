

const codes = {
  // letters
  "a": ".-",
  "b": "-...",
  "c": "-.-.",
  "d": "-..",
  "e": ".",
  // no é
  "f": "..-.",
  "g": "--.",
  "h": "....",
  "i": "..",
  "j": ".---",
  "k": "-.-",
  "l": ".-..",
  "m": "--",
  "n": "-.",
  "o": "---",
  "p": ".--.",
  "q": "--.-",
  "r": ".-.",
  "s": "...",
  "t": "-",
  "u": "..-",
  "v": "...-",
  "w": ".--",
  "x": "-..-",
  "y": "-.--",
  "z": "--..",
  //digits
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  "0": "-----",
  // punctuation
  ".": ".-.-.-",
  ",": "--..--",
  ":": "---...",
  "?": "..--..",
  "!": "-.-.--",
  "'": ".----.",
  "-": "-....-",
  "_": "..--.-",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "\"": ".-..-.",
  "=": "-...-",
  "+": ".-.-.",
  "*": "-..-",
  "@": ".--.-.",
  "$": "...-..-",
  "&": ".-...",
}, chars = Object.keys(codes);

function choices(start) {
  return chars.filter(char => codes[char].startsWith(start));
}

function char(code) {
  if (code==="") return " ";
  for(const char in codes) {
    if (codes[char]===code) return char;
  }
  const c = choices(code);
  if (c.length===1) return c[0]; // "-.-.-" is nothing, and only "-.-.--"(!) starts with it
  return "";
}


var code = "";
var word = "";
var ch ="";

function box(s,x,y,w){
   var fh = g.getFontHeight();
   var sw = g.stringWidth(s);
   w = w>sw+2?w:sw+2;
   g.drawRect(x,y,x+w+2,y+fh+2);
   g.drawString(s,x+w/2,y+1);
}



function display(){
  g.clear();
  g.setFont("Vector",15);
  function drawChoices(cs,x,y){
    g.drawString(g.wrapString(cs.join(" "),g.getWidth()-50).join("\n"),x,y);
  }
  g.setFontAlign(-1,-1);
  drawChoices(choices(code+"."),25,10);
  drawChoices(choices(code+"-"),25,80);
  g.setFont("Vector",24);
  g.setFontAlign(0,-1);
  box(code,25,45,60);
  box(ch,100,45,20);
  box(word,140,45,80);
  g.flip();
}


function add(c){
  code = code+c;
  ch = char(code);
  display();
}

function gotch(){
  word=word+ch;
  ch="";
  code="";
  display();
}


P2.setUI("updown",(v)=>{
    if (v) add(v<0?".":"-");
    else gotch();
});
/*           
setWatch(()=>add("."),BTN3,{edge:"falling",repeat:true});
setWatch(()=>add("-"),BTN1,{edge:"falling",repeat:true});
setWatch(()=>gotch(),BTN2,{edge:"falling",repeat:true});
*/
display(code);


