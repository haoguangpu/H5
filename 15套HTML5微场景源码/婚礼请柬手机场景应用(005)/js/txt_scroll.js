/**
 * 适合于文本的滚动
 * date: 2014/2/12
 * author: zero
 */
;(function(window){
	var txtInit = function(id, options){
		var that = this;
		that.obj =  typeof(id)=='object'?id:window.document.getElementById(id);
		that.options = {
			maxHeight:      '200',								  //文案最大高度
			maxWidth:       '300',								  //文案最大宽度
			node:			'',									  //用于算高度的孩子节点
			
			expand:         false,								  //是否点击开了文案
			allowScroll:    false,								  //是否允许滚动
			childHeight:    0,                                    //需要滚动的dom高度
			scrollLength:   1000000,                              //滚动的长高度
			tX:             0,                                    //x轴平移量
			tY:             0,									  //y轴平移量
		};
		var k;
		for (k in options){
			that.options[k] = options[k];
		}
		if(that.options.node){
			that.options.node = that.options.node.split(',');
		}
		that._init();
		return that;
	};
	txtInit.prototype = {
		handleEvent: function(e){
			var that = this;
			switch (e.type){
				case 'click': that._start(e);break;
				case 'touchstart' : that._startScroll(e);break;
				case 'touchmove' : that._scroll(e);break;
				case 'touchend' : that._endScroll(e);break;
			}
		},
		_init: function(){
			var that = this;
			that.setBroseType();
			that._end();
			that._bind('click', that.obj , false);
			that._bind('touchstart', that.obj, false);
			that._bind('touchmove', that.obj, false);
			that._bind('touchend', that.obj, false);
			
			that.options.orgHeight = $(that.obj).height();      //未展开前的高度
			that.options.orgWidth = $(that.obj).width();		//未展开前的宽度
			
			var	size = that.options.node?that.options.node.length:0,
				j;
			for(j=0; j<size; j++){
				if($(that.obj).find(that.options.node[j]).size()>0){
					that.options.childHeight += $(that.obj).find(that.options.node[j]).height();
				}
			}
			that.options.childHeight = parseInt(that.options.childHeight)*(that.options.orgWidth/that.options.maxWidth)+60;
			if(parseInt(that.options.maxWidth) <= that.options.orgWidth ){
				that.options.childHeight -= 60;
			}
			return that;
		},
		_start: function(e){
			var that = this;
			if(that.options.expand){   								//关闭展开状态
				that.options.expand = false;
				$(that.obj).height(that.options.orgHeight); 
				$(that.obj).width(that.options.orgWidth); 
				that._reset();
			}else{	
				that.options.expand = true;
				
				if(parseInt(that.options.maxWidth) > that.options.orgWidth ){
					$(that.obj).width(that.options.maxWidth);     //展开设置宽度
				}
				if($(that.obj).children().eq(0).attr('id')!=='auto-transform'){
					$(that.obj).children().wrapAll('<div id="auto-transform"></div>');
				}
				var height = parseInt(that.options.maxHeight);
				//展开设置新高度
				(that.options.childHeight > height)?$(that.obj).height(height):$(that.obj).height(that.options.childHeight);
			}
			return that;
		},
		_startScroll: function(e){
			var that = this;
			if(that.options.childHeight==0 || !that.options.expand)return;
			that.options.pageY = window.event.touches[0].pageY;
			that.options.scrollLength = that.options.childHeight - that.options.maxHeight;
			if(that.options.scrollLength > 0){
				that.options.allowScroll = true;
			}else{
				that.options.allowScroll = false;
			}
			return that;
		},
		_scroll: function(e){
			e.stopPropagation();    //阻止默认事件
			e.preventDefault();
			var that = this;
			if(!that.options.allowScroll)return;
			var curPageY = window.event.touches[0].pageY;
			var tran = {};
			if(Math.abs(curPageY - that.options.pageY) > 5){
				tran = {y:curPageY - that.options.pageY};
				that.options.pageY = curPageY;
				that._transform(tran);
			}
			return that;
		},
		_endScroll: function(){
			var that = this;
			that.options.allowScroll = false;
			if(that.options.tY > 0){
				tran = {y:-Math.abs(0-that.options.tY)};
				that._transform(tran, 100,5,0);
			}else if(Math.abs(that.options.tY) > Math.abs(that.options.scrollLength)){
				tran = {y:Math.abs(that.options.scrollLength)-Math.abs(that.options.tY)};
				tran.y = Math.abs(tran.y);
				that._transform(tran, 100,5,0);
			}
			that.options.allowScroll = false;
			return that;
		},
		_end: function(e){
			var that = this;
			that._unbind('click', that.obj , false);
			that._unbind('touchstart', that.obj, false);
			that._unbind('touchmove', that.obj, false);
			that._unbind('touchend', that.obj, false);
			return that;
		},
		_reset: function(e){   //还原
			var that = this;
			that.options.expand = false;
			that.options.allowScroll = false;
			var tran = {y:-that.options.tY}
			that._transform(tran);
			$(that.obj).find('#auto-transform').children().unwrap();
			return that;
		},
		_transform: function(tran, time, speed ,n){   //tran 移动的距离，time 移动时间，speed 移动速度， n=0;
			var that = this;
			if(typeof(tran.x)=='undefined'){				
				tran.x = 0;
			}
			if(typeof(tran.y)=='undefined'){
				tran.y = 0;
			}			
			if(typeof(time)!='undefined' && typeof(speed)!='undefined' && time>0 && speed>0){
				n++;
				if(n >= parseInt(time/speed)){
					return;
				}
				that.options.tX += tran.x*(speed/time);
				that.options.tY += tran.y*(speed/time);
				that._pos();
				setTimeout(function(){that._transform(tran, time, speed ,n)},speed);
			}else{
				that.options.tX += tran.x;
				that.options.tY += tran.y;
				that._pos();
			}
		},
		_pos: function(){
			var that = this;
			var transform = that.options.kernel?'-'+that.options.kernel+'-transform':'transform',
				transformV = 'translate('+that.options.tX+'px,'+that.options.tY+'px) scale(1)';
			$(that.obj).find('#auto-transform')[0].style[transform] = transformV;
		},
		setBroseType: function(){  //判断浏览器内核
			var that = this;
			dummyStyle = that.obj.style;
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
	window.txtInit = txtInit;
})(window);