var Chess = function(container_id) {
	//construct options
	this.options = {
		size: 60,
		padding: 20,
		gap: 60,
		role_size: 25
	};
	//roles definition
	this.roles = {
		r1: { //车
			pos: {
				x: 0,
				y: 0
			},
			num: 2,
			name: '车'
		},
		r2: { //马
			pos: {
				x: 0,
				y: 1
			},
			num: 2,
			name: '马'
		},
		r3: { //相
			pos: {
				x: 0,
				y: 2
			},
			num: 2,
			name: '相'
		},
		r4: { //仕
			pos: {
				x: 0,
				y: 3
			},
			num: 2,
			name: '仕'
		},
		r5: { //帅
			pos: {
				x: 0,
				y: 4
			},
			num: 1,
			name: '帅'
		},
		r6: { //炮
			pos: {
				x: 2,
				y: 1
			},
			num: 2,
			name: '炮'
		},
		r7: { //卒
			pos: {
				x: 3,
				y: 0
			},
			num: 5,
			name: '卒'
		}
	};

	var roles = this.roles;
	var options = this.options;

	//Create the chess map 
	this.container_id = container_id;
	this.status = 1;
	this.occupy = [];
	var container = $(container_id);
	container.addClass('chess_container');
	container.css({
		width: (options.size + 1) * 8,
		height: (options.size + 1) * 8 + options.gap,
		padding: options.padding
	});

	var part1 = '<div id="part1"></div>';
	var gapbar = '<div id="gapbar"></div>';
	var part2 = '<div id="part2"></div>';
	container.append(part1).append(gapbar).append(part2);

	var box = '<div class="box"></div>';
	for (var i = 0; i < 32; i++) {
		$('#part1').append(box);
		$('#part2').append(box);
	};
	$('.box').css({
		width: options.size,
		height: options.size
	});
	$('#part1,#part2').css('height', (options.size + 1) * 4);
	$('#part1,#part2').css('width', (options.size + 1) * 8);
	$('#gapbar').css('height', options.gap);


	var x_start = options.padding - parseInt(options.role_size / 2);
	var y_start = options.padding - parseInt(options.role_size / 2);

	this.x_start = x_start;
	this.y_start = y_start;

	//create the mask
	for (var m = 0; m < 9; m++) {
		for (var n = 0; n < 10; n++) {
			var mask = '<div class="mask"></div>';
			container.append(mask);
			$('.mask').last().css({
				width: options.role_size,
				height: options.role_size,
				left: m * (options.size + 1) + y_start,
				top: n * (options.size + 1) + x_start
			});
			$('.mask').last().attr('x', n).attr('y', m);
		}
	}

	//create the roles of the game
	for (var e in roles) {
		var o = roles[e];
		var num = o.num;
		var name = o.name;
		for (var i = 0; i < num; i++) {
			//var p1_role = new Role('part1', e, o.pos);
			//var p2_role = new Role('part2', e, o.pos);
			//container.append(p1_role.elem).append(p2_role.elem);

			//var role = '<div class="role part1 '+ e +'"></div>'+'<div class="role part2 '+ e +'"></div>';
			
			this.createRole('part1', e, o.pos);
			this.createRole('part2', e, o.pos);

			$('.role').css({
				width: options.role_size,
				height: options.role_size
			});

			var x, y, t;
			x = o.pos.x;
			t = parseInt(i / 2);
			y = i % 2 == 0 ? o.pos.y + 2 * t : 8 - o.pos.y - 2 * t;
			var elem1 = container.find('.part1.' + e).eq(i);
			elem1.attr('type', e);
			elem1.text(name);
			this.setPos(elem1, x, y);
			x = 9 - x;
			var elem2 = container.find('.part2.' + e).eq(i);
			elem2.attr('type', e);
			elem2.text(name);
			this.setPos(elem2, x, y);
		};
	};

	var _this = this;
	//Add events
	//eat role
	$('.role').click(function() {
		var part = _this.getPart(this);
		var elem = $('.role.active');
		if (_this.status != part && elem.length == 0) {
			return;
		}
		var pos = _this.getPos(this);
		if ($(this).hasClass('active')) {
			//已选中则取消选择
			_this.disSelect(this);
		} else {
			//点击选中反色则吃子
			if (elem.length == 1 && _this.getPart(elem) != part && _this.checkPos(elem, this)) {
				_this.eatRole(this);
				_this.reSetPos(elem, pos.x, pos.y);
				_this.disSelect(elem);
				_this.changeStatus();
				return;
			}
			//未选中则选择
			if (elem.length == 0 || _this.getPart(elem) == part) {
				_this.select(this);
			};

		}
	});
	//move role 
	$('.mask').click(function() {
		var elem = $('.role.active');
		if (elem.length == 1 && _this.checkPos(elem , this)) {
			_this.reSetPos(elem, $(this).attr('x'), $(this).attr('y'));
			_this.disSelect(elem);
			_this.changeStatus();
		} else {
			return;
		}
	});

	$('.mask').mouseover(function() {
		var elem = $('.role.active');
		if (elem.length == 1 && _this.checkPos(elem , this)) {
			$(this).addClass('active');
		}
	});

	$('.mask').mouseout(function() {
		$(this).removeClass('active');
	});
};
Chess.prototype = {
	createRole: function(part, role, pos){
		var container = $(this.container_id);
		var elem = '<div class="role ' + part + ' ' + role + '" x="' + pos.x + '" y="' + pos.y + '" ></div>';
		container.append(elem);
	},
	select: function(elem) {
		$('.role').removeClass('active');
		$(elem).addClass('active');
	},
	disSelect: function(elem) {
		$(elem).removeClass('active');
	},
	setPos: function(elem, x, y) {//设置位置
		$(elem).attr('x', parseInt(x)).attr('y', parseInt(y));
		$(elem).css({
			left: parseInt(y) * (this.options.size + 1) + this.y_start,
			top: parseInt(x) * (this.options.size + 1) + this.x_start
		});
		var pos = 9 * parseInt(x) + parseInt(y);
		this.occupy.push(pos);
	},
	reSetPos: function(elem, x, y) {//重新设置位置
		this.delPos(elem);
		this.setPos(elem, x, y);
	},
	getPos: function(elem) {//获取位置
		var pos = {};
		pos.x = parseInt($(elem).attr('x'));
		pos.y = parseInt($(elem).attr('y'));
		return pos;
	},
	delPos: function(elem) {//删除位置
		var pre_x = $(elem).attr('x');
		var pre_y = $(elem).attr('y');
		var pre_pos = 9 * parseInt(pre_x) + parseInt(pre_y);
		this.occupy = _.without(this.occupy, pre_pos);
	},
	getPart: function(elem) {//获取属于哪一方的角色
		if (!$(elem).hasClass('role')) {
			return 0;
		}
		if ($(elem).hasClass('part1')) {
			return 1;
		} else {
			return 2;
		};
	},
	changeStatus: function() {//改变状态
		if (this.status == 1) {
			this.status = 2;
			$('#instruct p').addClass('vs');
			$('#instruct p').text('2');
		} else {
			this.status = 1;
			$('#instruct p').removeClass('vs');
			$('#instruct p').text('1');
		};
		this.checkWin();
		this.checkDanger();
	},
	eatRole: function(elem) {//吃子
		this.delPos(elem);
		$(elem).remove();
	},
	getType: function(elem) {
		if (!$(elem).hasClass('role')) {
			return 0;
		}
		var type = $(elem).attr('type');
		type = type.substr(-1);
		return type;
	},
	checkDanger:function(){ //一方走完后立刻检查另一方是否已被将军
		var king1 = $('.part1.r5');
		var king2 = $('.part2.r5');
		var _this = this ;
		var danger = false;
		var dangerKing = 0;
		if (this.status == 1) {         //part1 走之前先看看主帅有没有危险
			for (var i = 1; i <= 7; i++){
				 var role = $(".part2.r" + i);
				 
				 $.each(role,function(i,e){
				 	 //console.log($(e).attr("type"));
				 	 if(_this.checkPos($(e),king1)){
				 	 	danger = true;
				 	 	dangerKing = 1 ;
				 	 	return false;
				 	 }

				 });

			};
		}else if(this.status == 2){ 	//part2走之前先看看主帅有没有危险
			for (var i = 1; i <= 7; i++) {
				 var role = $(".part1.r" + i);
				
				 $.each(role,function(i,e){
				 	 //console.log($(e).attr("type"));
				 	 if(_this.checkPos($(e),king2)){
				 	 	danger = true;
				 	 	dangerKing = 2 ;
				 	 	return false;
				 	 }
				 });
			};	
		}
		if(danger){
			alert("king " + dangerKing + " is in danger!");
		}
	},
	checkPos: function(elem,mask) {//检查elem可否走到mask的位置
		//var elem = $('.role.active');
		var type = this.getType(elem);
		var part = this.getPart(elem);
		if (type == 1) { //车
			if (this.checkRolesBetween(elem , mask) == 0) {
				return true;
			};
		};
		if (type == 2) { //马
			if (this.getDistance(mask, elem) == Math.sqrt(5) && this.checkHorseMove(mask)) {
				return true;
			} else {
				return false;
			}
		};
		if (type == 3) { //相
			if (this.getDistance(mask, elem) == Math.sqrt(8) && this.restrictRiver(mask) && this.checkElphantMove(mask)) {
				return true;
			} else {
				return false;
			}
		};
		if (type == 4) { //仕
			if (this.getDistance(mask, elem) == Math.sqrt(2) && this.restrictKing(mask)) {
				return true;
			} else {
				return false;
			}
		};
		if (type == 5) { //帅
			if (this.getType(mask) == 5 && this.checkRolesBetween(mask,elem) == 0 ) {
				return true; 
			};

			if (this.getDistance(mask, elem) == 1 && this.restrictKing(mask)) {
				return true;
			} else {
				return false;
			}
		};
		if (type == 6) { //炮
			if ($(mask).hasClass('role') && this.checkRolesBetween(elem , mask) == 1) {
				return true; //吃子
			};
			if ($(mask).hasClass('mask') && this.checkRolesBetween(elem ,mask) == 0) {
				return true; //移动
			};
		};
		if (type == 7) { //卒
			if (this.getDistance(mask, elem) == 1 && this.checkDirect(mask)) {
				return true;
			};
			return false;
		};
	},
	checkRolesBetween:function(elem , mask){//  获取某位置mask与当前活跃棋子elem之间有多少棋子
		//var elem1 = $('.role.active') ;
		var elem1 = $(elem) ;
		var elem2 = $(mask);
		return this.checkBetweenRoles(elem1,elem2);
	},
	checkBetweenRoles: function(elem1,elem2) { //获取两个位置之间是否有棋子
		var elem1 = $(elem1);
		var elem2 = $(elem2);
		var pos1 = {
			x: parseInt(elem1.attr('x')),
			y: parseInt(elem1.attr('y'))
		}
		var pos2 = {
			x: parseInt(elem2.attr('x')),
			y: parseInt(elem2.attr('y'))
		};
		if (pos1.x != pos2.x && pos1.y != pos2.y) {
			return -1;
		};
		var min, max, num = 0;
		if (pos1.x == pos2.x) {
			min = _.min([pos1.y,pos2.y]);
			max = _.max([pos1.y,pos2.y]);
			if (max - min <= 1 ) {
				return 0;
			}
			for (var i = min + 1; i < max; i++) {
				var temp = {
					x: pos1.x,
					y: i
				};
				var pos = 9 * parseInt(temp.x) + parseInt(temp.y);
				if (_.contains(this.occupy, pos)) {
					num = num + 1;
				}
			}
			return num;
		};
		if (pos1.y == pos2.y) {
			min = _.min([pos1.x,pos2.x]);
			max = _.max([pos1.x,pos2.x]);
			if (max - min <= 1 ) {
				return 0;
			}
			for (var j = min + 1; j < max; j++) {
				var temp = {
					x: j,
					y: pos1.y
				};
				var pos = 9 * parseInt(temp.x) + parseInt(temp.y);
				if (_.contains(this.occupy, pos)) {
					num = num + 1;
				}
			};
			return num;
		};
	},
	getDistance: function(mask1, mask2) { //获取两个点的位置
		var elem1 = $(mask1);
		var elem2 = $(mask2);
		var pos1 = {
			x: parseInt(elem1.attr('x')),
			y: parseInt(elem1.attr('y'))
		}
		var pos2 = {
			x: parseInt(elem2.attr('x')),
			y: parseInt(elem2.attr('y'))
		};
		var sqr = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);
		var dis = Math.sqrt(sqr);
		return parseFloat(dis);
	},
	restrictKing: function(mask) { //限制只能在将帅区域内
		var elem = $(mask),
			x;
		var king = $('.role.active');
		if (this.getPart(king) == 1) {
			x = 1;
		} else {
			x = 8;
		}
		var pos1 = {
			x: parseInt(elem.attr('x')),
			y: parseInt(elem.attr('y'))
		}
		//king's position
		var pos2 = {
			x: x,
			y: 4
		};
		var sqr = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);
		if (sqr <= 2) {
			return true;
		} else {
			return false;
		}
	},
	restrictRiver: function(mask) { //检查是否过河
		var mask = $(mask);
		var elem = $('.role.active');
		var x = parseInt(mask.attr('x'));
		if (this.getPart(elem) == 1 && x <= 4) {
			return true;
		};
		if (this.getPart(elem) == 2 && x >= 5) {
			return true;
		};
		return false;
	},
	checkDirect: function(mask) { //检查卒的跳动方向
		var elem1 = $(mask);
		var elem2 = $('.role.active');
		var x1 = parseInt(elem1.attr('x'));
		var x2 = parseInt(elem2.attr('x'));
		var y1 = parseInt(elem1.attr('y'));
		var y2 = parseInt(elem2.attr('y'));
		if (this.restrictRiver(mask) && y1 == y2 && x1 > x2 && this.getPart(elem2) == 1) {
			return true; //未过河，只能前进
		}
		if (this.restrictRiver(mask) && y1 == y2 && x1 < x2 && this.getPart(elem2) == 2) {
			return true; //未过河，只能前进
		}
		if (!this.restrictRiver(mask) && x1 >= x2 && this.getPart(elem2) == 1) {
			return true; //过了河，不能后退
		}
		if (!this.restrictRiver(mask) && x1 <= x2 && this.getPart(elem2) == 2) {
			return true; //过了河，不能后退
		}
		return false;
	},
	checkHorseMove: function(mask) { //检查马可否跳动
		var elem1 = $(mask);
		var elem2 = $('.role.active');
		var x1 = parseInt(elem1.attr('x'));
		var x2 = parseInt(elem2.attr('x'));
		var y1 = parseInt(elem1.attr('y'));
		var y2 = parseInt(elem2.attr('y'));
		if (Math.abs(y1 - y2) == 1 && Math.abs(x1 - x2) == 2) {
			if (x1 < x2) { //向上跳
				var barror = 9 * (x2 - 1) + y2;
			} else { //向下跳
				var barror = 9 * (x2 + 1) + y2;
			}
		};
		if (Math.abs(y1 - y2) == 2 && Math.abs(x1 - x2) == 1) {
			if (y1 < y2) { //向左跳
				var barror = 9 * x2 + y2 - 1;
			} else { //向右跳
				var barror = 9 * x2 + y2 + 1;
			}
		};
		if (_.contains(this.occupy, barror)) {
			return false;
		} else {
			return true;
		};
	},
	checkElphantMove:function(mask) {//检查相可否跳动
		var elem1 = $(mask);
		var elem2 = $('.role.active');
		var x1 = parseInt(elem1.attr('x'));
		var x2 = parseInt(elem2.attr('x'));
		var y1 = parseInt(elem1.attr('y'));
		var y2 = parseInt(elem2.attr('y'));
		var barror;
		if (x1 < x2 && y1 < y2) { //向左上跳
			 barror = 9 * (x2 - 1) + y2 - 1;
		} 
		if (x1 < x2 && y1 > y2) { //向右上跳
			 barror = 9 * (x2 - 1) + y2 + 1;
		} 
		if (x1 > x2 && y1 < y2) { //向左下跳
			 barror = 9 * (x2 + 1) + y2 - 1;
		} 
		if (x1 > x2 && y1 > y2) { //向右下跳
			 barror = 9 * (x2 + 1) + y2 + 1;
		} 
		if (_.contains(this.occupy, barror)) {
			return false;
		} else {
			return true;
		};
	},
	checkWin: function() { //检查哪个玩家赢
		var king1 = $('.part1.r5');
		var king2 = $('.part2.r5');
		/*
		if (this.checkBetweenRoles(king1, king2) == 0) {
			alert('game over');
		};
		*/
		if (king1.length == 0) {
			alert(" 2 wins! ");
		};
		if (king2.length == 0) {
			alert(" 1 wins! ");
		};
	},
	reset: function() {
		var id = this.container_id;
		$(id).empty();
		delete this;
		return new Chess(id);
	},
	gameover: function() {
		alert('Game over!');
	}
};