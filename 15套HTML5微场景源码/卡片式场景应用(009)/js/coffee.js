/**
 *  音符漂浮插件
 *  -----------------------------
 *  作者：叼怎么写！- -||
 *  时间：2014-03-21
 *  准则：zepto
 *  联系：wechat--shoe11414255
 *  一张网页，要经历怎样的过程，才能抵达用户面前
 *  一个特效，要经历这样的修改，才能让用户点个赞
 *  一个产品，创意源于生活，源于内心，需要慢慢品味
 *********************************************************************************************
 *  这是别人写的东西，我只是重复利用，微调了下--努力努力 ^-^||
 *  
 * -----------保持队形------------------
 *  <div id='coffee'></div>
 *********************************************************************************************/
//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.
;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)

// 音符的漂浮的插件制作--zpeto扩展
;(function($){
  // 利用zpeto的animate的动画-css3的动画-easing为了css3的easing(zpeto没有提供easing的扩展)
	$.fn.coffee = function(option){
    // 动画定时器
    var __time_val=null;
    var __time_wind=null;
    var __flyFastSlow = 'cubic-bezier(.09,.64,.16,.94)';

    // 初始化函数体，生成对应的DOM节点
		var $coffee = $(this);
		var opts = $.extend({},$.fn.coffee.defaults,option);  // 继承传入的值

    // 漂浮的DOM
    var coffeeSteamBoxWidth = opts.steamWidth;
    var $coffeeSteamBox = $('<div class="coffee-steam-box"></div>')
      .css({
        'height'   : opts.steamHeight,
        'width'    : opts.steamWidth,
        'left'     : 60,
        'top'      : -50,
        'position' : 'absolute',
        'overflow' : 'hidden',
        'z-index'  : 0 
      })
      .appendTo($coffee);

    // 动画停止函数处理
    $.fn.coffee.stop = function(){
      clearInterval(__time_val);
      clearInterval(__time_wind);
    }

    // 动画开始函数处理
    $.fn.coffee.start = function(){
      __time_val = setInterval(function(){
        steam();
      }, rand( opts.steamInterval / 2 , opts.steamInterval * 2 ));

      __time_wind = setInterval(function(){
        wind();
      },rand( 100 , 1000 )+ rand( 1000 , 3000))
    }
		return $coffee;
		
    // 生成漂浮物
    function steam(){	
      // 设置飞行体的样式
			var fontSize = rand( 8 , opts.steamMaxSize  ) ;     // 字体大小
      var steamsFontFamily = randoms( 1, opts.steamsFontFamily ); // 字体类型
      var color = '#'+ randoms(6 , '0123456789ABCDEF' );  // 字体颜色
			var position = rand( 0, 44 );                       // 起初位置
			var rotate = rand(-90,89);                          // 旋转角度
			var scale = rand02(0.4,1);                          // 大小缩放
      var transform =  $.fx.cssPrefix+'transform';        // 设置音符的旋转角度和大小
          transform = transform+':rotate('+rotate+'deg) scale('+scale+');'

      // 生成fly飞行体
			var $fly = $('<span class="coffee-steam">'+ randoms( 1, opts.steams ) +'</span>');
			var left = rand( 0 , coffeeSteamBoxWidth - opts.steamWidth - fontSize );
			if( left > position ) left = rand( 0 , position );
			$fly
        .css({
          'position'     : 'absolute',
          'left'         : position,
          'top'          : opts.steamHeight,
          'font-size:'   : fontSize+'px',
          'color'        : color,
          'font-family'  : steamsFontFamily,
          'display'      : 'block',
          'opacity'      : 1
        })
        .attr('style',$fly.attr('style')+transform)
        .appendTo($coffeeSteamBox)
        .animate({
  				top		: rand(opts.steamHeight/2,0),
  				left	: left,
  				opacity	: 0
			  },rand( opts.steamFlyTime / 2 , opts.steamFlyTime * 1.2 ),__flyFastSlow,function(){
				  $fly.remove();
				  $fly = null;			
			 });
		};
		
    // 风行，可以让漂浮体，左右浮动
		function wind(){
      // 左右浮动的范围值
      var left = rand( -10 , 10 );
      left += parseInt($coffeeSteamBox.css('left'));
      if(left>=54) left=54;
      else if(left<=34) left=34;

      // 移动的函数
      $coffeeSteamBox.animate({
        left  : left 
      } , rand( 1000 , 3000) ,__flyFastSlow);
		};
		
    // 随即一个值
    // 可以传入一个数组和一个字符串
    // 传入数组的话，随即获取一个数组的元素
    // 传入字符串的话，随即获取其中的length的字符
		function randoms( length , chars ) {
			length = length || 1 ;
			var hash = '';                  // 
			var maxNum = chars.length - 1;  // last-one
			var num = 0;                    // fisrt-one
			for( i = 0; i < length; i++ ) {
				num = rand( 0 , maxNum - 1  );
				hash += chars.slice( num , num + 1 );
			}
			return hash;
		};

    // 随即一个数值的范围中的值--整数
		function rand(mi,ma){   
			var range = ma - mi;
			var out = mi + Math.round( Math.random() * range) ;	
			return parseInt(out);
		};	

    // 随即一个数值的范围中的值--浮点
		function rand02(mi,ma){   
			var range = ma - mi;
			var out = mi + Math.random() * range;	
			return parseFloat(out);
		};		
	};

	$.fn.coffee.defaults = {
		steams				    : ['jQuery','HTML5','HTML6','CSS2','CSS3','JS','$.fn()','char','short','if','float','else','type','case','function','travel','return','array()','empty()','eval','C++','JAVA','PHP','JSP','.NET','while','this','$.find();','float','$.ajax()','addClass','width','height','Click','each','animate','cookie','bug','Design','Julying','$(this)','i++','Chrome','Firefox','Firebug','IE6','Guitar' ,'Music' ,'攻城师' ,'旅行' ,'王子墨','啤酒'], /*漂浮物的类型，种类*/
		steamsFontFamily	: ['Verdana','Geneva','Comic Sans MS','MS Serif','Lucida Sans Unicode','Times New Roman','Trebuchet MS','Arial','Courier New','Georgia'],  /*漂浮物的字体类型*/
		steamFlyTime		  : 5000 , /*Steam飞行的时间,单位 ms 。（决定steam飞行速度的快慢）*/
		steamInterval	    : 500 ,  /*制造Steam时间间隔,单位 ms.*/
		steamMaxSize		  : 30 ,   /*随即获取漂浮物的字体大小*/
		steamHeight	  	  : 200,   /*飞行体的高度*/
		steamWidth	      : 300    /*飞行体的宽度*/
	};
	$.fn.coffee.version = '2.0.0'; // 更新为音符的悬浮---重构的代码
})(Zepto);

