/**
 * http://www.yunlai.cn
 * @author alai
 * @email jpcomputer@163.com
 */
;(function($) {
    $.fn.yl3d = function(options) {
        // 默认参数
        $.fn.yl3d.defaults = {
            speed	: 'auto',       // 转动速度，越小越快。鼠标水平每移动多少像素，翻转一张图片。auto为自动检测
			stopEle	: null,			// 触摸移动上下是否触发
			startFn	: null,			// 获取touchstart绑定函数
			moveFn	: null,			// 获取touchmove绑定函数
			endFn	: null,			// 获取touchend绑定函数
			V_start : null,			// 给start函数赋值
			
			lazy	: true,			// 是否使用图片延时预加载默认图片   
        };
        
        /* 初始值继承 */
        var param = $.extend({},$.fn.yl3d.defaults, options);
    	
    	return this.each(function(){
    		var box  = $(this);
            var srcVal = box.find('input[type="hidden"]').val();
            var urls = srcVal.split(",");
			var imageNum = urls.length;
			var speed	= param.speed;
			var lazy = param.lazy;

    		var startPoint_x; // mousedown 或 touchstart 开始位置X轴点
    		var startPoint_y; // mousedown 或 touchstart 开始位置y轴点
    		var movePoint_x; // 当前有变换图片，move的位置X轴点
    		var movePoint_y; // 当前有变换图片，move的位置y轴点
			var position_3d = null; //判断方向
			var moveStart_3d = true; //移动开始
			
    		var currentImage = 1; // 当前显示图片，从0开始
    		
    		// auto速度方式，图片多则翻转速度快，达到最佳体验效果
    		if(speed == 'auto'){
    			if(imageNum >= 36){
    				speed = 10;
    			}else if(imageNum < 36 && imageNum >= 24){
    				speed = 14;
    			}else if(imageNum < 24){
    				speed = 18;
    			}
    		}

			// 绑定事件
			box.on('mousedown touchstart', function(e) {
                 if (e.type == "touchstart") {
                	 startPoint_x = window.event.touches[0].pageX;
                	 startPoint_y = window.event.touches[0].pageY;
                 } else {
                	 startPoint_x = e.pageX||e.x;
                	 startPoint_y = e.pageX||e.y;
                 }
                 movePoint_x = startPoint_x;
                 movePoint_y = startPoint_y;
				
				//取消其他触摸绑定事件 
				if(param.stopEle){
					param.stopEle.off('mousedown touchstart');
					param.stopEle.off('mousemove touchmove');
					param.stopEle.off('mouseup touchend mouseout');
				}

 			});

 			box.on('mousemove touchmove', function(e){
                e.preventDefault();
 				if (startPoint_x) {
					 //获取移动的x，y值
                     var pageX;
					 var pageY;
                     if (e.type == "touchmove") {
                         pageX = window.event.targetTouches[0].pageX;
                         pageY = window.event.targetTouches[0].pageY;
                     } else {
                         pageX = e.pageX||e.x;
                         pageY = e.pageY||e.y;
                     }
					 //判断是上下滑还是左右滑
					 if(moveStart_3d){
						 if(param.stopEle){
							//true为垂直,false为水平
 					 		Math.abs(pageY-movePoint_y)>=Math.abs(pageX-movePoint_x) ? position_3d = true : position_3d = false ; 
						 }else{
							position_3d = false; 
						 }
						moveStart_3d = false;
					 }else{
						position_3d = false; 	 
					 }
					 //移动处理
					 if(!position_3d){
						 if(Math.abs(movePoint_x - pageX) >= speed) {
							box.find('img').eq(currentImage-1).css("display","none"); 
							 if (movePoint_x - pageX > 0) {
								 currentImage++;
								 if (currentImage >= imageNum) {
									 currentImage = 1;
								 }
							 } else {
								 currentImage--;
								 if (currentImage < 0) {
									 currentImage = imageNum;
								 }
							 }
							 movePoint_x = pageX;
							box.find('img').eq(currentImage-1).css("display","inline"); 
						 }
					 }else{
						param.V_start(startPoint_y);
						param.stopEle.on('mousedown touchstart',param.startFn);
						param.stopEle.on('mousemove touchmove',param.moveFn);
						param.stopEle.on('mouseup touchend mouseout',param.endFn);
					 }
 				}	
			
			})
			
			box.on('mouseup touchend mouseout', function() {
				//初始化状态值
 				startPoint_x = null;
				startPoint_y = null;
				movePoint_y	= null;
				movePoint_x = null;
				//重置默认移动是开启状态
				moveStart_3d = true;
				position_3d = null;
				//重置其他触摸绑定事件
				if(param.stopEle){
					param.stopEle.on('mousedown touchstart',param.startFn);
					param.stopEle.on('mousemove touchmove',param.moveFn);
					param.stopEle.on('mouseup touchend mouseout',param.endFn);
				}
      		});

            // 加载图片
            function imginit(){
                for(var i=1; i<imageNum; i++){
                	if(lazy){
                        $('<img class="lazy-bk" />').attr({'data-bk':urls[i],'src':'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'}).appendTo(box);
                	}else{
                        $('<img class="lazy-bk" />').attr({'src':urls[i]}).appendTo(box);
                	}

                }
                box.find('img').hide();
                box.find('img').eq(0).show();
            }

            // 页面解析完后加载图片
            $(function(){
            	imginit();
            })

    	});
    };
    
})(jQuery);