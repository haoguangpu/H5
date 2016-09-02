/*
** 变量值
*/
	/* 
	** 页面切换的效果控制 
	*/
var Msize = $(".m-page").size(), 	//页面的数目
	page_n			= 1,			//初始页面位置
	initP			= null,			//初值控制值
	moveP			= null,			//每次获取到的值
	firstP			= null,			//第一次获取的值
	newM			= null,			//重新加载的浮层
	p_b				= null,			//方向控制值
	indexP			= null, 		//控制首页不能直接找转到最后一页
	move			= null,			//触摸能滑动页面
	start			= true, 		//控制动画开始
	startM			= null,			//开始移动
	position		= null,			//方向值
	DNmove			= false,		//其他操作不让页面切换
	mapS			= null,			//地图变量值
	canmove			= false,		//首页返回最后一页
	
	textNode		= [],			//文本对象
	textInt			= 1;			//文本对象顺序
	
	/*
	** 声音功能的控制
	*/
	audio_switch_btn= true,			//声音开关控制值
	audio_btn		= true,			//声音播放完毕
	audio_loop		= false,		//声音循环
	audioTime		= null,         //声音播放延时
	audioTimeT		= null,			//记录上次播放时间
	audio_interval	= null,			//声音循环控制器
	audio_start		= null,			//声音加载完毕
	audio_stop		= null,			//声音是否在停止
	mousedown		= null,			//PC鼠标控制鼠标按下获取值
	
	/*
	** 统计控制
	*/
	plugin_type		= {				//记录页面切换的数量
		'info_pic2':{num:0,id:0},
		'info_nomore':{num:0,id:0},
		'info_more':{num:0,id:0},
		'multi_contact':{num:0,id:0},
		'video':{num:0,id:0},
		'input':{num:0,id:0},
		'dpic':{num:0,id:0}
	};   


/* 
** 单页切换 各个元素fixed 控制body高度 
*/
	var v_h	= null;		//记录设备的高度
	
	function init_pageH(){
		var fn_h = function() {
			if(document.compatMode == "BackCompat")
				var Node = document.body;
			else
				var Node = document.documentElement;
			 return Math.max(Node.scrollHeight,Node.clientHeight);
		}
		var page_h = fn_h();
		var m_h = $(".m-page").height();
		page_h >= m_h ? v_h = page_h : v_h = m_h ;
		
		//设置各种模块页面的高度，扩展到整个屏幕高度
		$(".m-page").height(v_h); 	
		$(".p-index").height(v_h);
		
	};
	init_pageH();

	/* 大图文图片延迟加载 */
	var lazyNode = $('.lazy-bk');
	lazyNode.each(function(){
		var self = $(this);
		if(self.is('img')){
			self.attr('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC');
		}else{
			self.css({
				'background-image'	: 'url(/template/10/img/loading_large.gif)',
				'background-size'	: '120px 120px'

			})
		}
	})

	// 前三个页面的图片延迟加载
	setTimeout(function(){
		for(var i=0;i<3;i++){
			var node = $(".m-page").eq(i);
			if(node.length==0) break;
			if(node.find('.lazy-bk').length!=0){
				lazy_change(node);
			}else continue;
		}
	},200)
	
	// 加载当前后面第三个
	function lazy_bigP(){
		for(var i=3;i<=5;i++){
			var node = $(".m-page").eq(page_n+i-1);
			if(node.length==0) break;
			if(node.find('.lazy-bk').length!=0){
				lazy_change(node);
			}else continue;
		}
	}

	// 图片延迟替换函数
	function lazy_change(node){
			if(node.attr('data-yuyue')=='true'){
				$('.weixin-share').find('.lazy-bk').attr('src',$('.weixin-share').find('.lazy-bk').attr('data-bk'));
			}
			var lazy = node.find('.lazy-bk');
			lazy.each(function(){
				var self = $(this),
					srcImg = self.attr('data-bk');

				$('<img />')
					.on('load',function(){
						if(self.is('img')){
							self.attr('src',srcImg)
						}else{
							self.css({
								'background-image'	: 'url('+srcImg+')',
								'background-size'	: 'cover'
							})
						}

						// 判断下面页面进行加载
						for(var i =0;i<$(".m-page").size();i++){
							var page = $(".m-page").eq(i);
							if($(".m-page").find('.lazy-bk').length==0) continue
							else{
								lazy_change(page);
							}
						}
					})
					.attr("src",srcImg);

				self.removeClass('lazy-bk');
			})	
	}

