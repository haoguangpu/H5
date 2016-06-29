;! function( Slider ) {
    Slider.prototype.initAnimation = function() {
        var subSwiper,
            initSubSwiper = function() {
                if ( ! subSwiper ) {
                    var $subPower = $( ".js-sub-power-scroll" );
                    subSwiper  = $subPower.swiper( {
                        mode: "horizontal",
                        slidesPerView:1,
                        loop: false
                    } );
                } else {
                    subSwiper.reInit();
                }
            },
            startSlideAnimation = function( swiper ) {
                var $activeSlide = $( swiper.activeSlide() );
                $activeSlide.children().removeClass( "hide" );
                // init sub swiper
                if ( $activeSlide.data( "containSubSwiper" ) || ( $activeSlide.find( ".js-sub-power-scroll" ).length > 0 ) ) {
                    $activeSlide.data( "containSubSwiper", true );
                    initSubSwiper();
                }
            },
            hideAllSlideAnimation = function( swiper ) {
                for ( var i = 0, l = swiper.slides.length; i < l; ++ i ) {
                    $( swiper.slides[i] ).children().addClass( "hide" );
                }
            };

        this.swiper.addCallback( "FirstInit", function( swiper ) {
            setTimeout( function() {
                startSlideAnimation( swiper );
            }, 300);
        } );

        this.swiper.addCallback( "SlideReset", function( swiper, direction ) {
            startSlideAnimation( swiper );
        } );

        this.swiper.addCallback( "SlideChangeEnd", function( swiper, direction ) {
            hideAllSlideAnimation( swiper );
            startSlideAnimation( swiper );
        } );

        hideAllSlideAnimation( this.swiper );
    };
}(MobileSlider);

$( function() {
    var $powerScroll = $( ".js-power-scroll" );

    // new tab at pc
    if ( ! /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test( navigator.userAgent.toLowerCase() ) ) {
        $powerScroll.find( "a" ).attr( "target", "_blank" );
    }

    // like btn
    $powerScroll.delegate( ".js-slide-rating .js-fav-btn", "click", function( e ) {
        var $btn    = $( ".js-slide-rating .js-fav-btn" ),
            $number = $( ".js-slide-rating .js-number" ),
            $heart  = $btn.find( ".js-heart" ),
            weiUid  = $btn.data( "wei-uid" ),
            applyId = $btn.data( "apply-id" );


        // fixed the bug: after click like btn, share link will contain the hash
        // fix method: set all hash to __fixed__
        $( ".swiper-slide" ).attr( "data-hash", "__fixed__" );
        window.location.hash = "__fixed__";

        if ( $btn.attr( "disabled" ) || ! weiUid || ! applyId ) {
            return false;
        }

        $btn.attr( "disabled", true );
        $number.html( parseInt( $number.html() || 0 ) + 1 ).addClass( "a-largen-out" );
        setTimeout( function(){ $number.removeClass( "a-largen-out" ); }, 780 );
        $heart.addClass( "c-red" );
        $.getJSON( SITE_URL + "RecruitFestival/likeWeiUser", { wei_uid: weiUid, apply_id: applyId }, function( res ) {
            if ( res && res.status ) {
            } else {
                $number.html( parseInt( $number.html() || 0 ) - 1 ).removeClass( "a-largen-out" );
                $heart.removeClass( "c-red" );
                $btn.attr( "disabled", false );
                alert( res.info || "%>.<%操作失败，请稍后重试~" );
            }
        } );
    } );

    // share btn
    if ( navigator.userAgent.match(/micromessenger/gi) || ! /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test( navigator.userAgent.toLowerCase() ) ) {
        $powerScroll.delegate( ".js-share-btn", "click", function() {
            var $btn   = $( this ),
                $power = $( ".js-power-scroll-container" ),
                $fade  = $( "<div/>" ),
                $content   = $( "<div/>" ),
                $shareTips = $( "<div/>" ),
                imgUri = "share-timeline.png";
            // 蒙层
            $fade.attr( "style", "box-sizing: border-box;overflow: visible;position: absolute;top: 0;left: 0;bottom: 0px;right: 0;width: 100%;height: 100%;background-color: #000;opacity: .7;filter: alpha(opacity=70);z-index: 1140;" );
            $content.attr( "style", "box-sizing: border-box;overflow: visible;position: absolute;top: 0;left: 0;bottom: 0px;right: 0;width: 100%;height: 100%;z-index: 1150;" );
            // 分享提示
            $shareTips.attr( "style", "position:absolute;top:-18px;right:5px;" );
            $shareTips.append( "<img/>" ).find( "img" ).attr( "src", "images/" + imgUri + "?v201412110010" ).attr( "width", 420 );
            // 关闭蒙层
            $content.bind( "click", function() {
                $fade.remove();
                $content.remove();
                $fade      = null;
                $content   = null;
                $shareTips = null;
            } );
            // 组装
            $content.append( $shareTips );
            $power.append( $fade ).append( $content );
        } );
    }

    $powerScroll = null;
} );
