$(function(){
	$('.headWord').addClass('headWord-show');

    var mySwiper = new Swiper('.swiper-container',{
        // pagination: '.pagination',
        paginationClickable: true,
        slidesPerView: 1,
        mode: 'vertical',
        onTouchEnd:function(){
        	var self = $(mySwiper.activeSlide()).find('.info');
        	
        	// if(mySwiper.activeIndex==5){
        	// 	return 
        	// }
        	// self.removeClass('info-fall');
        	$('.info').css({
        		'opacity':'0',
        		'top':'0px',
        	})
        	self.animate({
        		opacity:'1',
        		top:'50px',

        	},'normal')
        }
    })

    var swiperNested5 = new Swiper('.num5 .swiper-nested-1',{
        mode: 'horizontal',
        // pagination: '.pagination-nested-1',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true,
        onTouchEnd:function(){
        	var self = $(swiperNested5.activeSlide()).find('.info');
        	console.log(self);
        	$('.info').css({
        		'opacity':'0',
        		'top':'0px',
        	})
        	self.animate({
        		opacity:'1',
        		top:'50px',

        	})
        }
    })
    $('.num5 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested5.swipePrev()
	})
	  $('.num5 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested5.swipeNext()
	})

    var swiperNested26 = new Swiper('.num26 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num26 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested26.swipePrev()
	})
	  $('.num26 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested26.swipeNext()
	})

    var swiperNested27 = new Swiper('.num27 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num27 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested27.swipePrev()
	})
	  $('.num27 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested27.swipeNext()
	})

  	var swiperNested28 = new Swiper('.num28 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num28 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested28.swipePrev()
	})
	  $('.num28 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested28.swipeNext()
	})

    var swiperNested30 = new Swiper('.num30 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num30 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested30.swipePrev()
	})
	  $('.num30 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested30.swipeNext()
	})
    
    var swiperNested31 = new Swiper('.num31 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num31 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested31.swipePrev()
	})
	  $('.num31 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested31.swipeNext()
	})

    var swiperNested32 = new Swiper('.num32 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num32 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested32.swipePrev()
	})
	  $('.num32 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested32.swipeNext()
	})

    var swiperNested33 = new Swiper('.num33 .swiper-nested-1',{
        mode: 'horizontal',
        paginationClickable: true,
        slidesPerView: 1,
        loop:true
    })
    $('.num33 .left').on('click', function(e){
		e.preventDefault()
	    swiperNested33.swipePrev()
	})
	  $('.num33 .right').on('click', function(e){
	    e.preventDefault()
	    swiperNested33.swipeNext()
	})
    // window.ontouchstart = function(){
    //     // $('audio').attr('autoplay','autoplay')
    //     $('audio').get(0).play();
    // }


    $(window).one('touchstart',function(){
        $('audio').get(0).play();
        $('.music').addClass('on music-off');
    })
    $('.music').on('touchstart',function(){
        if($(this).hasClass('on')){
            $('audio').get(0).pause();
            $(this).removeClass('on music-off');
        }else {
            $('audio').get(0).play();
            $(this).addClass('on music-off');
        }  
    })    

    $('.foot').click('touchstart',function(){
    	var box = $(this).find('.share');

    	if(box.is(":hidden")){
    		box.show();
    	}else {
    		box.hide();
    	}
    	
    })
    
})
