var tWidth = tHeight = 0;
var tIndex = 0;

var nStartY;
var f;
var moveLength = 0;
var isMove = false;
var PageMusic;
var 音乐开关;

$(document).ready(function(e) {
    _initPage();
	$(".music").hide();
	
    WeixinApi.ready(function(Api) {
        isWinxin = true;
        // 隐藏浏览器下方的工具栏
        Api.hideToolbar();

        // 获取网络状态
        Api.getNetworkType(function(network) {
            // 拿到 network 以后，做任何你想做的事
            if (network.indexOf("wifi") != -1) {
                $(".music").show();
                _initMusic();
            }
        });
    });
});
function _initMusic() {
    var audios = document.getElementsByTagName('audio');
    PageMusic = audiojs.create(audios[0]);音乐开关 = true;
    PageMusic.load("video/music.mp3"); 
    PageMusic.setVolume(0.2);
}
function MusicPause() {
    PageMusic.playPause();
}
function _initPlay() {
    if (音乐开关) {
        $("#bottomBgImg").attr("src", "images/close1.png");音乐开关 = false;
    } else {
        $("#bottomBgImg").attr("src", "images/open.png");音乐开关 = true;
    }
    MusicPause();
}
function _initPage() {
    tWidth = $(window).width();
    tHeight = $(window).height();
    $(".page").css({
        "width": tWidth,
        "height": tHeight
    });
	$(".centerImg").css({
        "width": tWidth,
        "height": tHeight-40
    });
	
	$(".bottomBlue").css({"height":tHeight-208,"top":208});
	$(".infoDom").css({"margin-top":tHeight*0.1/2});
    $(".page").each(function(index, element) {
        $(this).on("mousedown touchstart", _start);
        $(this).on("mousemove touchmove", _move);
        $(this).on("mouseup touchend", _end);
    });
	$(".openInfo").each(function(index, element) {
        $(this).click(function(e) {
            _initOpen(textObj[index]);
        });
    });
	$(".openInfo5").each(function(index, element) {
        $(this).click(function(e) {
            _initOpen(textObj[index+6]);
        });
    });
	
	$(".infoText .titleDom .close").click(function(e) {
        _initClose();
    });
	
    $(".music").click(function(e) {
        _initPlay();
    });
   // tIndex = 0;
    _initAnimate();
}

