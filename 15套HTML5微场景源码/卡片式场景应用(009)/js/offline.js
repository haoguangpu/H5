// 检查更新离线缓存清单
if(window.applicationCache){
	window.applicationCache.addEventListener('updateready', function(e) {  
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			applicationCache.swapCache()
			window.location.reload(); 
		} else {  
			// Manifest没有改动，nothing to do 
		}  
	}, false);
	
	// 错误处理
	window.applicationCache.addEventListener('error', function(e) {  
		// nothing to do 
		return false;
	}, false);  
}