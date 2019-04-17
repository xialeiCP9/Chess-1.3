/**
 * 获取所有可行的走法
 */
(function(){
	window.gen = function(squares,sd){
		var mvs = [];
		var pcSelfSide = game.board.sideFlag(sd);
		var pcOppside = game.board.oppSideFlag(sd);
		//遍历整个棋盘
		for(var sqSrc = 0 ; sqSrc < 256 ; sqSrc++){
			//不在真实棋盘上
			if(!game.board.inBoard(sqSrc)){
				continue;
			}
			//根据棋子查询可行的走法
			var pcSrc = squares[sqSrc];
			//如果棋子不是本方棋子
			if((pcSrc & pcSelfSide) == 0){
				continue;
			}
			switch(pcSrc - pcSelfSide){
				case game.board.PIECE_KING: // 将
					/*console.log("将");*/
					var delta;
					for(var i=0;i<4;i++){
						delta = game.position.KING_DELTA[i];
						//沿着方向前进
						var sqDst = sqSrc + delta;
						
						//如果棋子位置不在九宫格上
						if(!game.position.inFort(sqDst)){
							continue;
						}
						var pcDst = squares[sqDst];
						//如果棋子为空子或者为对方棋子
						if((pcDst & pcSelfSide) == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
						}
					}
					break;
				case game.board.PIECE_ADVISOR: //士
				/*console.log("士");*/
					var delta;
					for(var i=0;i<4;i++){
						delta = game.position.ADVISOR_DELTA[i];
						//沿着方向前进
						var sqDst = sqSrc + delta;
						var pcDst = squares[sqDst];
						//如果棋子位置不在九宫格上
						if(!game.position.inFort(sqDst)){
							continue;
						}
						//如果棋子为空子或者为对方棋子
						if((pcDst & pcSelfSide) == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
						}
					}
					break;
				case game.board.PIECE_BISHOP: //象
					/*console.log("象");*/
					var delta;
					for(var i=0;i<4;i++){
						delta = game.position.ADVISOR_DELTA[i];
						//得到可能的象眼位置
						var sqEye = sqSrc + delta;
						//如果象眼位置棋子不为空
						if(squares[sqEye] != 0){
							continue;
						}
						//得到可能的终点
						var sqDst = sqEye + delta;
						//如果终点不在真实棋盘
						if(!game.board.inBoard(sqDst)){
							continue;
						}
						//如果象跨河
						if(!game.position.sameHalf(sqSrc,sqDst)){
							continue;
						}
						var pcDst = squares[sqDst];
						//如果终点为对方棋子或者为空
						if((pcDst & pcSelfSide) == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
						}
					}
					break;
				case game.board.PIECE_KNIGHT: //马
					/*console.log("马");*/
					for(var i=0;i<4;i++){
						//马腿
						var leg = sqSrc + game.position.KING_DELTA[i];
						//马腿位置存在棋子
						if(squares[leg] != 0){
							continue;
						}
						//马腿位置没有棋子，马腿对应的两个方向
						for(var j=0;j<2;j++){
							var sqDst = sqSrc + game.position.KNIGHT_DELTA[i][j];
							if(!game.board.inBoard(sqDst)){
								continue;
							}
							var pcDst = squares[sqDst];
							if((pcDst & pcSelfSide) == 0){
								mvs.push(game.position.move(sqSrc,sqDst));
								/*console.log(game.position.move(sqSrc,sqDst));*/
							}
						}
					}
					break;
				case game.board.PIECE_ROOK: //车
					/*console.log("车");*/
					var delta;
					for(var i=0;i<4;i++){
						delta = game.position.KING_DELTA[i];
						//沿着该向量前进
						var sqDst = sqSrc + delta;
						while(game.board.inBoard(sqDst) && squares[sqDst] == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
							sqDst += delta;
						}
						//如果此时 终点仍在真实数组内，则此时的终点必定遇到了棋子
						if(game.board.inBoard(sqDst)){
							var pcDst = squares[sqDst];
							if((pcDst & pcOppside) != 0){
								mvs.push(game.position.move(sqSrc,sqDst));
								/*console.log(game.position.move(sqSrc,sqDst));*/
							}
						}
					}
					break;
				case game.board.PIECE_CANNON: //炮
					/*console.log("炮");*/
					var delta;
					for(var i=0;i<4;i++){
						delta = game.position.KING_DELTA[i];
						//沿着该向量前进
						var sqDst = sqSrc + delta;
						while(game.board.inBoard(sqDst) && squares[sqDst] == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
							sqDst += delta;
						}
						//如果此时 终点仍在真实数组内，则此时的终点必定遇到了棋子
						if(game.board.inBoard(sqDst)){
							sqDst += delta;
							//继续向前走，直到遇到棋子，或者不在真实棋盘内为止
							while(game.board.inBoard(sqDst) && squares[sqDst] == 0){
								sqDst += delta;
							}
							//此时终点如果还在范围内，且遇到的棋子为对方棋子
							if(game.board.inBoard(sqDst)){
								var pcDst = squares[sqDst];
								if((pcDst & pcOppside) != 0){
									mvs.push(game.position.move(sqSrc,sqDst));
									/*console.log(game.position.move(sqSrc,sqDst));*/
								}
							}
						}
					}
					break;
				case game.board.PIECE_PAWN:
					/*console.log("兵");*/
					//前进一步，获得对应的位置
					var sqDst = game.position.forwardOneStep(sqSrc,game.board.sdPlayer);
					if(game.board.inBoard(sqDst)){
						var pcDst = squares[sqDst];
						if((pcDst & pcSelfSide) == 0){
							mvs.push(game.position.move(sqSrc,sqDst));
							/*console.log(game.position.move(sqSrc,sqDst));*/
						}
					}
					//如果兵已过河
					if(game.position.awayRiver(sqSrc,game.board.sdPlayer)){
						for(var i=-1;i<2;i+=2){
							sqDst = sqSrc + i;
							if(game.board.inBoard(sqDst)){
								var pcDst = squares[sqDst];
								if((pcDst & pcSelfSide) == 0){
									mvs.push(game.position.move(sqSrc,sqDst));
									/*console.log(game.position.move(sqSrc,sqDst));*/
								}
							}
						}
					}
				break;
			}
		}
		return mvs;
	}
})()