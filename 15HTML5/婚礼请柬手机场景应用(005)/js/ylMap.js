/*
** yl_map 插件
*/
var ylmap = ylmap || {};
ylmap.init = function(){
	var mapBox			= $('.ylMap'),												//地图容器Jquery对象
		mapVal			= mapBox.next(".mapVal").find('.address').val(),			//获取到存放数据的Jquery对象
		latTarget		= Number(mapBox.next(".mapVal").find('.latitude').val()),	//获取目标纬度坐标
		lngTarget		= Number(mapBox.next(".mapVal").find('.longitude').val()),	//获取目标经度坐标
		
		way				= null,					//导航的方式
		transit 		= null,					//公交车导航
		driving 		= null,					//自驾导航
		location_point 	= null;					//设备当前的point对象

	/*
	** 地图初始化
	** _marker标识全局变量
	** _map地图全局变量
	*/
	var mapInit = function() {
		if(mapBox.size()>0){
			var map = new BMap.Map(mapBox.attr("id")),			//创建Map实例--容器是当前jquery对象
				point = new BMap.Point(lngTarget,latTarget),   //全局变量
				marker = new BMap.Marker(point);     			//全局变量地图标注
			window.map = map;									//将map提升为全局变量
			window.point = point;
			window.marker = marker;								//将marker提升为全局变量
			map.enableScrollWheelZoom();        		  		//启用滚轮放大缩小
			map.enableInertialDragging();         				//启用地图拖曳
			map.centerAndZoom(point,15);						//将目标定位在地图的中心
			map.addOverlay(marker);              				//将标注添加到地图中
			mapOpenInfo();
			marker.addEventListener("click", function(e){    	//marker点击重新打开窗口
				mapOpenInfo();
			});
			map.addEventListener("click", function(e){    		//地图点击窗口不关闭
				return false;
			}); 
		}
	},
	
	
	/*
	**点击地图浮层文本调用信息窗口出现
	*/
	mapOpenInfo = function(){
		var data = eval('('+mapVal+')');						//json对象，存放目标对象信息
		mapAddInfo(marker,data);								//并且打开info窗口显示目标信息
	},

	/**
	 **创建目标信息窗口
	 * @param marker  百度地图marker标注
	 * @param data    数据表plugin_store记录
	 * @text 		  作为Jquery对象传入
	 */
	mapAddInfo = function(marker_,data) {
		/*
		**动态加载信息元素
		*/
		var content_infoWindow = $('<div class="infoWindow"></div>');
		content_infoWindow.append('<h4>'+data.sign_name+'</h4>')
		content_infoWindow.append('<p class="tel"><a href="tel:'+data.contact_tel+'">'+data.contact_tel+'</a></p>')
		content_infoWindow.append('<p class="address">'+data.address+'</p>')
		content_infoWindow.append('<div class="window_btn"><button class="open_navigate open_bus" onclick="open_navigate(this)">公交</button><button class="open_navigate open_car" onclick="open_navigate(this)">自驾</button><span class="State"></span></div>')

		/*
		**打开信息窗口
		*/
		var opts = {    
			width : 400,    	 // 信息窗口宽度 0为auto   
			height: 0,  		 // 信息窗口高度 0为auto  
			title:' '
		}  

		var info = new BMap.InfoWindow(content_infoWindow[0],opts);
		marker_.openInfoWindow(info,map.getCenter());

	};

	open_navigate = function(obj){
		$(obj).hasClass("open_bus") ? way = 'bus' : way = 'car';				 //打开导航窗口
		navigate();
		$('.infoWindow').find('span.State').html('正在定位您的位置！');	
	
	},


	//获取设备当前的坐标并且存放到location_point中
	/**************************************************************************************************************
	 * 设备定位获取location坐标值
	 */
	navigate = function(){
		if (window.navigator.geolocation) {
			window.navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {timeout: 10000});
		}else{
			alert('sorry！您的设备不支持定位功能')
		}
	},

	/**
	 * 定位失败
	 */
	handleError = function(error){
		var msg;
		switch(error.code) {
		    case error.TIMEOUT:
		    	msg = "获取超时!请稍后重试!";
		        break;
		    case error.POSITION_UNAVAILABLE:
		    	msg = '无法获取当前位置!';
		        break;
		    case error.PERMISSION_DENIED:
		    	msg = '您已拒绝共享地理位置!';
		        break;
		    case error.UNKNOWN_ERROR:
		    	msg = '无法获取当前位置!';
		        break;
		}
		if ($('.infoWindow').find('span.State').length>0) {
			$('.infoWindow').find('span.State').html(msg);
		} else {
			alert(msg);
		}
	},
	
	/**
	 * 获得当前手机位置信息
	 */
	handleSuccess = function(position){
		// 获取到当前位置经纬度 
		var coords = position.coords;
		var lat = coords.latitude;
		var lng = coords.longitude;
		location_point = new BMap.Point(lng,lat);
		$('.infoWindow').find('span.State').html('获取信息成功，正在加载中！');
		//选择导航方式
		if(way=="bus")	bus_transit();
		else self_transit();
		//展开地图窗口
		mapBox.parent().addClass("open");
		//绑定取消事件
		mapBox.parent().find(".close_map").click(function(){
			mapBox.parent().removeClass("open");

			//清楚路线
			if(transit)	transit.clearResults();
			if(driving)	driving.clearResults();
			
			//返回中心定位点
			map.reset();
			map.centerAndZoom(point,15);
			mapBox.parent().find(".close_map").hide();
			//弹出信息窗口
			mapOpenInfo();

			//页面切换事件绑定
			$(".m-page").on('mousedown touchstart',page_touchstart);
			$(".m-page").on('mousemove touchmove',page_touchmove);
			$(".m-page").on('mouseup touchend mouseout',page_touchend);

			//显出声音
			$('.fn-audio').show();
			
			//关闭导航文字和切换按钮
			$('#transit_result').removeClass("open");
			$(".transitBtn").hide();
			
			
		});

		/*取消触摸地图，页面切换*/
		$(".m-page").off('mousedown touchstart');
		$(".m-page").off('mousemove touchmove');
		$(".m-page").off('mouseup touchend mouseout');

	};
	
	/*
	**打开导航
	*/
	$(".m-map .tit p").click(function(){
		mapBox.parent().toggleClass("open");
		if(mapBox.parent().hasClass("open")){
			//关闭声音
			$('.fn-audio').hide();
			/*取消触摸地图，页面切换*/
			$(".m-page").off('mousedown touchstart');
			$(".m-page").off('mousemove touchmove');
			$(".m-page").off('mouseup touchend mouseout');
		}else{
			//显出声音
			$('.fn-audio').show();
			//页面切换事件绑定
			$(".m-page").on('mousedown touchstart',page_touchstart);
			$(".m-page").on('mousemove touchmove',page_touchmove);
			$(".m-page").on('mouseup touchend mouseout',page_touchend);
		}
	});


	/************************************************************************************************************/
	/**
	 * 画公交路线
		*/
	bus_transit = function(){
		//清楚路线
		if(transit)	transit.clearResults();
		if(driving)	driving.clearResults();

		
		if(!location_point){
			alert('抱歉：定位失败！');
			return;
		}
		$('.fn-audio').hide();
		if(typeof(loadingPageShow)=="function") loadingPageShow();
		$('.infoWindow').find('span.State').html('正在绘制出导航路线');
		var transit_result = $("#transit_result") || $('<div id="transit_result"></div>');
		transit_result.appendTo(mapBox);
		transit = new BMap.TransitRoute(map, {
			renderOptions: {map: map,panel: "transit_result",autoViewport: true },onSearchComplete :searchComplete
		});
		transit.search(location_point, point);
	},

	/**
	 * 画自驾路线
		*/
	self_transit = function(){
		//清楚路线
		if(transit)	transit.clearResults();
		if(driving)	driving.clearResults();
		
		if(!location_point){
			alert('抱歉：定位失败！');
			return;
		}
		$('.fn-audio').hide();
		if(typeof(loadingPageShow)=="function") loadingPageShow();
		$('.infoWindow').find('span.State').html('正在绘制出导航路线');
		var transit_result = $("#transit_result") || $('<div id="transit_result"></div>');
		transit_result.appendTo(mapBox);
		driving = new BMap.DrivingRoute(map, {
				renderOptions: {map: map,panel: transit_result.attr('id'),autoViewport: true },onSearchComplete :searchComplete
			});
		driving.search(location_point, point);
	},
	/**
	 * @param result
	 * 线路搜索回调
	 */
	searchComplete = function(result) {
		if (result.getNumPlans() == 0) {
			
			alert('非常抱歉,未搜索到可用路线');
			//重置地图
			map.reset();
			map.centerAndZoom(point,15);
			mapBox.parent().find(".close_map").hide();
			mapOpenInfo();
			$('#transit_result').removeClass("open").hide();
			$(".transitBtn").hide();
			
		}else{
			$('#transit_result').addClass("open");	
			$('.infoWindow').find('span.State').html('');
			if(!$('.transitBtn').length>0){
				$('#transit_result').after($('<p class="transitBtn close" onclick="transit_result_close()"><a href="javascript:void(0)">关闭</a></p>'));
				$('#transit_result').after($('<p class="transitBtn bus" onclick="bus_transit()"><a href="javascript:void(0)">公交</a></p>'));
				$('#transit_result').after($('<p class="transitBtn car" onclick="self_transit()"><a href="javascript:void(0)">自驾</a></p>'));
			}
			mapBox.parent().find(".close_map").show();
			//打开导航文字和切换按钮
			$("#transit_result").addClass("open");
			$(".transitBtn").show();
		}
		if(typeof(loadingPageHide)=="function") loadingPageHide();
		
		if($("#transit_result").hasClass("open")){
			$(".close").find("a").html("关闭");
		}
		else{
			$(".close").find("a").html("打开");
		}
		
	};
	
	/*
	**transit_result导航窗口切换
	*/
	transit_result_close = function(){
		if($("#transit_result").hasClass("open")){
			$('#transit_result').removeClass("open");
			$(".close").find("a").html("打开");
		}
		else{
			$('#transit_result').addClass("open");
			$(".close").find("a").html("关闭");
		}
	};

	/*
	**异步创建加载一个脚本--map
	*/
	window.mapInit = mapInit;	//将初始化函数提升为全局函数 可以调用动态API地图
	
	function loadfunction() {  
		/*加载百度地图API*/
		var script = document.createElement("script");  
		script.src = "http://api.map.baidu.com/api?v=1.4&callback=mapInit";
		document.head.appendChild(script);

		/*加载百度地图样式--插件样式*/
		var Style = document.createElement("style");  
		Style.type = "text/css";
		
		var style_map =
				 "#transit_result{display:none;position:absolute;top:0;left:0;width:100%;height:100%;z-index:1000;overflow-y:scroll;}"+
				 "#transit_result.open{display:block;}"+
				 "#ylMap img{width:auto;height:auto;}"+
				 "#ylMap .transitBtn {display:none;position:absolute;z-index:3000;}"+
				 "#ylMap .transitBtn a{display:block;width:80px;box-shadow:0 0 2px rgba(0,0,0,0.6) inset, 0 0 2px rgba(0,0,0,0.6);height:80px;border-radius:80%;color:#fff;background:rgba(230,45,36,0.8);text-align:center;line-height:80px;font-size:24px; font-weight:bold}"+
				 "#ylMap .transitBtn.close {top:10px;right:10px;}"+
				 "#ylMap .transitBtn.bus {top:10px;right:110px;}"+
				 "#ylMap .transitBtn.car {top:110px;right:10px;}"+
				 "#ylMap .transitBtn.bus a{background:rgba(28,237,235,0.8);}"+
				 "#ylMap .transitBtn.car a{background:rgba(89,237,37,0.8);}"+
				 ".m-map.open{height:92%;width:100%;}"+
				 "#transit_result h1{font-size:26px!important;}"+
				 "#transit_result div[onclick^='Instance']{background:none!important;}"+
				 "#transit_result span{display:inline-block;font-size:20px;padding:0 5px;}"+
				 "#transit_result table {font-size:20px!important;}"+
				 "#transit_result table td{padding:5px 10px!important;line-height:150%!important;}"+
				 ".infoWindow h4{font-size:24px;}"+
				 ".infoWindow p{margin-bottom:10px;font-size:24px;}"+
				 ".infoWindow .window_btn{font-size:24px;}"+
				 ".infoWindow .window_btn .open_navigate{display:inline-block;padding:10px 15px;margin-right:10px;border:1px solid #ccc;border-radius:6px;text-align:center;cursor:pointer;}"+
				 ".anchorBL{display:none!important;}";
		Style.innerHTML = style_map ;
		document.head.appendChild(Style);
	}
	loadfunction();
};


