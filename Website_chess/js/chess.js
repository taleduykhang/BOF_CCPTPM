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