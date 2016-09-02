(function(){
        var onBridgeReady = function () {
        	WeixinJSBridge.call("hideToolbar");
        	
			var appId  = "",	//$('#txt-wx').data('appid'),
				link   = window.location.href,	//$('#txt-wx').data('link'),
				title  = htmlDecode($('title').text()),	// htmlDecode($('#txt-wx').data('title')),
				desc   = htmlDecode($('title').text() + "，敬请访问！"),	//<br/>官网地址：" + window.location.href),	// htmlDecode($('#txt-wx').data('desc')),
				desc = desc || link,
				imgUrl = "";
			
			
			var url=window.location.href;
			var site_id = url.substring(url.indexOf('realty/index')+13,url.indexOf('?'));
			if(site_id == '445'){
				desc = '林隐朝阳  八十一座';
			}
			if(site_id == '4357'){
				desc = 'Lead the way between China and the world';
			}
			site_id = url.substring(url.indexOf('car/index')+10,url.indexOf('?'));
			if(site_id == '4171'){
				desc = '只有10万人能打开的邀请函！送加多宝好声音门票';
			}
			if(site_id == '428'){
				desc = 'TCL TV+家庭娱乐电视邀你看中国好电视，听中国好声音';
			}
			if(site_id == '4139'){
				desc = '分享有礼！';
			}
			if(site_id == '2271'){
				desc = '中欧2014级EMBA秋季班6月18日报名截止，9月入学';
			}
			if(site_id == '1784'){
				desc = '微吃，最好玩的移动美食社区';
			}
			if(site_id == '2727'){
				desc = '那些年，我们憧憬过的度假生活！';
			}
			if(site_id == '3404'){
				desc = 'Arla宝贝与我有机奶粉，微信有礼！';
			}
			site_id = url.substring(url.indexOf('meeting/index')+14,url.indexOf('?'));
			if(site_id == '2186'){
				desc = '9月16日，成都香格里拉大酒店，李善友教授论“移动互联网时代的颠覆式创新”';
			}			
			var link = link.replace(/([&\?])code=[\d\w]+&?/,"$1");
			link = link.replace('&weixin.qq.com=', '');
			link = link.replace('#wechat_webview_type=1', '');
			
			var image = $.trim($('link[data-logo]').attr('href'));	//$('#txt-wx').data('img')
			if (image=='' || image==undefined) {
				image = $.trim($('img[data-share-logo]').attr('src'));
			}
			if (image=='' || image==undefined) {
				image = $('#wx-share-img').val();
			}
			if (image=='' || image==undefined) {
				image = $.trim($('img:first').attr('src'));
			}
			if (image!='' && image!=undefined) {
				if (image.indexOf('http://') == -1) {
					imgUrl = "http://" + window.location.host + image;
				} else {
					imgUrl = image;
				}
			}
			
			// 发送给好友;
			WeixinJSBridge.on('menu:share:appmessage', function(argv){
				WeixinJSBridge.invoke('sendAppMessage',{
					//"appid"      : appId,
					"img_url"    : imgUrl,
					//"img_width"  : "640",
					//"img_height" : "640",
					"link"       : link,
					"desc"       : desc,
					"title"      : title
				},
				function(res){});
			});
			
			// 分享到朋友圈;
			WeixinJSBridge.on('menu:share:timeline', function(argv){
				WeixinJSBridge.invoke('shareTimeline',{
					"img_url"    : imgUrl,
					//"img_width"  : "640",
					//"img_height" : "640",
					"link"       : link,
					"desc"       : desc,
					"title"      : title
				}, function(res){});
			});
			
			// 分享到微博;
			var weiboContent = '';
			WeixinJSBridge.on('menu:share:weibo', function(argv){
				WeixinJSBridge.invoke('shareWeibo',{
					"content" : title + link,
					"url"     : link,
				},
				function(res){});
			});
		};

        if(document.addEventListener){
			document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
		} else if(document.attachEvent){
			document.attachEvent('WeixinJSBridgeReady'   , onBridgeReady);
			document.attachEvent('onWeixinJSBridgeReady' , onBridgeReady);
		}
})();