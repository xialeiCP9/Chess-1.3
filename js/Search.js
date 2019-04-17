/**
 * 搜索函数
 * 生成电脑自动下子的走法
 */
(function(){
	var Search = window.Search = function(){
		this.MINMAXDEPTH = 4;
		this.MAXSEARCHDEPTH = 64; //最大搜索深度
		this.MATE_VALUE = 10000; //最高分值，即 将死的分数
		this.WIN_VALUE = this.MATE_VALUE - 200; //搜索分出胜负的分值界限，超出此值说明已经搜索出杀棋了
		this.DRAW_VALUE = 20; //和棋时返回的分数(取负值)
		this.millis = 100;
	}

	/**
	 * @param   squares 当前棋盘数组
	 * @param   millis  搜索最大时长
	 * @return {[type]}         [description]
	 */
	Search.prototype.searchMain = function(squares){
		//初始化历史表
		this.historyTable = []; //历史表记录每个走法对应的值
		for(var i=0;i<4096;i++){
			this.historyTable.push(0);
		}
		this.mvResult = 0;//搜索出的走法
		//初始alpha为负无穷，beta为正无穷
		var alpha = -this.MATE_VALUE;
		var beta = this.MATE_VALUE;
		game.position.step = 0; //每次搜索时，都重置搜索深度
		//迭代加深搜索
		var startTime = new Date().getTime(); //获取开始搜索时时间
		for(var i = 1; i <= this.MAXSEARCHDEPTH; i++){
			var vl = this.negaMaxSearch(squares,i,alpha,beta);//负极大值搜索
			if(new Date().getTime() - startTime > this.millis){//超出预定时间，则不再搜索
				break;
			}
			if(vl > this.WIN_VALUE || vl < -this.WIN_VALUE){ //已经分出胜负
				break;
			}
		}

		console.log("this.mvResult:",this.mvResult);
		return this.mvResult;
	}
	Search.prototype.negaMaxSearch = function(squares,depth,alpha,beta){
		if(depth == 0){
			return evaluate(squares,game.board.sdPlayer);
		}
		var moveSort = new MoveSort(this.historyTable,squares);

		var mvBest = 0; //最好的走法
		var vlBest = -this.MATE_VALUE;//该分数只是用来判断是否将军

		var mv = 0,vl = 0;
		//逐一尝试这些走法
		while((mv = moveSort.next()) > 0){

			if(!game.position.makeMove(mv,squares)){
				continue;
			}
			vl = -this.negaMaxSearch(squares,depth - 1,-beta,-alpha);
			//撤销走法
			game.position.undoMakeMove(squares);

			//此时获得的值大于被将军的值
			if(vl > vlBest){
				vlBest = vl;

				if(vl >= beta){ //被截断
					mvBest = mv; //历史表要保存被截断的走法
					break;
				}

				if(vl > alpha){ //找到一个PV走法
					alpha = vl;
					mvBest = mv;

					if(game.position.step == 0){ //回到根节点
						this.mvResult = mv;
					}
				}
			}
		}

		//搜索完毕所有走法,最佳的分数还是将军的分数，那么就选择最短达到将军的步骤
		if(vlBest == -this.MATE_VALUE){
			vlBest = game.position.step - this.MATE_VALUE;
		}
		//存在截断或者PV走法，优先将这种走法更新到历史表
		if(mvBest > 0){
			this.setBestMove(squares,mvBest,depth);
		}
		
		return vlBest;
	}
	//更新历史表,分数为棋子
	Search.prototype.setBestMove = function(squares,mv,depth){
		this.historyTable[this.historyIndex(squares,mv)] += depth * depth;
	}
	//获取历史表的索引
	Search.prototype.historyIndex = function(squares,mv){
		return ((squares[game.position.getSqSrc(mv)] - 8) << 8) + game.position.getSqDst(mv);
	}
})()