/*
**模版切换页面的效果
*/
	//绑定事件
	function changeOpen(e){
		$(".m-page").on('mousedown touchstart',page_touchstart);
		$(".m-page").on('mousemove touchmove',page_touchmove);
		$(".m-page").on('mouseup touchend mouseout',page_touchend);
		
		$('.wct .tableWrap').on('mousedown touchstart',page_touchstart);
		$('.wct .tableWrap').on('mousemove touchmove',page_touchmove);
		$('.wct .tableWrap').on('mouseup touchend mouseout',page_touchend);
	};
	
	//取消绑定事件
	function changeClose(e){
		$(".m-page").off('mousedown touchstart');
		$(".m-page").off('mousemove touchmove');
		$(".m-page").off('mouseup touchend mouseout');
		
		$('.wct .tableWrap').off('mousedown touchstart');
		$('.wct .tableWrap').off('mousemove touchmove');
		$('.wct .tableWrap').off('mouseup touchend mouseout');
	};
	
	//开启事件绑定滑动
	changeOpen();
	
	//触摸（鼠标按下）开始函数
	function page_touchstart(e){
		if (e.type == "touchstart") {
			initP = window.event.touches[0].pageY;
		} else {
			initP = e.y || e.pageY;
			mousedown = true;
		}
		firstP = initP;	
	};
	
	//插件获取触摸的值
	function V_start(val){
		initP = val;
		mousedown = true;
		firstP = initP;		
	};
	
	//触摸移动（鼠标移动）开始函数
	function page_touchmove(e){
		e.preventDefault();
		e.stopPropagation();	

		//判断是否开始或者在移动中获取值
		if(start||startM){
			startM = true;
			if (e.type == "touchmove") {
				moveP = window.event.touches[0].pageY;
			} else { 
				if(mousedown) moveP = e.y || e.pageY;
			}
			page_n == 1 ? indexP = false : indexP = true ;	//true 为不是第一页 false为第一页
		}
		
		//设置一个页面开始移动
		if(moveP&&startM){
			
			//判断方向并让一个页面出现开始移动
			if(!p_b){
				p_b = true;
				position = moveP - initP > 0 ? true : false;	//true 为向下滑动 false 为向上滑动
				if(position){
				//向下移动
					if(indexP){								
						newM = page_n - 1 ;
						$(".m-page").eq(newM-1).addClass("active").css("top",-v_h);
						move = true ;
					}else{
						if(canmove){
							move = true;
							newM = Msize;
							$(".m-page").eq(newM-1).addClass("active").css("top",-v_h);
						}
						else move = false;
					}
							
				}else{
				//向上移动
					if(page_n != Msize){
						if(!indexP) $('.audio_txt').addClass('close');
						newM = page_n + 1 ;
					}else{
						newM = 1 ;
					}
					$(".m-page").eq(newM-1).addClass("active").css("top",v_h);
					move = true ;
				} 
			}
			
			//根据移动设置页面的值
			if(!DNmove){
				//滑动带动页面滑动
				if(move){	
					//开启声音
					if($("#car_audio").length>0&&audio_switch_btn&&Math.abs(moveP - firstP)>100){
						$("#car_audio")[0].play();
						audio_loop = true;
					}
				
					//移动中设置页面的值（top）
					start = false;
					var topV = parseInt($(".m-page").eq(newM-1).css("top"));
					$(".m-page").eq(newM-1).css({'top':topV+moveP-initP});	
					initP = moveP;
				}else{
					moveP = null;	
				}
			}else{
				console.log('2')
				moveP = null;	
			}
		}
	};

	//触摸结束（鼠标起来或者离开元素）开始函数
	function page_touchend(e){	
			
		//结束控制页面
		startM =null;
		p_b = false;
		
		//关闭声音
		 audio_close();
		
		//判断移动的方向
		var move_p;	
		position ? move_p = moveP - firstP > 100 : move_p = firstP - moveP > 100 ;
		if(move){
			//切画页面(移动成功)
			if( move_p && Math.abs(moveP) >5 ){	
				$(".m-page").eq(newM-1).animate({'top':0},300,"easeOutSine",function(){
					/*
					** 切换成功回调的函数
					*/
					success();
				})
			//返回页面(移动失败)
			}else if (Math.abs(moveP) >=5){	//页面退回去
				position ? $(".m-page").eq(newM-1).animate({'top':-v_h},100,"easeOutSine") : $(".m-page").eq(newM-1).animate({'top':v_h},100,"easeOutSine");
				$(".m-page").eq(newM-1).removeClass("active");
				start = true;
			}
		}
		/* 初始化值 */
		initP		= null,			//初值控制值
		moveP		= null,			//每次获取到的值
		firstP		= null,			//第一次获取的值
		mousedown	= null;			//取消鼠标按下的控制值
	};
