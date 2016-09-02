$(function(){
var msg_html = '<h3><a href="javascript:void(0);" class="active">杂志推荐</a><a href="javascript:void(0);">应用推荐</a></h3><div class="list_boxs">';
var msgapp = '<ul class="ad_list" style="display:none;"><li><a href="http://www.5.cn/wap/download/ad_baidu.html"><img src="http://img.800.cn/images/ads_08.jpg" /></a></li><li class="r"><a href="http://www.5.cn/wap/download/ad_buyu.html"><img src="http://img.800.cn/images/ads_13.jpg" /></a></li>';
msgapp +='<li><a href="http://www.5.cn/wap/download/ad_360.html"><img src="http://img.800.cn/images/ads_12.jpg" /></a></li><li class="r"><a href="http://www.5.cn/wap/download/ad_game.html"><img src="http://img.800.cn/images/ads_06.jpg" /></a></li></ul>';
    var urlstr=location.href; 
    $.post("http://www.5.cn/Rmajax/viewsm","url="+urlstr,function(msg){
        msg = '<ul class="ad_list magazine_1">'+msg+'</ul>';
        msg_html = msg_html+msg+msgapp+'</div>';
        $(".ad_foot").html(msg_html);
        
        $(".ad_foot h3 a").click(function(){
            var aOn = $(".ad_foot h3 a");
            $(this).addClass("active").siblings().removeClass("active");
            $(".list_boxs .ad_list").eq(aOn.index(this)).show().siblings().hide();
        });
    });
//    $.post("http://www.5.cn/Rmajax/returnweixinurl","",function(msg){
//        if(msg!=""){
//            $("#wx-link").attr("href",msg);
//        }
//    });
})