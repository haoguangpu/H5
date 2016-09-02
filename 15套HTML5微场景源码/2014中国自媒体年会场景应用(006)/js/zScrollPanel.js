/**
 * Created with JetBrains WebStorm.
 * User: Zuobai
 * Date: 13-10-21
 * Time: 下午2:23
 * To change this template use File | Settings | File Templates.
 */
(function () {
	// region 引入
	var translate = Z.translate,
		Event = Z.Event,
		css = Z.css,
		loopArray = Z.loopArray,
		range = Z.range,
		defaultArg = Z.defaultArg,
		insert = Z.insert,
		extend = Z.extend,
		onDragH = Z.onDragH,
		onDragV = Z.onDragV,
		insertCSSRules = Z.insertCSSRules,
		firstCall = Z.firstCall,
		Direction = Z.Direction,
		TupleString = Z.TupleString,
		inRange = Z.inRange,
		element = Z.element,
		requestAnimate = Z.requestAnimate,
		moveAnimate = Z.moveAnimate,
		Switcher = Z.Switcher;

	var translate3d = TupleString( "translate3d" );
	// endregion

	// region 控件
	// 滚动面板
	var ScrollPanel = function () {
		// 滚动面板
		var ScrollType = {
			vertical : 0,
			horizontal : 1
		};

		function ScrollPanel( page, arg ) {
			firstCall( ScrollPanel, function () {
				insertCSSRules( ".z-scroll-panel", {
					overflow : "hidden",
					position : "relative"
				} );

				insertCSSRules( ".z-scroll-panel .z-scroll-bar", {
					position : "absolute",
					"z-index" : "10000",
					background : "rgba(64,64,64,0.5)",
					"border-radius" : "3px",
					top : 0,
					opacity : 0,
					transition : "0.5s"
				} );

				insertCSSRules( ".z-scroll-panel .z-scroll-bar.z-scroll-bar-show", {
					opacity : 1,
					transition : "none"
				} );

				insertCSSRules( ".z-scroll-panel .scroll-content", {
					position : "absolute",
					left : 0,
					top : 0,
					"z-index" : "2"
				} );

				insertCSSRules( ".z-scroll-panel.vertical .scroll-content", {
					right : 0,
					"min-height" : "100%"
				} );

				insertCSSRules( ".z-scroll-panel.horizontal .scroll-content", {
					bottom : 0,
					"min-width" : "100%"
				} );

				insertCSSRules( ".z-scroll-panel.horizontal .z-scroll-bar", {
					height : "4px",
					bottom : "8px"
				} );

				insertCSSRules( ".z-scroll-panel.vertical .z-scroll-bar", {
					width : "4px",
					right : "8px"
				} );

				insertCSSRules( ".z-scroll-panel .z-scroll-blank", {
					position : "absolute",
					left : 0,
					right : 0,
					top : 0,
					bottom : 0
				} );
			} );

			arg = defaultArg( arg, {
				rollbackDuration : 0.35, // 回滚持续时间
				inertial : 20, // 惯性,用来决定惯性滚动的速度
				topBlank : -1, // 顶部的留白,决定可以被拖下来多少,-1表示任意留白
				bottomBlank : -1, // 底部的留白
				scrollType : ScrollType.vertical // 滚动类型,垂直或者水平
			} );

			page.classList.add( "z-scroll-panel" );
			page.classList.add( arg.scrollType === ScrollType.horizontal ? "horizontal" : "vertical" );

			var userScrollBar = arg.useScrollBar || arg.scrollType === ScrollType.vertical,
				isHorizontal = arg.scrollType === ScrollType.horizontal;

			function getHeight( el ) {
				return el.offsetHeight;
			}

			function getWidth( el ) {
				return el.offsetWidth;
			}

			var dragStart = isHorizontal ? onDragH : onDragV,
				mainSize = isHorizontal ? getWidth : getHeight, // 主尺寸
				move = arg.scrollType === ScrollType.horizontal ? function ( el, val ) {
					translate( el, val, 0 );
				} : function ( el, val ) {
					translate( el, 0, val );
				}; // 位移函数

			// 滚动的启动事件和结束事件
			var scrollStartEvent = Event(),
				scrollEndEvent = Event(),
				scrollUpEvent = Event(),
				scrollMoveEvent = Event();

			function Blank() {
				var blank = element( "div", {
					classList : "z-scroll-blank",
					css : {
						visibility : "hidden"
					}
				} );

				page.appendChild( blank );

				return insert( blank, {
					visible : Switcher( false, function ( val ) {
						css( blank, "visibility", val ? "visible" : "hidden" );
					} )
				} );
			}

			var topBlank = Blank(), bottomBlank = Blank();
			var content = page.querySelector( ".scroll-content" );
			var scrollBar = element( "div", {
				classList : "z-scroll-bar"
			} );
			userScrollBar && page.appendChild( scrollBar );

			// 滚动条的显示与隐藏
			function displayScrollBar( flag ) {
				flag ? scrollBar.classList.add( "z-scroll-bar-show" ) : scrollBar.classList.remove( "z-scroll-bar-show" );
			}

			// 尺寸和位置
			var curTop = 0;
			var scrollSize = 0, contentSize = 0, scrollLength = 0, bottom = 0;

			// 设置滚动条的位置
			function setScrollBarPos() {
				if ( userScrollBar && scrollLength > 0 ) {
					move( scrollBar, range( -curTop / contentSize * scrollSize, -scrollLength + 5, scrollSize - 5 ) );
				}
			}

			// 当滚动区域改变时,调用update更新尺寸
			function update() {
				scrollSize = mainSize( page );
				contentSize = mainSize( content );
				bottom = scrollSize - contentSize;

				var ratio = scrollSize / contentSize;
				scrollLength = ratio > 1 ? 0 : ratio * scrollSize;
				css( scrollBar, "height", scrollLength + "px" );

				setScrollBarPos();
			}

			function setTop( targetTop ) {
				if ( arg.topBlank !== -1 ) {
					targetTop = Math.min( arg.topBlank, targetTop );
				}
				if ( arg.bottomBlank !== -1 ) {
					targetTop = Math.max( bottom - arg.topBlank, targetTop );
				}

				curTop = targetTop;
				move( content, targetTop );
				setScrollBarPos();

				topBlank.visible( targetTop > 0 );
				bottomBlank.visible( targetTop < bottom );

				if ( targetTop > 0 ) {
					move( topBlank, targetTop - scrollSize );
				}
				if ( targetTop < bottom ) {
					move( bottomBlank, targetTop + contentSize );
				}
			}

			var scrollTimer = null;

			function endScrollAnimate() {
				scrollTimer = null;
				scrollEndEvent.trig();
				displayScrollBar( false );
			}

			// 回滚动画
			function moveToTop( targetTop, duration ) {
				var direction = targetTop > curTop;
				scrollTimer = moveAnimate( {
					startPos : curTop,
					endPos : targetTop,
					duration : duration,
					onAnimate : function ( progress ) {
						setTop( progress );
						scrollMoveEvent.trig( {
							direction : direction
						} );
					},
					onEnd : endScrollAnimate
				} );
			}

			// 越界判断
			function beyond( top ) {
				if ( arg.topBlank !== -1 && top >= arg.topBlank ) {
					return true;
				}
				else if ( arg.bottomBlank !== -1 && -top + bottom >= arg.bottomBlank ) {
					return true;
				}
				return false;
			}

			function ScrollLimit( className ) {
				return Switcher( false, function ( val ) {
					val ? content.classList.add( className ) : content.classList.remove( className );
				} );
			}

			// 极限滚动开关
			var scrollLimitTop = ScrollLimit( "scroll-limit-top" ), scrollLimitBottom = ScrollLimit( "scroll-limit-bottom" );
			var disabled = false;

			dragStart( page, content, function ( event ) {
				if ( disabled ) {
					event.preventDefault();
					return;
				}

				if ( scrollTimer !== null ) {
					scrollTimer.stop();
					scrollTimer = null;
				}

				// 触发滚动开始事件
				scrollStartEvent.trig( event );
				displayScrollBar( true ); // 显示滚动条

				event.setMove( function ( targetPos, event ) {
					var direction = event.direction;
					setTop( targetPos );

					scrollLimitTop( direction === Direction.positive && curTop >= 0 );
					scrollLimitBottom( direction === Direction.negative && curTop <= bottom );

					scrollMoveEvent.trig( event );
				} );

				event.onDragEnd( function ( event ) {
					var speed = event.speed * arg.inertial;

					scrollLimitTop( false );
					scrollLimitBottom( false );

					// 顶部回滚
					if ( curTop > 0 ) {
						moveToTop( 0, arg.rollbackDuration );
					}
					// 底部回滚
					else if ( curTop < bottom ) {
						moveToTop( bottom, arg.rollbackDuration );
					}
					// 惯性滚动
					else {
						// 如果速度级别大于0,根据当前方向和速度级别进行惯性滚动
						if ( Math.abs( speed ) > 3 ) {
							var progress = curTop;
							scrollTimer = requestAnimate( function () {
								if ( Math.abs( speed ) < 0.8 || beyond( curTop ) ) {
									scrollTimer.stop();
									// 顶部回滚
									if ( curTop > 0 ) {
										moveToTop( 0, arg.rollbackDuration );
									}
									// 底部回滚
									else if ( curTop < bottom ) {
										moveToTop( bottom, arg.rollbackDuration );
									}
									else {
										endScrollAnimate();
									}
									return;
								}

								progress += speed;

								// 根据当前位置设置阻尼
								if ( !inRange( progress, bottom, 0 ) ) {
									speed = speed * 0.5;
								}
								else {
									speed = speed * 0.95;
								}
								setTop( progress );
								scrollMoveEvent.trig();
							} );
							scrollTimer.start();
						}
						// 否则结束滚动,隐藏滚动条,不触发scrollUp事件
						else {
							scrollEndEvent.trig();
							displayScrollBar( false );
							return;
						}
					}

					scrollUpEvent.trig( {
						stopScrollBack : scrollTimer.stop,
						startScrollBack : scrollTimer.start,
						removeScrollBack : function () {
							scrollTimer.stop();
							displayScrollBar( false );
						}
					} );
				} );
			}, {
				onSenseStart : function () {
					if ( scrollTimer !== null ) {
						// 如果记时中,判断是否滚动到页面外,如果未滚动到页面外,结束计时,调用scrollEnd事件
						scrollTimer.stop();
						if ( curTop <= 0 && curTop + contentSize >= scrollSize ) {
							scrollTimer = null;
							scrollEndEvent.trig();
						}
						displayScrollBar( false );
					}
				},
				onSenseFailure : function () {
					// 如果计时中,继续计时
					if ( scrollTimer !== null ) {
						scrollTimer.start();
					}
				}
			} );

			update();

			return {
				onScrollStart : scrollStartEvent.regist,
				onScrollEnd : scrollEndEvent.regist,
				onScrollMove : scrollMoveEvent.regist,
				onScrollUp : scrollUpEvent.regist,
				disableScroll : Switcher( false, function ( val ) {
				} ),
				scrollTop : function ( val ) {
					if ( val === undefined ) {
						return -curTop;
					}
					else {
						setTop( -val );
					}
				},
				scrollSize : function () {
					return mainSize( content );
				},
				contentSize : function () {
					return mainSize( page );
				},
				update : update,
				stopScroll : function () {
				},
				topBlank : function () {
					return topBlank;
				},
				bottomBlank : function () {
					return bottomBlank;
				}
			}
		}

		ScrollPanel.direction = Direction;
		ScrollPanel.scrollType = ScrollType;

		return ScrollPanel;
	}();

	function SwipeListPanel( page, arg ) {
		var oScrollContent = page.querySelector( ".scroll-content" );
		var pageWidth = page.offsetWidth;

		var head = null, tail = null;

		// 将横屏转换为竖屏
		var curLeft = 0;
		loopArray( page.querySelectorAll( ".scroll-content > .item" ), function ( el, i ) {
			var width = el.offsetWidth;
			css( el, {
				position : "absolute",
				left : curLeft + "px",
				top : 0
			} );
			el.itemIndex = i;
			curLeft += width;

			// 加入到链表中
			el.previousItem = tail;
			el.nextItem = null;
			if ( tail === null ) {
				head = el;
			}
			else {
				tail.nextItem = el;
			}
			tail = el;
		} );
		css( oScrollContent, {
			"width" : curLeft + "px"
		} );

		if ( curLeft < pageWidth ) {
			var oRightBlank = document.createElement( "div" );
			css( oRightBlank, {
				position : "absolute",
				top : 0,
				bottom : 0,
				left : curLeft + "px",
				right : 0
			} );
			page.appendChild( oRightBlank );
			oRightBlank.classList.add( "right-blank" );
		}

		return extend( ScrollPanel( page, extend( {
			topBlank : 0,
			bottomBlank : 0,
			scrollType : ScrollPanel.scrollType.horizontal
		}, arg || {} ) ), {
			headItem : function () {
				return head;
			},
			tailItem : function () {
				return tail;
			}
		} );
	}

	// endregion

	// region 导出
	insert( Z, {
		ScrollPanel : ScrollPanel,
		SwipeListPanel : SwipeListPanel
	} );
	// endregion
})();