/*
** 切换成功的函数
*/
	function success(){
		/*
		** 切换成功回调的函数
		*/							
		//设置页面的出现
		$(".m-page").eq(page_n-1).removeClass("show active").addClass("hide");
		$(".m-page").eq(newM-1).removeClass("active hide").addClass("show");
		
		// 滑动成功加载多面的图片
		lazy_bigP();
		
		//重新设置页面移动的控制值
		page_n = newM;
		start = true;
		
		//判断是不是最后一页，出现提示文字
		if(page_n == Msize) {
			if($('.popup-txt').attr('data-show')!='show'){
				$('.popup-txt').attr('data-show','show');
				$('.popup-txt').addClass('txtHide');
			}
			canmove = true;

			$('.u-arrow').hide();
		}else{
			$('.popup-txt').removeClass('txtHide');	

			$('.u-arrow').show();
		}
		
		//地图重置
		if($(".m-page").eq(page_n-1).find(".ylMap").length>0&&!mapS){
			if(!mapS) mapS = new ylmap.init;
		}
		
		//txt富文本自适应伸缩
		if($(".m-page").eq(page_n-1).find('.m-txt').length>0) txtExtand();
	
		//页面切换视频播放停止
		if($('.m-video').find("video")[0]!=undefined){
			$('.m-video').find("video")[0].pause();
			$('.video-warp').show();
		};
		
		//文本缩回
		$(".m-txt").removeClass("open");	
		$('.m-txt').each(function(){
			if($(this).attr('data-self')!=''){
				$(this).css('height',$(this).attr('data-self'));
			}
		})
	}

/*
** 声音功能
*/
	//关闭声音
	function audio_close(){
		if(audio_btn&&audio_loop){
			audio_btn =false;
			audioTime = Number($("#car_audio")[0].duration-$("#car_audio")[0].currentTime)*1000;	
			if(audioTime<0){ audioTime=0; }
			if(audio_start){
				if(isNaN(audioTime)){
					audioTime = audioTimeT;
				}else{
					audioTime > audioTimeT ? audioTime = audioTime: audioTime = audioTimeT;
				}
			};
			if(!isNaN(audioTime)&&audioTime!=0){
				audio_btn =false;		
				setTimeout(
					function(){	
						$("#car_audio")[0].pause();
						$("#car_audio")[0].currentTime = 0;
						audio_btn = true;
						audio_start = true;	
						if(!isNaN(audioTime)&&audioTime>audioTimeT) audioTimeT = audioTime;
					},audioTime);
			}else{
				audio_interval = setInterval(function(){
					if(!isNaN($("#car_audio")[0].duration)){
						if($("#car_audio")[0].currentTime !=0 && $("#car_audio")[0].duration!=0 && $("#car_audio")[0].duration==$("#car_audio")[0].currentTime){
							$("#car_audio")[0].currentTime = 0;	
							$("#car_audio")[0].pause();
							clearInterval(audio_interval);
							audio_btn = true;
							audio_start = true;
							if(!isNaN(audioTime)&&audioTime>audioTimeT) audioTimeT = audioTime;
						}
					}
				},20)	
			}
		}
	}
	
	//页面声音播放
	$(function(){
		//获取声音元件
		var btn_au = $(".fn-audio").find(".btn");
		
		//绑定点击事件
		btn_au.on('click',audio_switch);
		function audio_switch(){
			if($("#car_audio")==undefined){
				return;
			}
			if(audio_switch_btn){
				//关闭声音
				$("#car_audio")[0].pause();
				audio_switch_btn = false;
				$("#car_audio")[0].currentTime = 0;
				btn_au.find("span").eq(0).css("display","none");
				btn_au.find("span").eq(1).css("display","inline-block");
			}
			//开启声音
			else{
				audio_switch_btn = true;
				btn_au.find("span").eq(1).css("display","none");
				btn_au.find("span").eq(0).css("display","inline-block");
			}
		}
		
	});

