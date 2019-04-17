/**
 * 工具类，集成各种工具
 */
(function(){
	var Util = window.Util = {
		getPos: getPos
	}
	//获取鼠标位置
	function getPos(obj,ev){
		ev = ev || window.event;
		var x,y;
		var pos = {x:0,y:0};
		if(ev.pageX && ev.pageY){
			x = ev.pageX;
			y = ev.pageY;
		} else {
			x = ev.clientX + document.body.scrollLeft || document.documentElement.scrollLeft;
			y = ev.clientY + document.body.scrollTop || document.documentElement.scrollTop;
		}
		x -= obj.offsetLeft;
		y -= obj.offsetTop;
		pos.x = x;
		pos.y = y;
		return pos;
	}
})()