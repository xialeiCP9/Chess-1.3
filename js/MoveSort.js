/**
 * 对历史表进行排序
 */
(function(){
	var MoveSort = window.MoveSort =  function(historyTable,squares){
		this.historyTable = historyTable;
		this.mvs = [];//走法数组
		this.vls = []; //走法对应的分值数组
		this.index = 0;
		this.initRoot(squares);
	}
	//初始化根节点的历史表走法
	MoveSort.prototype.initRoot = function(squares){
		var mvsAll = gen(squares,game.board.sdPlayer);
		for(var i=0 ; i<mvsAll.length ; i++){
			var mv = mvsAll[i];
			if(!game.position.makeMove(mv,squares)){
				continue;
			}
			game.position.undoMakeMove(squares);
			this.mvs.push(mv);
			this.vls.push(this.historyTable[game.search.historyIndex(mv)]);
		}
		this.shellSort();
	}
	MoveSort.prototype.next = function(){
		while(this.index < this.mvs.length){
			var mv = this.mvs[this.index];
			this.index ++;
			return mv;
		}
		return 0;
	}
	// 剥壳排序法，这里用"1, 4, 13, 40 ..."的序列，这样要比"1, 2, 4, 8, ..."好
	var cnShellStep = [0, 1, 4, 13, 40, 121, 364, 1093];
	MoveSort.prototype.shellSort = function(){
		var len = this.mvs.length;

		var stepLevel = 1;
		var nStep = 0;
		while(cnShellStep[stepLevel] < len){
			stepLevel++;
		}
		stepLevel--;
		while(stepLevel > 0){
			nStep = cnShellStep[stepLevel];
			for(var i=nStep;i<len;i++){
				var mvBest = this.mvs[i];
				var vlBest = this.vls[i];
				j = i - nStep;
				while(j >= 0 && vlBest > this.vls[j]){
					this.mvs[j + nStep] = this.mvs[j];
					this.vls[j + nStep] = this.vls[j];
					j -= nStep;
				}
				this.mvs[j + nStep] = mvBest;
				this.vls[j + nStep] = vlBest;
			}
			stepLevel --;
		}
	}
})()