/*
**文本展开效果
*/
	//判断富文本是否展开
	function txtExtand(){
		// 可否展开
		$(".m-page").eq(page_n-1).find('.m-txt').not('.txt-noclick').each(function(){
			var txt = $(this).attr('data-txt'),
				txtnum;
			if(!txt){
				$(this).attr('data-txt',textInt);
				txtnum = textInt;
				textInt++;
			}else{
				txtnum = txt;
			}
			if(txtnum in textNode){
			}else{
				var maxHeight = '500';
				if($(".m-page").eq(page_n-1).find('.m-txt02').size()>0){
					maxHeight = '300';
				}
				textNode[txtnum] = 	new txtInit(this,{maxHeight:maxHeight,maxWidth:'500',node:'p,h2'});
			}
		});
	};
	//txt富文本自适应伸缩
	if($(".m-page").eq(page_n-1).find('.m-txt').length>0) txtExtand();

/*
**设备旋转提示
*/
	$(function(){
		var bd = $(document.body);
		window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', _orientationchange, false);
		function _orientationchange() {
			scrollTo(0, 1);
			switch(window.orientation){
				case 0:		//横屏
					bd.addClass("landscape").removeClass("portrait");
					init_pageH();					
					break;
				case 180:	//横屏
					bd.addClass("landscape").removeClass("portrait");	
					init_pageH();
					break;

				case -90: 	//竖屏

					init_pageH();
					//bd.addClass("portrait").removeClass("landscape");
					if($(".m-video video")[0]!=undefined && $(".m-video video")[0].paused){
							 alert("请竖屏查看页面，效果更佳");
					}else{
							alert("请竖屏查看页面，效果更佳");
					}

					break;
				case 90: 	//竖屏
					init_pageH();
					bd.addClass("portrait").removeClass("landscape");
					if($(".m-video video")[0].paused)
					alert("请竖屏查看页面，效果更佳");
					break;
			}
		}
		$(window).on('load',_orientationchange);
	});

/*
**  插件的加载
*/
	$(function(){
		/*
		**展示品旋转
		*/
		$(".imgbox").yl3d({
			stopEle	: $(".m-page"),
			startFn : page_touchstart,
			moveFn	: page_touchmove,
			endFn	: page_touchend,
			V_start : V_start
		});
		
		//轮播图初始化
		$('.imgSlider').each(function(){
			var urls = $(this).find('input').val();
			new slidepic(this,{urls:urls});
		});
		
		/*
		**日期插件添加
		*/
		var opts_data ={
			monthsFull: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
			monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			weekdaysFull: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
			weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			format: 'yyyy-mmmm-d',
			min: new Date()
		};
		$(".picker_data").pickadate(opts_data);
		$(".picker_time").pickatime();
	});

/*
** 页面内容加载loading显示
*/
	//显示
	function loadingPageShow(){
		$('.pageLoading').show();	
	}
	//隐藏
	function loadingPageHide(){
		$('.pageLoading').hide();	
	}

/*
** 页面加载初始化
*/
	var input_focus = false;
	function initPage(){
		//初始化一个页面
		$(".m-page").addClass("hide").eq(page_n-1).addClass("show").removeClass("hide");
		
		//初始化地图
		if($(".m-page").eq(page_n-1).find(".ylMap").length>0&&!mapS){
			mapS = new ylmap.init;
		}
		
		//PC端图片点击不产生拖拽
		$(document.body).find("img").on("mousedown",function(e){
			e.preventDefault();
		})	
		
		//按钮点击的变化
		$('.btn-boder-color').click(function(){
			if(!$(this).hasClass("open"))	$(this).addClass('open');
			setTimeout(function(){
				$('.btn-boder-color').removeClass('open');	
			},600)
			
		})
		
		// //表单聚焦时，取消切换效果
		// $('.wct_form').find('input').on('focus',function(){
		// 	changeClose();	
		// })
		
		// //表单失去聚焦时，开启切换效果
		// $('.wct_form').find('input').on('blur',function(){
		// 	changeOpen();	
		// })

		/**
	 	 *  表单的操作
	 	 */
		$('.wct_form input').on('focus',function(){
			if($(this).attr('type')!='submit'){
				changeClose();
			}
			setTimeout(function(){input_focus = true;},500)
		})
			
		$('.wct_form input').on('blur',inputBlur);
		function inputBlur(){
			changeOpen();	
			input_focus = false;
		}
		
		
		//视频点击播放
		$('.video-warp').on('click',function(){
			$('.m-video').find("video")[0].play();	
			$(this).hide();
			$("#car_audio")[0].pause();
		})
		
		//视频控制事件
		var video = $('.m-video').find("video");
		video.on('play',function(){
			$('.video-warp').hide();
			$("#car_audio")[0].pause();
		})
		video.on('pause',function(){
			$('.video-warp').show();	
		})
		video.on('ended',function(){
			$('.video-warp').show();
		})

		//调试图片的尺寸
		if(RegExp("iPhone").test(navigator.userAgent)||RegExp("iPod").test(navigator.userAgent)||RegExp("iPad").test(navigator.userAgent)) $('.m-page').css('height','101%');
	}(initPage());


