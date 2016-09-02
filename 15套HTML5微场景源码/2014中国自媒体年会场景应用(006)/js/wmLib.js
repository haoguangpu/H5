/**
 * Created by Json on 2014/8/1.
 */
(function () {
	var scale = Z.TupleString( "scale" ), translate3d = Z.TupleString( "translate3d" ),
		Loader = Z.Loader,
		doNodeByAttribute = Z.doNodeByAttribute,
		cloud7 = {};

	window.template = Z.HTMLTemplate( document.getElementById( "template" ) );

	cloud7.offline = true;
	function setRatio( node, ratioString, onParse ) {
		var ratio = ratioString === undefined ? 0 : ratioString.split( ":" );
		Z.onInsert( node, function () {
			var width = node.clientWidth;
			var height = ratio === 0 ? node.clientHeight : width / parseInt( ratio[0], 10 ) * parseInt( ratio[1], 10 ) + 0.5 << 0;
			ratio !== 0 && Z.css( node, "height", height + "px" );
			onParse && onParse( width, height );
		} );
	}

	// 图片字段
	function FieldImg( onParse ) {
		return function ( node, value, data ) {
			var pathRatio = value.split( " " ),
				src = data[pathRatio[0]];

			if ( src === undefined ) {
				node.classList.add( "no-img" );
			}
			setRatio( node, pathRatio[1], function ( width, height ) {
				onParse( node.querySelector( "img" ), src, width, height );
			} );
		};
	}

	template.addHandler( {
		img : FieldImg( centerImg )
	} );


	function onImgLoad( node, func ) {
		Z.onImgLoad( node, function ( event ) {
			cloud7.offline ? setTimeout( function () {
				func( event );
			}, 500 ) : func( event );
		} );
	}

	// 居中剪裁一个图片
	function centerImg( node, src, dWidth, dHeight, doParent, onLoad ) {
		var wrapper = node.parentNode;
		doParent && Z.css( wrapper, {
			width : dWidth + "px",
			height : dHeight + "px"
		} );
		wrapper.classList.add( "cloud7-img-wrapper" );
		wrapper.classList.add( "loading" );

		// 根据不同的尺寸,给予不同的loading图
		var size = "normal";
		if ( dWidth < 80 || dHeight < 60 ) {
			size = "small";
			if ( dWidth < 50 || dHeight < 40 ) {
				size = "mini";
			}
		}
		wrapper.classList.add( size );

		function setPos( left, top ) {
			Z.css( node, {
				position : "absolute",
				left : left + "px",
				top : top + "px",
				display : "block"
			} );
		}

		if ( src ) {
			onImgLoad( node, function () {
				var dRatio = dWidth / dHeight;
				var nWidth = node.naturalWidth || node.width, nHeight = node.naturalHeight || node.height, nRatio = nWidth / nHeight;

				// 计算居中缩放
				if ( dRatio > nRatio ) {
					Z.css( node, "width", dWidth + "px" );
					setPos( 0, (dHeight - dWidth / nWidth * nHeight) / 2 << 0 );
				}
				else {
					Z.css( node, "height", dHeight + "px" );
					setPos( (dWidth - dHeight / nHeight * nWidth) / 2 << 0, 0 );
				}

				Z.toggleState( wrapper, "loading", "load-done" );
				onLoad && onLoad();
			} );
			node.src = src;
		}
	}

	// 滑动图片加载
	function doSlideImgLoad( panel, index ) {
		function loadImage( index, numToLoad ) {
			if ( numToLoad === 0 ) {
				return;
			}

			var node = panel.item( index );
			if ( node && node.querySelector( "[data-slide-src]" ) ) {
				// 图片装载器
				var imgLoader = Loader();

				// 取出本项所有的图片,开始图片加载
				doNodeByAttribute( node, "data-slide-src", function ( img, attr ) {
					var attrParts = attr.split( " " );
					var src = attrParts[0], size = attrParts[1] ? attrParts[1].split( "-" ) : null;

					// 如果有居中属性,使用CenterImg进行居中,否则直接设置src属性
					if ( size ) {
						centerImg( img, src, parseInt( size[0], 10 ), parseInt( size[1], 10 ), false );
					}
					else {
						img.src = cloud7.imgBySize( src, panel.offsetWidth, 0 );
					}

					imgLoader.load( function ( done ) {
						onImgLoad( img, done );
					} );
				} );

				// 当本项的图片加载完毕后,加载下一项
				imgLoader.onLoad( function () {
					loadImage( index + 1, --numToLoad );
					loadImage( index - 1, numToLoad );
				} );
				imgLoader.start();
			}
			else {
				loadImage( index + 1, --numToLoad );
				loadImage( index - 1, numToLoad );
			}
		}

		panel.onCutTo( function ( event ) {
			loadImage( event.curIndex, 3 );
		} );

		index !== undefined && panel.display( 0 );

		return panel;
	}

	// 制作滑动列表的红点
	function doRedPoints( slideListPanel, redPointsWrapper ) {
		redPointsWrapper = redPointsWrapper || slideListPanel.querySelector( ".red-point .wrapper" ); // 红点容器
		var redPoints = [], curPoint = null; // 红点和当前红点

		Z.loop( slideListPanel.length(), function ( i ) {
			// 创建红点
			var redPoint = document.createElement( "span" );
			redPointsWrapper.appendChild( redPoint );
			redPoints.push( redPoint );
			Z.onTap( redPoint, function () {
				slideListPanel.display( i );
			} );
		} );

		slideListPanel.onCutTo( function ( event ) {
			curPoint && curPoint.classList.remove( "active" );
			curPoint = redPoints[event.curIndex];
			curPoint.classList.add( "active" );
		} );
	}

	// 横幅轮播图,定时,循环
	function BannerList( templateId, data, parent, doTemplate, redPointsWrapper ) {
		// 填充数据,构建图片延迟加载轮播图
		template.makeList( templateId, data, parent.querySelector( "ul" ), doTemplate );
		var slideListPanel = doSlideImgLoad( Z.SlideListPanel( parent, {
			cycle : true
		} ) );

		// 处理红点
		redPointsWrapper !== null && doRedPoints( slideListPanel, redPointsWrapper );

		// 定时轮播
		var timeout = null;
		// 开始滑动时不轮播
		slideListPanel.onSlideStart( function () {
			timeout && clearTimeout( timeout );
		} );

		// 滑动完成后就开始轮播
		slideListPanel.onCutTo( function () {
			// 如果只有一张图的话，则不进行轮播
			if ( data.length == 1 ) {
				return;
			}
			timeout && clearTimeout( timeout );
			timeout = setTimeout( function () {
				if ( Z.inDocument( slideListPanel ) ) {
					slideListPanel.cutRight();
				}
				else {
					Z.onInsert( slideListPanel, function () {
						setTimeout( slideListPanel.cutRight, 3000 );
					} );
				}
			}, 3000 );
		} );

		var doAnimate = function () {
			timeout && clearTimeout( timeout );
			slideListPanel.display( 0 );
		};

		return {
			slideListPanel : slideListPanel,
			start : doAnimate,
			stop : function () {
				timeout && clearTimeout( timeout );
			}
		};
	}

	function lock( flag ) {
		Z.switchClass( document.body, "lock", flag );
	}

	var endAction = {
		isExecute : false
	};

	function ScreenSystem( layout ) {
		var layoutHeight = layout.offsetHeight;
		var pages = [];
		var isToEnd = false; // 是否到过最后一张,如果没到过,不能从第一张直接切换到最后一张
		var curIndex = 0;

		Z.loopArray( layout.querySelectorAll( ".page" ), function ( page, i ) {
			page.index = i;
			pages.push( page );
			Z.removeNode( page );
		} );

		function getPage( index ) {
			index = ( index + pages.length ) % pages.length;
			return pages[index];
		}

		Z.onDragV( layout, layout, function ( event ) {
			var curPage = getPage( curIndex );
			var prePage = getPage( curIndex - 1 );
			var nextPage = getPage( curIndex + 1 );

			endAction.isExecute = false;
			layout.appendChild( prePage );
			layout.appendChild( nextPage );
			Z.translate( nextPage, 0, layoutHeight );
			Z.translate( prePage, 0, -layoutHeight );

			// 设置z-index,当前张最低
			Z.css( curPage, "z-index", 0 );
			Z.loopArray( [prePage, nextPage], function ( page ) {
				Z.css( page, "z-index", 1 );
			} );

			function rangeTargetPos( targetPos ) {
				return curIndex === 0 && targetPos > 0 && !isToEnd ? 0 : Z.range( targetPos, -layoutHeight, layoutHeight );
			}

			function move( targetPos ) {
				targetPos = rangeTargetPos( targetPos );

				var ratio = Math.abs( targetPos ) / layoutHeight / 3;
				Z.css( curPage, "transform", [scale( 1 - ratio ),
					translate3d( 0, targetPos < 0 ? -layoutHeight * ratio + "px" : -layoutHeight * ratio + targetPos + "px", 0 )].join( " " ) );
				Z.translate( nextPage, 0, layoutHeight + targetPos );
				Z.translate( prePage, 0, targetPos - layoutHeight );
			}

			event.setMove( move );
			event.onDragEnd( function ( event ) {
				if ( endAction.isExecute ) {
					return;
				}
				// 锁屏
				lock( true );

				// 计算比例,根据比例选择切到哪页
				var ratio = rangeTargetPos( event.targetPos ) / layoutHeight;
				ratio += event.speed > 0 ? 0.5 : -0.5;
				var sign = ratio <= -0.5 ? -1 : ratio <= 0.5 ? 0 : 1;

				Z.moveAnimate( {
					startPos : event.targetPos,
					endPos : sign * layoutHeight,
					duration : 0.2,
					onAnimate : move,
					onEnd : function () {
						curIndex = ( ( curIndex + -sign ) + pages.length ) % pages.length;
						// 仅将当且页留在DOM中,删除其他页
						Z.loopArray( [curPage, prePage, nextPage], function ( page ) {
							if ( page.index !== curIndex ) {
								page.onRemove && page.onRemove();
								Z.removeNode( page );
							}
							else {
								page.onCut && page.onCut();
							}
						} );

						if ( curIndex === pages.length - 1 ) {
							isToEnd = true;
						}
						// 结束锁屏
						lock( false );
					}
				} );

				endAction.isExecute = true;

			} );
		} );
		layout.appendChild( pages[0] );
		pages[0].onCut && pages[0].onCut();
		return {
			isToEnd : function () {
				return isToEnd;
			}
		}
	}

	window.lib = {
		ScreenSystem : ScreenSystem,
		BannerList : BannerList
	}
})();