function _start(e) {
    if (e.type == "touchstart") {
        nStartY = event.touches[0].pageY;
    } else {
        nStartY = e.y || e.pageY;
    }

    isMove = true;
}
function _move(e) {
    event.preventDefault();
    event.stopPropagation();
    if (isMove) {
        var m;
        var moveP;
        if (e.type == "touchmove") {
            moveP = event.touches[0].pageY;
            m = nStartY - moveP;
        } else {
            moveP = e.y || e.pageY;
            m = nStartY - moveP;
        }
        if (m < 0) {
            f = "--";
        }
        if (m > 0) {
            f = "++";
        }
        moveLength = Math.abs(nStartY - moveP);
    }
}
function _end() {
    if (moveLength > 70) { //移动距离大于70
        if (f == "++") {
            if (tIndex >= 0 && tIndex <= $(".pageUl li").length - 1) {
                tIndex++;
                if (tIndex > $(".pageUl li").length - 1) {
                    tIndex = 0;
                }
                _initAnimate();
            }
        } else if (f == "--") {
            if (tIndex >= 0 && tIndex <= $(".pageUl li").length - 1) {
                tIndex--;
                if (tIndex < 0) {
                    tIndex = $(".pageUl li").length - 1;
                }
                _initAnimate();
            }
        }
    }
    moveLength = 0;
    isMove = false;
}
function _initAnimate() {
    if (tIndex >= 0 && tIndex < $(".pageUl li").length) {
		$(".pageUl").animate({"top":-tIndex*$(".pageUl li").outerHeight()},"fast");
        _animate();
    }
    function _animate() {
        if (tIndex == 0) {
            $(".pageUl li").eq(tIndex).find(" img").each(function(index, element) {
                if (!$(this).hasClass("next")&&!$(this).hasClass("up")) {
                    TweenMax.from($(this), 0.95, {
                        scale: 0.4,
                        delay: 0.2 * index,
                        opacity: 0,
                        ease: Elastic.easeOut
                    });
                }
            });
            TweenMax.from($(".pageUl li").eq(tIndex).find(".up"), 0.5, {
                y: "200",
                delay: 0.8,
                opacity: 0,
                ease: Back.easeOut
            });
            TweenMax.from($(".pageUl li").eq(tIndex).find(".next"), 0.5, {
                y: "100",
                delay: 0.85,
                opacity: 0,
                ease: Back.easeOut
            });
            setTimeout(function() {
                TweenMax.to($(".pageUl li").eq(tIndex).find(".next"), 0.6, {
                    y: -5,
                    delay: 1,
                    yoyo: true,
                    repeat: -1,
                    ease: Linear.easeNone
                });
            },
            100);
        }else if(tIndex==1||tIndex==2){
			TweenMax.from($(".pageUl li").eq(tIndex).find(".titleDom .title"), 0.45, {
               y: -400,
               opacity: 0
            });
			TweenMax.from($(".pageUl li").eq(tIndex).find(".bottomContent img").eq(0), 0.45, {
               y: 800,
               delay: 0.2,
               opacity: 0
            });
			TweenMax.from($(".pageUl li").eq(tIndex).find(".bottomContent img").eq(1), 0.45, {
               y: 800,
               delay: 0.25,
               opacity: 0
            });
			
            TweenMax.from($(".pageUl li").eq(tIndex).find(".next"), 0.5, {
                y: "100",
                delay: 0.3,
                opacity: 0,
                ease: Back.easeOut
            });
		}else if(tIndex==3||tIndex==4){
			if(tIndex==3){
				TweenMax.from($(".title3"), 0.45, {
				   y: -400,
				   opacity: 0
				});
			}
			$(".pageUl li").eq(tIndex).find(".bottomImgLeftRight").each(function(index, element) {
                var t=$(this);
				TweenMax.from(t.find("div").eq(0), 0.35, {
					x: -tWidth,
					delay: t.index()*0.1,
					opacity: 0
            	});
				TweenMax.from(t.find("div").eq(1), 0.35, {
					x: tWidth,
					delay: t.index()*0.15,
					opacity: 0
            	});
            });
		}
		else if(tIndex==5){
			TweenMax.from($(".title5"), 0.35, {
				x: -tWidth,
				delay:0.15,
				opacity: 0
			});
			TweenMax.from($(".bottom5"), 0.35, {
				y: 100,
				delay:0.25,
				opacity: 0
			});	
			 TweenMax.from($(".pageUl li").eq(tIndex).find(".next"), 0.5, {
                y: "100",
                delay: 0.8,
                opacity: 0,
                ease: Back.easeOut
            });
            setTimeout(function() {
                TweenMax.to($(".pageUl li").eq(tIndex).find(".next"), 0.6, {
                    y: -5,
                    delay: 1,
                    yoyo: true,
                    repeat: -1,
                    ease: Linear.easeNone
                });
            },
            100);		
		}else if(tIndex==6){
			TweenMax.from($(".title6"), 0.35, {
				x: tWidth,
				delay:0.15,
				opacity: 0
			});	
		}else if(tIndex==8){
			TweenMax.from($(".centerImg img"), 0.45, {
                scale: 0.3,
				delay:0.15,
				opacity: 0
			});	
			TweenMax.from($(".bottom8"), 0.55, {
				y: 100,
				delay:0.35,
				opacity: 0,
                ease: Back.easeOut
			});	
			
		}
    }
}
function _initOpen(data){
	$(".infoText .number").html(data.number);
	$(".infoText .title").html(data.title);
	$(".infoText .info").load(data.content,function(){_initScroll();});
	$(".infoText").fadeIn("fast");
	//setTimeout(function(){_initScroll();},100);
}
function _initClose(){
	$(".infoText").fadeOut("fast");
	setTimeout(function(){_initScroll();},100);
}
function _initScroll(){
	$(".infoDom .info").css("height",$(".infoDom").height()-$(".infoDom .titleDom").height());
	$(".infoDom .info").mCustomScrollbar({
		scrollButtons:{
			enable:true
		}
	});
}