/**
 * 轮播插件
 * auth zero
 * date 2014/03/03
 * new slidepic('divid', {urls:'img1,img2...'});
 */
;(function(window){
	var slidepic = function(id,options){
		var that = this;
		that.div = typeof(id)=='string'?document.getElementById(id):id;
		that.options = {
			urls		:		'',           //图片地址，中间用,号隔开（必填）	
			interval	:		3000,		  //自动平移时间间隔
			track		:		'left',		  //开始移动方向
			speed		:		10,			  //图片切换速度
			time		:		500,		  //图片切换时间
			lpos		:		0,			  //轮播图数量
			posInit		:		null,		  //坐标设置完成后，回调函数，只适用于使用默认坐标
			posSet		:		null,		  //坐标设置回调函数
			ulImg		:		null,		  //滚动层ul jquery对象
			ulBtn		:		null,		  //控制点	jquery对象
			
			//私有变量
			pos			:		1,			  //当前位置
			x			: 		0,			  //x轴平移位移
			firstx		:		0,			  //x轴初始位置
			move		:		true,		  //平移控制	
			direction	:		'',		 	  //方向控制
			touchmove	:		false,	      //允许滑动
			kernel		:		'',			  //浏览器内核
			width		:		$(that.div).width(),
			aotuTime	:		null,		  //平移时间控制变量
		};
		var k;
		for (k in options){
			that.options[k] = options[k];
		}
		that.options.urls = that.options.urls.split(',');
		if(that.options.lpos==0){
			that.options.lpos = that.options.urls.length;
		}
		that.setBroseType();
		that._initHtml();
		that._initCssAndEvent();
		if(that.options.lpos > 1){
			that._auto();
			that._watchAuto();
		}
		return that;
	};
	
	slidepic.prototype = {
		handleEvent: function(e){    				//事件入口
			var that = this;
			switch (e.type){
				case 'touchstart' : that._touchstart(e);break;
				case 'touchmove' : that._touchmove(e);break;
				case 'touchend' : that._touchend(e);break;
			}
		},
		_touchstart : function(e){
			var that = this;
			that.options.touchmove = true;
			that.options.firstx = window.event.touches[0].pageX;
			if(that.options.aotuTime){
				clearInterval(that.options.aotuTime);
				that.options.aotuTime = null;
			}
		},
		_touchmove : function(e){
			var that = this;
			if(!that.options.touchmove)return;
			that.options.touchmove = false;
			var pagex = window.event.touches[0].pageX;
			var x = pagex - that.options.firstx;
			if(Math.abs(x) > 15 ){
				e.preventDefault();
				if(x > 0){
					that.options.direction = 'right';
				}else{
					that.options.direction = 'left';
				}
			}else{
				that.options.direction = null;
				that.options.firstx = pagex;
			}
		},
		_touchend : function(e){
			var that = this;
			if(that.options.touchmove){   			//只是点击,
				that._wxScale(e);
				return;
			}
			that.options.touchmove = true;
			if(that.options.direction == 'right'){
				that._right();
			}else if(that.options.direction == 'left'){
				that._left();
			}
		},
		_wxScale : function(e){
			var that = this;
			var domain = window.document.domain,
				i,
				urls = [];
			for(i=0; i<that.options.lpos; i++){
				urls[i] = 'http://'+domain+that.options.urls[i];
			}
			var curUrl = 'http://'+$(e.currentTarget).find('img').attr('src');
			if(RegExp("MicroMessenger").test(navigator.userAgent) && typeof(that.options.urls)=='object'){  			//调用微信图片放大功能
		        WeixinJSBridge.invoke('imagePreview',{
		            'current':curUrl,
		            'urls':urls
		       	});
			}  
		},
		_right : function(){					//向右移
			var that = this;
			if(!that.options.move)return;
			that.options.move = false;
			that.options.pos--;
			var nk = -that.options.width*(that.options.pos);      
			var x = nk - that.options.x;
			if(that.options.pos == 0){
				that._transform(x, that.options.time, that.options.speed,0,function(obj){      //当移到最后一张时，把平移值还原
					obj.options.pos = obj.options.lpos;
					obj.options.x = -(obj.options.width*obj.options.lpos);
					that._setPos();
				});
			}else{
				that._transform(x,that.options.time, that.options.speed, 0);
				that._setPos();
			}
		},
		_left : function(){    					//向左移
			var that = this;
			if(!that.options.move)return;
			that.options.move = false;
			that.options.pos++;
			var nk = -that.options.width*(that.options.pos);
			var x = nk - that.options.x;
			if(that.options.pos-1 == that.options.lpos){     //当移到最后一张时，把平移值还原
				that._transform(x,that.options.time, that.options.speed,0,function(obj){
					obj.options.pos = 1;
					obj.options.x = -obj.options.width;
					that._setPos();
				});
			}else{
				that._transform(x,that.options.time ,that.options.speed, 0);
				that._setPos();
			}
		},
		_auto : function(){
			var that = this;
			that.options.aotuTime = setInterval(function(){
				if(that.options.track=='left'){
					that._left();
				}else{
					track._right();
				}
			},that.options.interval);
		},
		_watchAuto : function(){        //守护进程，自动重启移动
			var that = this;
			setInterval(function(){
				if(!that.options.aotuTime){
					that._auto();
				}
			},5000);
		},
		/**
		 * x 平移的x轴值 必传
		 * time 平移的总时间 选传
		 * speend  平移速度 选传
		 * n===0		  选传
		 * callback		  回调函数 选传	
		 */
		_transform: function(x, time, speed ,n, callback){
			var that = this;
			if(typeof(time)!='undefined' && typeof(speed)!='undefined' && time>0 && speed>0){
				n++;
				if(n > parseInt(time/speed)){
					if(typeof(callback)=='function'){
						callback.call(this,that);
					}
					that.options.move = true;
					return;
				}
				that.options.x += x*(speed/time);
				that._pos();
				setTimeout(function(){that._transform(x, time, speed ,n, callback)},speed);
			}else{
				that.options.x += x;
				that._pos();
				that.options.move = true;
			}
		},
		_pos: function(){
			var that = this;
			that.options.kernel?that.options.ulImg.css('-'+that.options.kernel+'-transform','translate('+that.options.x+'px, 0px)'):
								that.options.ulImg.css('transform','translate('+that.options.x+'px, 0px)');
		},
		_initHtml : function(){
			var that = this;
			var i,
				l = that.options.urls.length,
				li;
			if(!that.options.ulImg){
				that.options.ulImg = $('<ul></ul>');
				for(i=0; i<that.options.lpos; i++){
					li = $('<li><img src="'+that.options.urls[i]+'" style="width:100%;height:100%;"/></li>');
					that.options.ulImg.append(li);
				}
				$(that.div).append(that.options.ulImg);
			}
			
			if(!that.options.ulBtn && that.options.lpos > 1){
				that.options.ulBtn = $('<ul></ul>');    		//坐标
				that.options.ulBtn.css({
					'position': 'absolute',
					'bottom' : '16px',
					'right' : '20px',
					'margin' : '0',
					'padding' : '0',
					'list-style' : 'none',
				});
				for(i=0; i<that.options.lpos; i++){
					that.options.ulBtn.append('<li><a>'+i+'</a></li>');
				}
				that.options.ulBtn.find('li').css({
					'float' : 'left',
					'margin-left' : '6px',
					'padding' : '0',
				});
				that.options.ulBtn.find('li').find('a').css({
					'width' : '10px',
					'height' : '10px',
					'border-radius' : '30px',
					'box-shadow' : 'inset 0 0 3px rgab(0,0,0,0.3)',
					'background' : 'rgba(0,0,0,0.5)',
					'display' : 'block',
					'text-indent' : '-9999px'
				});
				$(that.div).css({'position' : 'relative','left' : '0','right' : '0',});
				$(that.div).append(that.options.ulBtn);
				if(typeof(that.options.posInit)=='function'){
					that.options.posInit.call(this,that);
				}
			}
		},
		_initCssAndEvent : function(){
			var that = this,
				l = 0;
			if(that.options.lpos > 1){
				var first = that.options.ulImg.find('li').eq(that.options.lpos - 1).clone(),
					last = that.options.ulImg.find('li').eq(0).clone();
				that.options.ulImg.find('li').eq(0).before(first);
				that.options.ulImg.append(last);
				
				that._bind('touchstart', that.options.ulImg[0], false);
				that._bind('touchmove', that.options.ulImg[0], false);
				that._bind('touchend', that.options.ulImg[0], false);	
				that._transform(-that.options.width);
				l = 2;
				that._setPos();
			}
			that.options.ulImg.wrap('<div style="width:'+that.options.width+'px;height:100%;overflow:hidden;"></div>');
			that.options.ulImg.css({
				'width' : that.options.width*(that.options.lpos+l)+'px',
				'height': '100%',
				'overflow' : 'hidden',
				'margin' : 0,
				'padding' : '0',
				'list-style' : 'none',
			});
			that.options.ulImg.find('li').css({
				'float' : 'left',
				'width' : that.options.width+'px',
				'height': '100%',
				'overflow' : 'hidden',
				'padding' : '0',
			});
		},
		_setPos: function(){
			var that = this;
			if(typeof(that.options.posSet)=='function'){
				that.options.posSet.call(this,that);
			}else{
				that.options.ulBtn.find('li').find('a').css('background', 'rgba(0,0,0,0.5)');
				that.options.ulBtn.find('li').eq(that.options.pos-1).find('a').css('background', 'rgba(0,0,0,0.9)');
			}

		},
		setBroseType: function(){  //判断浏览器内核
			var that = this;
			dummyStyle = document.body.style;
			var vendors = 't,webkitT,MozT,msT,OT'.split(','),
			t,
			i = 0,
			l = vendors.length;

			for ( ; i < l; i++ ) {
				t = vendors[i] + 'ransform';
				if ( t in dummyStyle ) {
					that.options.kernel = vendors[i].substr(0, vendors[i].length - 1);
					break;
				}
			}
		},
		
		_bind: function (type, el, bubble) {		
			el.addEventListener(type, this, !!bubble);
		},
		_unbind: function (type, el, bubble) {
			el.removeEventListener(type, this, !!bubble);
		},
	};
	window.slidepic = slidepic;
})(window);