/*******************************************************************************************************************************************************/
//数据统计
setTimeout(ajax_analysite,100);			//发送站点统计请求
setInterval(ajax_analyseplugin,15000);	//发送页面请求

/**
 * 存储页面统计的数据
 * @param object dom  需要统计的页面jquery dom对象
 */
function set_static_data(dom){
	var id = dom.attr('data-id');
	var type = dom.attr('data-type');
	if('info_pic2'==type){
		plugin_type.info_pic2.num++;
		plugin_type.info_pic2.id = id;
	}else if('info_nomore'==type){
		plugin_type.info_nomore.num++;
		plugin_type.info_nomore.id = id;
	}else if('info_more'==type){
		plugin_type.info_more.num++;
		plugin_type.info_more.id = id;
	}else if('multi_contact'==type){
		plugin_type.multi_contact.num++;
		plugin_type.multi_contact.id = id;
	}else if('video'==type){
		plugin_type.video.num++;
		plugin_type.video.id = id;
	}else if('input'==type){
		plugin_type.input.num++;
		plugin_type.input.id = id;
	}else if('3dpic'==type){
		plugin_type.dpic.num++;
		plugin_type.dpic.id = id;
	}
}

/**
 * 发送页面统计的数据
 */
function ajax_analyseplugin(){
	var activeId = $('#activeId').val();
	var ajax_ = function(type,id,num){
		$.ajax({
			url: '/analyseplugin/plugin/'+activeId,
			cache: false,
			dataType: 'html',
			async: true,
			type:'GET',
			data: "&plugtype="+type+"&id="+id+"&num="+num+"&activity_id="+activeId,
		});
	}
	if(plugin_type.dpic.id!=0 && plugin_type.dpic.num>0){
		ajax_('3dpic',plugin_type.dpic.id,plugin_type.dpic.num);
		plugin_type.dpic.num = 0;
	}
	if(plugin_type.info_more.id!=0 && plugin_type.info_more.num>0){
		ajax_('info_more',plugin_type.info_more.id,plugin_type.info_more.num);
		plugin_type.info_more.num = 0;
	}
	if(plugin_type.info_nomore.id!=0 && plugin_type.info_nomore.num>0){
		ajax_('info_nomore',plugin_type.info_nomore.id,plugin_type.info_nomore.num);
		plugin_type.info_nomore.num = 0;
	}	
	if(plugin_type.info_pic2.id!=0 && plugin_type.info_pic2.num>0){
		ajax_('info_pic2',plugin_type.info_pic2.id,plugin_type.info_pic2.num);
		plugin_type.info_pic2.num = 0;
	}
	if(plugin_type.input.id!=0 && plugin_type.input.num>0){
		ajax_('input',plugin_type.input.id,plugin_type.input.num);
		plugin_type.input.num = 0;
	}	
	if(plugin_type.multi_contact.id!=0 && plugin_type.multi_contact.num>0){
		ajax_('multi_contact',plugin_type.multi_contact.id,plugin_type.multi_contact.num);
		plugin_type.multi_contact.num = 0;
	}	
	if(plugin_type.video.id!=0 && plugin_type.video.num>0){
		ajax_('video',plugin_type.video.id,plugin_type.video.num);
		plugin_type.video.num = 0;
	}
}

/**
 * 发送站点统计请求
 */
function ajax_analysite(){
	var channel_id = location.search.substr(location.search.indexOf("channel=") + 8);
	channel_id= channel_id.match(/^\d+/) ; 
	if (!channel_id || isNaN(channel_id) || channel_id<0) {
		channel_id = 1;
	}
	var activeId = $('#activeId').val();
	$.ajax({
		url: '/site/analyse/'+activeId,
		cache: false,
		dataType: 'html',
		async: false,
		type:'GET',
		data: '&channel='+channel_id+'&type=car',
	});	
}

/**
 * 绑定页面分享、电话统计
 */
