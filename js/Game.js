/**
 * 中介者类
 * 1、事件监听
 * 2、资源读取
 * 3、管理其他各个类
 */
(function(){
	var Game = window.Game = function(id){
		this.canvas = document.querySelector(id);
		this.ctx = this.canvas.getContext("2d");
		this.thinking = document.querySelector(".thinking");
		//所有资源图片的集合
		this.R = {};
		this.init();
	}
	//初始化，设置canvas宽、高
	Game.prototype.init = function(){
		this.canvas.width = 521;
		this.canvas.height = 577;
		//设置“等待”图片的位置
		this.thinking.style.left = (this.canvas.width - 32) / 2 + "px";
		this.thinking.style.top = (this.canvas.height - 32) * (1 - 0.618) + "px";

		var self = this;

		this.loadAllResources("R.json",function(){
			self.start();
			self.bindEvent();
		});
	}
	//开始游戏，先读取资源文件，然后开始
	Game.prototype.start = function(){
		this.board = new Board();
		this.position = new Position();
		this.search = new Search();
		this.board.init();
	}
	//读取资源文件
	Game.prototype.loadAllResources = function(file,callback){
		var xhr;
		var self = this;
		if(window.XMLHttpRequest){
			xhr = new XMLHttpRequest();
		} else {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xhr.onreadystatechange = function(){
			if(xhr.status == 200 && xhr.readyState == 4){
				var result = JSON.parse(xhr.responseText);

				var images = result.images;
				var len = images.length;
				var count = 0;
				for(var i=0;i<len;i++){
					self.R[images[i]["name"]] = new Image();
					self.R[images[i]["name"]].src = images[i]["url"];
					self.R[images[i]["name"]].onload = function(){
						count++;
						var text = "正在加载 " + count + "/" + len + ",请稍后...";
						self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
						self.ctx.textAlign = "center";
						self.ctx.font = "15px 微软雅黑";
						self.ctx.fillText(text,self.canvas.width / 2,self.canvas.height * (1 - 0.618));
						if(count >= len){
							console.log("加载完毕");
							callback && callback();
						}
					}	
				}
			}
		}
		xhr.open("get",file);
		xhr.send(null);
	}
	//添加事件监听
	Game.prototype.bindEvent = function(){
		var self = this;
		//移动事件
		this.canvas.onmousemove = function(event){
			if(self.board.busy){
				return;
			}
			var pos = Util.getPos(document.querySelector(".box"),event);
			var mx = parseInt(pos.x / 57) + 3,my = parseInt(pos.y / 57) + 3;
			var p = self.board.coord_XY(mx,my);
			if(!game.board.inBoard(p)){
				return;
			}
			self.board.mousemove = p;
			self.board.flushBoard();
		}
		//点击事件
		this.canvas.onclick = function(event){
			if(self.board.busy || self.board.sdPlayer == game.board.com){
				return;
			}
			var pos = Util.getPos(document.querySelector(".box"),event);
			var mx = parseInt(pos.x / 57) + 3,my = parseInt(pos.y / 57) + 3;
			//获取点击的位置
			var p = self.board.coord_XY(mx,my);
			if(!game.board.inBoard(p)){
				return;
			}
			//获取点击的棋子
			var pc = self.board.squares[p];
		
			//判断点击的棋子是否是本方棋子
			if((pc & self.board.sideFlag(self.board.sdPlayer)) != 0){
				//是点击的己方棋子，则直接赋值
				self.board.sqSelected = p;
				//刷新界面
				self.board.flushBoard();
			} else { //不是本方的棋子，则说明是对方棋子，或者是空子
				var mv = self.position.move(self.board.sqSelected,p);
				self.board.addMove(mv,false);
				self.board.flushBoard();
				self.board.response();
			}
	
		}
	}
})()