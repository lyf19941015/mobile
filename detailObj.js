var detailObj = Object.create(searchObj); //原型继承
//$.extend 进行对象与对象的合并
detailObj  = $.extend(detailObj, {
	name: '餐厅详情页',
	dom: $('#detail'),
	init:function() {
		this.bindEvent();
		
	},
	enter:function(){
		this.dom.show();
		
	},
	bindEvent: function(){
		var _this = this;
		$('.left-pane').on('click', 'li', function(event){
			//console.log('我被点击了'); 	
			$(this).addClass('food-active');
			$(this).siblings().removeClass('food-active');
			var selector = '[data-title="'+ this.innerHTML +'"]';
			var curelem = $(selector).get(0);
			rightScroll.scrollToElement(curelem, 500);
		})	
		$('.cover').on('click',function(){
			//console.log(_this.ishide)
			//console.log(1)
			$('.selected').css({
				'left':'100%',
				'transition': 'all .35s',
				'-webkit-transition': 'all .35s'
			});
			$('.cover').css({
				'opacity':'0',
				'filter':'alpha(opacity=0)',
				'z-index':'0',
				'transition': 'all .35s',
				'-webkit-transition': 'all .35s'
			});
			if(_this.ishide == false){
				_this.ishide = !_this.ishide;
			}
		})
		this.shop_car();
		this.temporary();//购物车中的加减按钮
		
		this.shop_car_click();	
	},
	loadInformation:function(hash) {
		//console.log(hash)
		this.id = hash.split('-')[1];
		this.lat = hash.split('-')[2];
		this.lng = hash.split('-')[3];
		this.loadHeaderInformation();
		
	},
	loadHeaderInformation:function() {
		var _this = this;
		$.ajax({
			url:'/shopping/restaurant/'+ this.id +'',
			data:{
				/*extras[]:activities
				extras[]:album
				extras[]:license
				extras[]:identification
				extras[]:statistics*/
				extras:['activities','album','license','identification','statistics'],
				latitude:this.lat,
				longitude:this.lng,
			},
			success:function(res) {
					//console.log(res)
					_this.beginsend = res.float_minimum_order_amount;//存储起送费
					if(_this.beginsend != 0) {
						$('.shop-car p').html('差'+ _this.beginsend +'元起送');
					}
					//console.log(_this.beginsend)
					//console.log(res.activities)
					if(!!res.activities[0]){
						var activities = res.activities[0].description || res.name;
					}else{
						var activities = res.name;
					}
					var notice = res.promotion_info || res.name;
					//console.log(notice)
					var str = '';
					var a = res.image_path.substring(0,1);
					var b = res.image_path.substring(1,3);
					var c = res.image_path.slice(3);
					var d = res.image_path.slice(32);
					//console.log(a+':'+b+':'+c+':'+d)
					var imgpath = a+ '/' + b + '/' + c + '.' + d + '?imageMogr/quality/80/format/webp/'
					str += 
						'<div class="about-shop">'+
							'<div class="shop-pic">'+
								'<div class="pic-wrap">'+
									'<img src="https://fuss10.elemecdn.com/'+ imgpath +'" alt="">'+
								'</div>'+
								
							'</div>'+
							'<div class="shop-name">'+
								'<p class="title">'+ res.name +'</p>'+
								'<p>商家配送 / 配送费￥<b class="sendsale">'+ res.float_delivery_fee +'</b></p>'+
								'<p>'+ activities +'</p>'+
							'</div>'+
						'</div>'+
						'<div class="shop-notice">'+
							'<span class="notice">公告:</span>'+ notice +''+
						'</div>';
					$('.detail-header').html(str);
					_this.loadResInformation();
				
			},
			error:function() {
				console.log('请求服务器失败');
			}
		})
	},
	//加载左边分类导航
	loadLeftPane:function(arr) {
		//console.log(arr)
		var str = "";
		for(var i = 0; i < arr.length; i++) {
			str += '<li>'+ arr[i].name +'</li>'
		}
		$('.navlist').html(str);
		$('.navlist').find('li').eq(0).addClass('food-active');
	},
	//加载右侧商品信息
	loadRightPane:function(arr) {
		var str = '<div class="food-wrapper">';
		for(var i =0; i < arr.length; i++) {
			str += 
					'<div class="food-item">'+
						'<h2 data-title="'+ arr[i].name +'">'+ arr[i].name +'<span class="subtitle">'+ arr[i].description +'</span></h2>'+
					   this.loadRightInfo(arr[i].foods,i) +
					'</div>';			
		}
		str += '</div>';
		$(".right-pane").html(str);
		this.allPrice();
		//初始化滚动条
		window.leftScroll = new IScroll('.left-pane', {
			scrollbars: true, //显示滚动条
			preventDefault: false, //不阻止点击事件
			bounce: true,//让其弹动
			interactiveScrollbars:true,
			fadeScrollbars:true
		});
		window.rightScroll = new IScroll('.right-pane', {
			scrollbars: true,
			preventDefault: false, //不阻止点击事件
			bounce: true,
			interactiveScrollbars:true,//可以拖动条
			fadeScrollbars:true,//淡入淡出滚动条
			probeType: 2//设置滚动条的灵敏度,监听滚动的事件
		})

		//存储每一分类的高度
		this.heightArr = [];
		var sum = 0;
		var _this = this;
		$('.food-item').each(function(index,ele) {
			//console.log($(ele).height())
			sum += $(ele).height();
			_this.heightArr.push(sum)
		}) 
		//console.log(this.heightArr)
		var leftItem = $('.navlist').find('li');
		//console.log(leftItem)
		rightScroll.on('scroll',function(event) {
			//console.log('正在滚动');
			//rightScroll.distY 本次滚动的具体
			//console.log('y-->', rightScroll.y)//距离顶部滚动的高度;
			for(var i = 0 ; i < _this.heightArr.length ; i++){
				if(Math.abs(rightScroll.y) <= _this.heightArr[i]){
					leftItem.removeClass('food-active');
					leftItem.eq(i).addClass('food-active');
					break;
				}
			}
		})
		//this.shop_car();
		
	},
	loadRightInfo:function(arr,id) {
		//console.log(arr)
		var id = String(id);
		var str = "";
		for(var i =0 ; i < arr.length ; i++) {
			//console.log(arr[i].specfoods[0].price)
			//console.log(arr[i].image_path)
			if(arr[i].image_path != null){
				var a = arr[i].image_path.substring(0,1);
				var b = arr[i].image_path.substring(1,3);
				var c = arr[i].image_path.slice(3);
				var d = arr[i].image_path.slice(32);
				//console.log(a+':'+b+':'+c+':'+d)
				var imgpath = a+ '/' + b + '/' + c + '.' + d;
			}
			if(!!imgpath){
				imgpath = imgpath;
			}else{
				imgpath = '';
			}
			str += 
				'<div class="food-info">'+
					'<span class="img-info">'+
						'<img src="//fuss10.elemecdn.com/'+ imgpath +'?imageMogr/thumbnail/140x140/format/webp/quality/85" alt="">'+
					'</span>'+
					'<div class="food-detail">'+
						'<h3 id="'+ (id+i) +'">'+ arr[i].name +'</h3>'+
						'<p class="describe">'+ arr[i].description +'</p>'+
						'<p class="sale">月售'+ arr[i].month_sales +'份  好评率'+ arr[i].satisfy_rate +'%</p>'+
						'<span class="price oprice"><i>每份￥</i><b>'+ arr[i].specfoods[0].price +'</b></span>'+
						'<span class="num-area">'+
							'<span class="minus">-</span><span class="num">0</span><span class="plus">+</span>'+
						'</span>'+
					'</div>'+
				'</div>'
		}
		return str;	
	},
	shop_car:function() {
		var _this = this;
		$('#detail').on('click','.plus',function() {
			//console.log($(this))
			var num = $(this).parent().find('.num').html();
			num++;
			$(this).parent().find('.num').html(num);
			//console.log(num)
			$('.shop-car>p').css({
				'opacity':1,
				'filter':'alpha(opacity=100)',
				'background':'#4cd964'
			});
			_this.allPrice();
		})
		$('#detail').on('click','.minus',function() {
			//console.log($(this))
			var num = $(this).parent().find('.num').html();
			num--;
			if(num < 0) {
				num = 0;
			}
			$(this).parent().find('.num').html(num);
			//console.log(num)
			_this.allPrice();
		})
		
	},

	//购物车中的加减按钮,
	temporary:function() {
		var _this = this;
		var num = 0;
		var clickname;
		$('#detail').on('click','.upplus',function() {
			//console.log(2)
			num = $(this).prev().html();
			sigprice = $(this).parent().prev().find('i').html() / num;
			num++;
			total = sigprice * num;
			total = total.toFixed(1);
			$(this).parent().prev().find('i').html(total);
			$(this).prev().html(num);
			clickname = $(this).closest('.sigwrap').find('.name')[0].dataset.id;
			//console.log(clickname)
			_this.repeatNum(clickname,num);
		})
		$('#detail').on('click','.downminus',function() {
			//console.log($(this))
			num = $(this).next().html();
			sigprice = $(this).parent().prev().find('i').html() / num;
			num--;
			if(num <= 0) {
				num = 0;
				$(this).parent().parent().remove();
			}
			total = sigprice * num;
			total = total.toFixed(1);
			$(this).parent().prev().find('i').html(total);
			$(this).next().html(num);
			//console.log($(this).closest('.sigwrap').find('.name'))
			clickname = $(this).closest('.sigwrap').find('.name')[0].dataset.id;
			//console.log(clickname)
			_this.repeatNum(clickname,num);
		})
	},
	repeatNum:function(name,num) {
		//console.log(1)
		for(var i = 0 ; i < $('.food-info').length ; i++) {
			if($('.food-info').eq(i).find('h3').attr('id') == name) {
				$('.food-info').eq(i).find('.num-area').children('.num').html(num);
			}
		}
		this.allPrice();
	},
	allPrice:function() {
		//console.log('执行')
		var allprice = 0;
		var diff_price = 0;
		//console.log(allprice)
		//console.log(this.beginsend)
		var sendPrice = $('.sendsale').html();
		$('.shop-car i b').html(sendPrice);
		//console.log($('.oprice').find('b'))
		for(var i = 0 ; i < $('.num-area .num').length ; i++) {
			var singleNum = $('.num-area .num').eq(i).html();
			var singlePrice = $('.oprice b').eq(i).html();
			allprice += singleNum * singlePrice;	
		}
		allprice = allprice.toFixed(1);
		//console.log(allprice)
		$('.shop-price').html(allprice);
		diff_price = this.beginsend - allprice;
		if(diff_price <= 0) {
			$('.shop-car p').html('去结算');
		}else {
			$('.shop-car p').html('差'+ diff_price +'元起送');
		}
		
		if(allprice == 0) {
			
			$('.shop-car p').css({
				'opacity': '.8',
				'filter': 'alpha(opacity=80)',
				'background': '#3d3d3f'
			});
			/*$('.selected').css('display','none');display会失去动画效果，不能使用display属性，*/
			$('.selected').css({
				'left':'100%',
				'transition': 'all .35s',
				'-webkit-transition': 'all .35s'
			});
		}
		
	},
	shop_car_click:function() {
		var _this = this;
		this.ishide = true;//判断selected是否该显示；
		$('.shop-car').on('click','s',function(){
			//console.log('执行')	
			var compare = $('.shop-price').html();
			if(compare != 0){
				//console.log(1)
				//console.log(_this.ishide)
				if(_this.ishide){
					$('.selected').css({
						'left':'0',
						'transition': 'all .35s',
						'-webkit-transition': 'all .35s'
					});
					$('#detail').find('.cover').css({
						'opacity':'.5',
						'filter':'alpha(opacity=50)',
						'z-index':'25',
						'transition': 'all .35s',
						'-webkit-transition': 'all .35s'
					});
					_this.ishide = !_this.ishide;
				}else{
					$('.selected').css({
						'left':'100%',
						'transition': 'all .35s',
						'-webkit-transition': 'all .35s'
					});
					$('#detail').find('.cover').css({
						'opacity':'0',
						'filter':'alpha(opacity=0)',
						'z-index':'0',
						'transition': 'all .35s',
						'-webkit-transition': 'all .35s'
					});
					_this.ishide = !_this.ishide;
				}
			}
			_this.selected();
		})
	},
	selected:function() {
		//console.log($('.food-info'));
		var  _this = this;
		var str = '';
		for(var i = 0 ; i < $('.food-info').length ; i++) {
			//console.log($('.food-info').eq(i).find('.num-area').children('.num').html());
			if($('.food-info').eq(i).find('.num-area').children('.num').html() != 0){
				var pri = $('.food-info').eq(i).find('.oprice').children('b').html() * Number($('.food-info').eq(i).find('.num-area').children('.num').html());
				pri = pri.toFixed(1);
				str += '<p class="sigwrap"><span class="name" data-id="'+ $('.food-info').eq(i).find('h3').attr('id') +'">'+ $('.food-info').eq(i).find('h3').html() +'</span><span class="price">共¥<i>'+ pri +'</i></span><span class="nums"><span class="downminus">-</span><span class="midnum">'+ $('.food-info').eq(i).find('.num-area').children('.num').html() +'</span><span class="upplus">+</span></span></p>'
			}
		}
		$('.selected>div').html(str);
		
	},
	loadResInformation:function() {
		var _this = this;
		$.ajax({
			url:'/shopping/v2/menu?restaurant_id='+ this.id +'',
			success:function(res) {
				//console.log(res);
				_this.loadLeftPane(res);//左侧导航
				_this.loadRightPane(res);//右侧内容
			},
			error:function() {
				console.log('请求服务器失败');
			}
		})
	}
})