$(function(){
	$('.share').bind('click',function(){
		one_ajax_analyplugin('share');
		$(".m-page").off('mousedown touchstart');
		$(".m-page").off('mousemove touchmove');
		$(".m-page").off('mouseup touchend mouseout');
		
		var u = navigator.userAgent; // 客户端环境信息
		if(u.indexOf('MicroMessenger')>-1){
			$('.weixin-share').css('display','block');
			//禁止滚动
			$(document.body).css('overflow','hidden');
			$(document.body).on('touchmove',function(e){e.preventDefault();});
		}else{
			$(this).next().addClass('open');
			$(this).next().css('z-index',1);
			$(this).next().children().addClass('open');
		}
	});
	
	$('.tel').bind('click',function(){ one_ajax_analyplugin('multi_contact');});
	var one_ajax_analyplugin = function(type){
		var activeId = $('#activeId').val();
		var id = $(this).parents('section').attr('data-id');
		$.ajax({
			url: '/analyseplugin/plugin/'+activeId,
			cache: false,
			dataType: 'html',
			async: true,
			type:'GET',
			data: '&activity_id='+activeId+'&id='+id+'&plugtype='+type,
		});
	}	
});

/**
 * 关闭微信分享
 */
function cancle_share_weixin(obj){
	$(obj).css('display','none');
	//还原滚动条
	$(document.body).css('overflow','auto');
	$(document.body).off('touchmove');

	$(".m-page").on('mousedown touchstart',page_touchstart);
	$(".m-page").on('mousemove touchmove',page_touchmove);
	$(".m-page").on('mouseup touchend mouseout',page_touchend);
}

/**
 * 取消分享
 */
function cancle_share(obj){
	$(".m-page").on('mousedown touchstart',page_touchstart);
	$(".m-page").on('mousemove touchmove',page_touchmove);
	$(".m-page").on('mouseup touchend mouseout',page_touchend);

	$(obj.parentNode).removeClass('open');
	setTimeout(function(){
		$(obj.parentNode.parentNode).removeClass('open');
		$(obj.parentNode.parentNode).css('z-index','-1');
	},'400');
}

/*
**预约表单
*/
$(function(){
	$("p.submit-input").click(function(e){
		e.preventDefault();
		var form = $(this).parents('form');
		var sumbit_val = form_verity(form);
		if(sumbit_val){
			ajax_form_submit(form);
		}else{
			$(".popup_sucess").removeClass("on");
			$(".popup_error").addClass("on");
			setTimeout(function(){
				$(".popup").removeClass("on");
			},3000)
		}
	})
});

/**
 * 表单验证是否通过
 * object form jquery表单对象
 */
function form_verity(form){	
	if(form.find("input[name='sex']").length>0 && form.find("input[name='sex']").val()==''){
		$('.popup_error').html('想想，该怎么称呼您呢？');
		return false;	
	}
	
	var name = form.find("input[name='name']").val();
	if(form.find("input[name='name']").length>0 && $.trim(name)==''){
		$('.popup_error').html('不能落下姓名哦！');
		return false;
	}
	if(!name.match(/^[\u4e00-\u9fa5|a-z|A-Z|\s]{1,20}$/)){
		$('.popup_error').html('这名字太怪了！');
		return false;		
	}
	var tel = form.find("input[name='tel']").val();
	if(form.find("input[name='tel']").length>0 && $.trim(tel)==''){
		$('.popup_error').html('有个联系方式，就更好了！');
		return false;
	}
	if(!tel.match(/^1[0-9][0-9]\d{8}$/)){
		$('.popup_error').html('这号码,可打不通...');
		return false;
	}
	var date = form.find("input[name='date']").val();
	var time = form.find("input[name='time']").val();
	if(form.find("input[name='date']").length>0 && ($.trim(date)=='' || $.trim(time)=='')){
		$('.popup_error').html('您能给个具体时间，就完美了！');
		return false;		
	}
	return true;
}

/**
 * ajax异步提交表单数据
 * object form 表单jquery对象
 */
