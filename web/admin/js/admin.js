/**
 * Created by TD on 2014-11-16.
 */

//changes the 'time' expressed top of the screen.
function timer() {
    var theDate = new Date();
    var week=["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    var yr=theDate.getFullYear();
    var mnth=theDate.getMonth()+1;
    var today=theDate.getDate();
    var hr=theDate.getHours();
    var min=theDate.getMinutes();
    var dowk=week[theDate.getDay()];
    
   //if the value is smaller than 10, shows '0x' form.
    mnth=addZeroToTimer(mnth);
    today=addZeroToTimer(today);
    hr=addZeroToTimer(hr);
    min=addZeroToTimer(min);
    
    document.getElementById("timer").innerHTML = yr +" "+mnth+" "+today+" "+hr+":"+min+" "+dowk;
}

/*timer changes every 1/60 minute. for accuracy.
¡ØThere is a problem that because of this interval,
timer does not appear immediately when page is loaded.*/
var itvForTime = setInterval(function(){timer()},1000);

function addZeroToTimer(i){
	if (i<10) {i="0"+i};
	return i;
}