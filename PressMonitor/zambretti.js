
/* zambrerri weather forecasting algorithm   
https://web.archive.org/web/20110610213848/http://www.meteormetrics.com/zambretti.htm
*/
var forecast = [
    "Settled Fine",
    "Fine Weather",
    "Becoming Fine",
    "Fine Becoming Less Settled",
    "Fine, Possibly showers",
    "Fairly Fine, Improving",
    "Fairly Fine, Possibly showers, early",
    "Fairly Fine Showery Later",
    "Showery Early, Improving",
    "Changeable Mending",
    "Fairly Fine , Showers likely",
    "Rather Unsettled Clearing Later",
    "Unsettled, Probably Improving",
    "Showery Bright Intervals",
    "Showery Becoming more unsettled",
    "Changeable some rain",
    "Unsettled, short fine Intervals",
    "Unsettled, Rain later",
    "Unsettled, rain at times",
    "Very Unsettled, Finer at times",
    "Rain at times, worse later.",
    "Rain at times, becoming very unsettled",
    "Rain at Frequent Intervals",
    "Very Unsettled, Rain",
    "Stormy, possibly improving",
    "Stormy, much rain"
];

var falling = [0,1,3,7,14,17,20,21,23];

var steady = [0,1,4,10,13,15,18,22,23,25];

var rising = [0,1,2,5,6,8,9,11,12,16,19,24,25];

function f_fall(p){
    var v =  Math.round(129-0.123*p);
    var i =  v<0 ? 0 : v>8 ? 8 : v;
    return forecast[falling[i]];
}
function f_same(p){
    var v =  Math.round(139-0.1346*p);
    var i = v<0 ? 0 : v>9 ? 9 : v;
    return forecast[steady[i]];
}
function f_rise(p){
    var v =  Math.round(147.6-0.143*p);
    var i =  v<0 ? 0 : v>12 ? 12 : v;
   return forecast[rising[i]];
}

function zambretti(d,p){
    if (d<0)
        return f_fall(p);
    else if (d>0)
        return f_rise(p);
    else 
        return f_same(p);
}