function ajax_form_submit(form){
	var name = form.find("input[name='name']").val();
	var tel = form.find("input[name='tel']").val();
	var date = form.find("input[name='date']").val();
	var time = form.find("input[name='time']").val();
	var sex = form.find("input[name='sex']").val();
	var activeId = $('#activeId').val();
	
	loading('loading');
	
	$.ajax({
		url: '/car/submit/'+activeId,
		cache: false,
		dataType: 'html',
		async: false,
		type:'POST',
		data: '&name='+name+'&tel='+tel+'&date='+date+'&time='+time+'&sex='+sex,
		success: function(msg){
			loading('end');
		
			if(msg==1){
				$('.popup_sucess').html('您已经成功预约过了!');
			}else if(msg==2){
				$('.popup_sucess').html('提交成功！谢谢您的预约！');
				var url = window.location.href;
				var site_id = url.substring(url.indexOf('car/index')+10,url.indexOf('?'));
				if(site_id == '768'){
					setTimeout(function(){
						window.location.href='http://www.jaguar.com.cn';
					},500);
				}
			}else{
				$('.popup_sucess').html('抱歉！系统繁忙中...');
			}
			$(".popup_sucess").addClass("on");
			$(".popup_error").removeClass("on");
			setTimeout(function(){
				$(".popup").removeClass("on");
			},4000)
		}
	});
}

/**
 * ajax异步提交表单数据
 * object form 表单jquery对象
 */
function ajax_custom_submit(form){
	var success_msg = $.trim($('.widthdesc-form').find('input[name="success_msg"]').val());
	var activity_id = parseInt(document.getElementById('activity_id').innerHTML,10);
	if (success_msg == '') {
		success_msg = '感谢您的支持！我们会尽快与您取得联系！';
	}
	
	$.ajax({
		url: '/realty/custom_submit/'+activity_id,
		cache: false,
		dataType: 'json',
		async: false,
		type:'POST',
		data: form.serialize(),
		error: function(msg){
			alert(msg.data);
		},
		success: function(msg){
			if(msg.success){
				dialogShow('', success_msg);
			} 
			$('#nav-dots').css('display','block');
		}
	});
}

/**
 * loading图标设置
 * string type loading:出现加载图片；end 结束加载图片
 */
function loading(type){
	if('loading'==type){
		$('.loading').css({display:'block'});
	}else if('end'==type){
		$('.loading').css({display:'none'});
	}
}

/**
 * 绑定性别选择
 */
$(function(){
	$('.sex').bind('click',function(){
		var sex = $(this).attr('data-sex');
		$(this.parentNode).find('input').val(sex);
		$(this.parentNode).find('strong').removeClass('on');
		$(this).find('strong').addClass('on');
	});
});

/**
 * 绑定性别选择
 */
$(function(){
	$('.student').bind('click',function(){
		var student = $(this).attr('data-student');
		$(this.parentNode).find('input').val(student);
		$(this.parentNode).find('strong').removeClass('on');
		$(this).find('strong').addClass('on');
	});
});

/*
**自定义预约表单
*/
$(function(){
	$("p.submit-custom").click(function(e){
		e.preventDefault();
		var form = $(this).parents('form');
		var valid = check_input(form, 'base');
		if (valid) {
			valid = check_input(form);
			if (!valid && !$('.edit-more-info').hasClass('edited')) {
				$('.edit-more-info').click();
			}
		}
		if(valid){
			
			ajax_custom_submit(form);
		}
	})
})

/**
 * 表单完善更多信息
 */
$(function(){
	$('.edit-more-info').click(function(){
		var form = $(this).parents('form');
		if (check_input(form, 'base')) {
			$('.wct_form').addClass('change');
		}else return;
	});
	$('.submit-3').click(function(){
		var form = $(this).parents('form');
		if (check_input(form, 'base')) {
			$('.wct_form').removeClass('change');
		}else return;
	})
});
var if_ajax_custom_submit = false;  //是否提交过表单
/**
 * ajax异步提交表单数据
 * object form 表单jquery对象
 */
function ajax_custom_submit(form){
	var activeId = $('#activeId').val();
	
	var successTips = '您已报名成功，我们会尽快与您取得联系！';
	if($('#success-tips').length>0){
		successTips = $('#success-tips').val();
	}
	if(if_ajax_custom_submit){
		$('.popup_sucess').html(successTips);
		$(".popup_sucess").addClass("on");
		$(".popup_error").removeClass("on");
		setTimeout(function(){
			$(".popup").removeClass("on");
		},6000);
		return true;
	}
	loading('loading');
	if_ajax_custom_submit = true;
	$.ajax({
		url: '/car/custom_submit/'+activeId,
		cache: false,
		dataType: 'json',
		async: false,
		type:'POST',
		data: form.serialize(),
		success: function(msg){
			loading('end');
			if(msg.data==1){
				$('.popup_sucess').html(successTips);
				if ($('.wct_form').hasClass('change')) {
					$('.wct_form').removeClass('change');
				}
			}else if(msg.data==2){
				$('.popup_sucess').html(successTips);
				if ($('.wct_form').hasClass('change')) {
					$('.wct_form').removeClass('change');
				}
				var url = window.location.href;
				var site_id = url.substring(url.indexOf('car/index')+10,url.indexOf('?'));
				if(site_id == '768'){
					setTimeout(function(){
						window.location.href='http://www.jaguar.com.cn';
					},500);
				}
			}else{
				$('.popup_sucess').html('抱歉！系统繁忙中...');
			}
			$(".popup_sucess").addClass("on");
			$(".popup_error").removeClass("on");
			setTimeout(function(){
				$(".popup").removeClass("on");
			},6000)
		}
	});
}

