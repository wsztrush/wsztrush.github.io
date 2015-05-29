var left = -165;
var direction = 10;
var sleepTime = 10;
function addPx(px, d){
	px = parseInt(px.substr(0, px.length-2)) + d;
	return px + "px";
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

function move(){
	var bar = document.getElementById("bar");	
	if((direction > 0 && left < 0) || (direction < 0 && left > -165)){
		bar.style.left = (left += direction) + "px";
		setTimeout("move()", sleepTime);
	}else{
		if(direction > 0){
			document.getElementById("barClick").src="http://7xiz10.com1.z0.glb.clouddn.com/left.png";
		}else{
			document.getElementById("barClick").src="http://7xiz10.com1.z0.glb.clouddn.com/right.png";
		}
		direction = -direction;
	}
}

function click(){
	setTimeout("move()", sleepTime);
}
