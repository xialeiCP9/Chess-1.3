/**
 * 棋盘类
 * 1、棋盘初始化
 * 2、棋盘渲染
 * 3、棋盘更新
 */
(function(){
	var Board = window.Board = function(){
		//初始化棋盘，使用FEN字符串，表示棋盘初始状态
		this.fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
		//将棋盘扩展为 16 * 16 的一维数组，其中 值 为 1 的是真实数组
		this._IN_BOARD_ = [
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
		];
		//棋子定义
		this.PIECE_KING = 0; //将
		this.PIECE_ADVISOR = 1; //士
		this.PIECE_BISHOP = 2; //象
		this.PIECE_KNIGHT = 3; //马
		this.PIECE_ROOK = 4; //车
		this.PIECE_CANNON = 5; //炮
		this.PIECE_PAWN = 6; //卒
		//对应的图片名称,红方 8 - 14 黑方 16 - 22
		this.PIECE_NAME = [
			"oo",null,null,null,null,null,null,null,
			"rk","ra","rb","rn","rr","rc","rp",null,
			"bk","ba","bb","bn","br","bc","bp",null
		];
		//鼠标停留位置
		this.mousemove = -1;
		//电脑正在思考
		this.busy = false;
		//目前轮到红方还是黑方 红 - 0 黑 - 1
		this.sdPlayer = 0;
		//默认电脑为黑棋
		this.com = 1;
		//当前点击的棋子 0 表示没有棋子被选中
		this.sqSelected = 0;
		//上一次的步骤
		this.mvLast = 0;
		
	}
	Board.prototype.init = function(){
		this.fromFen();
		game.ctx.clearRect(0,0,game.canvas.width,game.canvas.height);
		this.render();
	}
	//界面处理
	Board.prototype.flushBoard = function(){
		game.ctx.clearRect(0,0,game.canvas.width,game.canvas.height);
		this.update();
		this.render();
	}
	//根据数组，渲染界面
	Board.prototype.render = function(){
		var pc = 0;
		for(var i=0;i<256;i++){
			pc = this.squares[i];
			if(this.inBoard(i)){
				var image = game.R[this.PIECE_NAME[pc]];
				var x = this.rankX(i - 51) * 57 + 2;
				var y = this.rankY(i - 51) * 57 + 2;
				game.ctx.drawImage(image,x,y,57,57);
			}
		}
	}
	//更新界面
	Board.prototype.update = function(){
		var image = game.R[this.PIECE_NAME[0] + "s"];
		
		//鼠标移动时
		if(this.mousemove >= 0){
			var x = this.rankX(this.mousemove - 51) * 57 + 2;
			var y = this.rankY(this.mousemove - 51) * 57 + 2;
			game.ctx.drawImage(image,x,y,57,57);
		}
		//鼠标点击时,有选中棋子，则将棋子标记
		if(this.sqSelected > 0){
			var x = this.rankX(this.sqSelected - 51) * 57 + 2;
			var y = this.rankY(this.sqSelected - 51) * 57 + 2;
			game.ctx.drawImage(image,x,y,57,57);
		}
		//执行走法
		if(this.mvLast > 0){
			var sqSrc = game.position.getSqSrc(this.mvLast);
			var sqDst = game.position.getSqDst(this.mvLast);
			var srcX = this.rankX(sqSrc - 51) * 57 + 2;
			var srcY = this.rankY(sqSrc - 51) * 57 + 2;
			game.ctx.drawImage(image,srcX,srcY,57,57);
			var dstX = this.rankX(sqDst - 51) * 57 + 2;
			var dstY = this.rankY(sqDst - 51) * 57 + 2;
			game.ctx.drawImage(image,dstX,dstY,57,57);

		}
	}

	//判断所选的棋子是否本方棋子,红子记为“8”，黑子记为“16”,@param sd 指当前走棋方
	Board.prototype.sideFlag = function(sd){
		return 8 + (sd << 3);
	}
	//判断所选的棋子是否本方棋子,红子记为“8”，黑子记为“16”,@param sd 指当前走棋方
	Board.prototype.oppSideFlag = function(sd){
		return 16 - (sd << 3);
	}
	
	//判断是否在真实棋盘
	Board.prototype.inBoard = function(sq){
		return this._IN_BOARD_[sq] != 0;
	}
	//根据一维数组，获取二维数组的行
	Board.prototype.rankX = function(sq){
		return (sq & 15);
	}
	//根据一维数组，获取二维数组的列
	Board.prototype.rankY = function(sq){
		return (sq >> 4);
	}
	//根据二维数组，获取一维数组的位置
	Board.prototype.coord_XY = function(x,y){
		return x + (y << 4);
	}
	//重新设置棋盘数组
	Board.prototype.clearBoard = function(){
		this.squares = [];
		for(var i=0;i<256;i++){
			this.squares.push(0);
		}
	}
	//设置棋盘的棋子
	Board.prototype.addPiece = function(sq,pc){
		this.squares[sq] = pc;
	}
	//走棋 mv:走法 computerMove 是否是电脑走棋
	Board.prototype.addMove = function(mv,computerMove){
		//判断走法是否合法
		if(!game.position.isLegalMove(mv)){
			return;
		}
		//尝试走一步
		if(!game.position.makeMove(mv,this.squares)){
			return;
		}
		//走这个步骤是成功的，就可以执行该走法
		this.postAddMove(mv,computerMove);
	}
	Board.prototype.postAddMove = function(mv,computerMove){
		//将最后一次的步骤设置成本次走法
		this.mvLast = mv;
		//清除本次已选择的棋子
		this.sqSelected = 0;
		//如果游戏结束
		if(game.position.isMate()){
			var result = computerMove ? "你输了" : "你赢了"
			alert(result);
		}
	}
	//电脑走棋
	Board.prototype.response = function(){
		//判断是否轮到电脑走棋
		if(this.sdPlayer != this.com){
			this.busy = false;
			return;
		}
		this.busy = true;
		game.thinking.style.display = "block";
		var self = this;
		setTimeout(function(){
			var result = game.search.searchMain(self.squares);
			if(result != 0){
				self.addMove(result,true);
			}
			self.flushBoard();
			game.thinking.style.display = "none";
			self.busy = false;
		},250);

	}
	//解析 FEN 串
	Board.prototype.fromFen = function(){
		this.clearBoard();
		var fen = this.fen;
		var index = 0;
		if(index == fen.length){
			return;
		}
		var c = fen.charAt(index);
		//第一行位置
		var row = 3;
		//第一列位置
		var col = 3;
		while(c != " "){
			//代表当前字符的行和列
			var rowX = row,colY = col;
			//换行
			if(c == "/"){
				row = row + 1;
				col = 3;
			} else if(c >= "1" && c <= "9"){//数字代表空格
				col += (c.charCodeAt(0) - ("0").charCodeAt(0));
			} else if(c >= "A" && c <= "Z"){//红棋
				this.addPiece(this.coord_XY(col,row),(this.char_to_piece(c) + 8));
				col ++;
			} else if(c >= "a" && c <= "z"){ // 黑棋
				//将小写字母转换为大写字母
				c = c.toLocaleUpperCase();
				this.addPiece(this.coord_XY(col,row),(this.char_to_piece(c) + 16));
				col++;
			}
			index ++;
			if(index >= fen.length){
				break;
			}
			c = fen.charAt(index);
		}
	}
	//各个棋子的代表字母
	Board.prototype.char_to_piece = function(c){
		switch(c){
			case "K":
				return this.PIECE_KING;
			case "A":
				return this.PIECE_ADVISOR;
			case "B":
				return this.PIECE_BISHOP;
			case "N":
				return this.PIECE_KNIGHT;
			case "R":
				return this.PIECE_ROOK;
			case "C":
				return this.PIECE_CANNON;
			case "P":
				return this.PIECE_PAWN;
			default:
				return -1;
		}
	}
})()