/*
** 完整信息表单验证
*/
function check_input (form, type){
	var valid = true;
	if (type == 'base') {
		var inputs = form.find('.base-info-input:input');
	} else {
		var inputs = form.find(':input');
	}
	inputs.each(function(i, e){
		if(this.name != '' && this.name != 'undefined'){		
			var empty_tip = '';
			var reg_tip = '';
			var reg = '';
			var max = null;
			var mim = null;
			switch (this.name) {
				case 'name':
					reg = /^[\u4e00-\u9fa5|a-z|A-Z|\s]{1,20}$/;
					empty_tip = '不能落下姓名哦！';
					reg_tip = '这名字太怪了！';
					break;
				case 'mobile':
					reg = /^1[0-9][0-9]\d{8}$/;
					empty_tip = '有个联系方式，就更好了！';
					reg_tip = '这号码,可打不通... ';
					break;
				case 'sex':
					empty_tip = '想想，该怎么称呼您呢？';
					break;
				case 'email':
					reg = /(^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$)/i;
					reg_tip = '邮箱格式有问题哦！';
					break;
				case 'company':
					reg = /^[\u4e00-\u9fa5|a-z|A-Z|\s]{1,20}$/;
					reg_tip = '这个公司太奇怪了！';
					break;
				case 'position':
					reg = /^[\u4e00-\u9fa5|a-z|A-Z|\s]{1,20}$/;
					reg_tip = '这个职位太奇怪了！';
					break;
				case 'date':
					break;
				case 'time':
					break;
				case 'age':
					reg = /^([3-9])|([1-9][0-9])|([1][0-3][0-9])$/;
					reg_tip = '这年龄可不对哦！' ;
					break;
			}
			if (empty_tip != undefined && empty_tip != '' && $.trim($(e).val()) == '') {
				showMessage(empty_tip, true);
				//第一页点击提交验证
				if($(this).hasClass('.submit-1')){
					$('.wct_form').addClass('change');
				}
				//第二页点击提交验证
				else if($(this).hasClass('.submit-2')){
					$('.wct_form').removeClass('change');	
				}
				valid = false;
				return false;	
			}
			if (reg != undefined && reg != '' && $.trim($(e).val()) != '') {
				if(!$(e).val().match(reg)){
					showMessage(reg_tip, true);
					valid = false;
					return false;		
				}
			}
		}
	});
	if (valid == false) {
		return false;
	}else{
		return true;
	}
}

/*
** 显示验证信息
*/
function showMessage(msg, error) {
	if (error) {
		$('.popup_error').html(msg);
		$(".popup_error").addClass("on");
		$(".popup_sucess").removeClass("on");
		setTimeout(function(){
			$(".popup").removeClass("on");
		},2000);
	} else {
		$(".popup_sucess").addClass("on");
		$(".popup_error").removeClass("on");
		setTimeout(function(){
			$(".popup").removeClass("on");
		},2000);
	}
}

/**
 * 点击链接跳转到云购的动画开启
 */
var btn = $('.m-blank');
btn.on('click',function(){
	var src = $(this).find('a').attr('href');

	if(src.indexOf('/wx/pay/index')>-1){
		$('.m-blank-animate').find('strong').text('正在取货');
	}else $('.m-blank-animate').find('strong').text('正在前往');

	var _iPhoen	= RegExp("iPhone").test(navigator.userAgent)||RegExp("iPod").test(navigator.userAgent)||RegExp("iPad").test(navigator.userAgent)? true : false;

	if(_iPhoen){
		$('.m-blank-animate').addClass('move');
		$('.m-blank-animate').show();
	}
	// if(!_iPhoen){
	// 	setTimeout(function(){
	// 		$('.m-blank-animate').hide();
	// 		$('.m-blank-animate').removeClass('move');
	// 	},6000)
	// }
})




