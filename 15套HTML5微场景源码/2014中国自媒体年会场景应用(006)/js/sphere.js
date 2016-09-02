/**
 * Created by 白 on 2014/11/27.
 */
(function () {
	var SwipeRadius = 8;// 扫半径
	var is = (function () {
		var is = {};
		Z.loopArray( ["Array", "Boolean", "Date", "Function", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"], function ( typeName ) {
			is[typeName] = function ( obj ) {
				return Object.prototype.toString.call( obj ) == "[object " + typeName + "]";
			};
		} );
		return is;
	})();

	// 创建一个元素的快捷方式
	function element( arg1, arg2, arg3 ) {
		var el, elementArg = {}, parent = arg3;

		// 如果是<div></div>这种形式,直接制作成元素
		if ( arg1.charAt( 0 ) === "<" ) {
			el = document.createElement( "div" );
			el.innerHTML = arg1;
			el = el.firstElementChild;
		}
		// 否则是div.class1.class2#id这种形式
		else {
			var classIdReg = /([.#][^.#]*)/g, classId;
			el = document.createElement( arg1.split( /[#.]/ )[0] );
			while ( classId = classIdReg.exec( arg1 ) ) {
				classId = classId[0];
				classId.charAt( 0 ) === "#" ? el.id = classId.substring( 1 ) : el.classList.add( classId.substring( 1 ) );
			}
		}

		// 参数2是字符串,作为innerHTML
		if ( is.String( arg2 ) ) {
			el.innerHTML = arg2;
		}
		// 是对象的话,每个字段处理
		else if ( is.Object( arg2 ) ) {
			elementArg = arg2;
		}
		// 如果是数组,视为子元素
		else if ( is.Array( arg2 ) ) {
			elementArg.children = arg2;
		}
		// 否则视为父元素
		else {
			parent = arg2;
		}

		elementArg && Z.loopObj( elementArg, function ( key, value ) {
			if ( value !== undefined ) {
				switch ( key ) {
					case "classList":
						if ( is.String( value ) ) {
							el.classList.add( value );
						}
						else if ( is.Array( value ) ) {
							loopArray( value, function ( className ) {
								el.classList.add( className );
							} );
						}
						break;
					case "css":
						css( el, value );
						break;
					case "children":
						if ( is.Array( value ) ) {
							loopArray( value, function ( node ) {
								el.appendChild( node );
							} );
						}
						else {
							el.appendChild( value );
						}
						break;
					default:
						if ( key.substring( 0, 5 ) === "data-" ) {
							el.setAttribute( key, value );
						}
						else {
							el[key] = value;
						}
						break;
				}
			}
		} );

		parent && parent.appendChild( el );
		return el;
	}

	// 双向链表
	function LinkedList() {
		var head = null, tail = null;

		return {
			head : function () {
				return head;
			},
			tail : function () {
				return tail;
			},
			node : function ( value ) {
				return {
					previous : null,
					next : null,
					value : value
				};
			},
			remove : function ( node ) {
				node.previous ? node.previous.next = node.next : head = node.next;
				node.next ? node.next.previous = node.previous : tail = node.previous;
			},
			insert : function ( tarNode, refNode ) {
				var previous = refNode ? refNode.previous : tail;
				tarNode.next = refNode;
				tarNode.previous = previous;
				previous ? previous.next = tarNode : head = tarNode;
				refNode ? refNode.previous = tarNode : tail = tarNode;
				return tarNode;
			}
		};
	}

	LinkedList.loop = function ( list, func ) {
		var retVal;
		for ( var cur = list.head(); cur !== null; cur = cur.next ) {
			if ( ( retVal = func( cur.value, cur ) ) !== undefined ) {
				return retVal;
			}
		}
	};

	LinkedList.toArray = function ( list ) {
		var arr = [];
		LinkedList.loop( list, function ( value ) {
			arr.push( value );
		} );
		return arr;
	};

	// 事件
	function Event() {
		var events = LinkedList();
		return {
			trig : function () {
				var arg = arguments;
				LinkedList.loop( events, function ( task ) {
					task.apply( null, arg );
				} );
			},
			regist : function ( value ) {
				var node = events.insert( events.node( value ), null );
				return {
					remove : function () {
						events.remove( node );
					}
				};
			}
		};
	}

	function bindEvent( el, eventType, response, isCapture ) {
		var remove;

		if ( el.addEventListener ) {
			el.addEventListener( eventType, response, isCapture || false );
			remove = function () {
				el.removeEventListener( eventType, response, isCapture || false );
			};
		}
		else {
			el.attachEvent( "on" + eventType, response );
			remove = function () {
				el.detachEvent( "on" + eventType, response );
			};
		}

		return {
			remove : remove
		};
	}

	function onPointerUp( el, callback, bubble ) {
		return bindEvent( el, ua.canTouch ? "touchend" : "mouseup", callback, bubble );
	}

	// onPointerDown事件,统一光标事件和触摸事件
	function onPointerDown( area, response ) {
		if ( area.onTouchStart || area.onCursorDown ) {
			return ( ua.canTouch ? area.onTouchDown : area.onCursorDown )( response );
		}
		else {
			function bind( startEventName, moveEventName, endEventName ) {
				return bindEvent( area, startEventName, function ( event ) {
					var pageX = event.zPageX, pageY = event.zPageY,
						moveEvent = Event(), upEvent = Event();

					var moveHandle = bindEvent( document, moveEventName, function ( event ) {
						pageX = event.zPageX;
						pageY = event.zPageY;

						// 将move事件和end事件的注册指令添加到event中
						event.onMove = moveEvent.regist;
						event.onUp = upEvent.regist;

						moveEvent.trig( event, pageX, pageY );
					} );

					var endHandle = bindEvent( document, endEventName, function ( event ) {
						upEvent.trig( event, pageX, pageY );
						moveHandle.remove();
						endHandle.remove();
					} );

					// 将move事件和end事件的注册指令添加到event中
					event.onMove = moveEvent.regist;
					event.onUp = upEvent.regist;
					response( event, pageX, pageY );
				} );
			}

			return ua.canTouch ? bind( "touchstart", "touchmove", "touchend" ) : bind( "mousedown", "mousemove", "mouseup" );
		}
	}

	var loopArray = Z.loopArray,
		insert = Z.insert,
		loop = Z.loop,
		css = Z.css,
		onTap = Z.onTap,
		px = function ( value ) {
			return value === 0 ? 0 : value + "px";
		},
		ua = Z.ua,

		sphereRadius, // 球半径
		sphereData; // 球的数据

	css.size = function ( el, width, height ) {
		css( el, {
			width : width + "px",
			height : height + "px"
		} );
	};
	// 将一个元组转化为字符串
	function tupleString( tupleName, list ) {
		return tupleName + "(" + list.join( "," ) + ")";
	}

	css.transform = function () {
		var style = [];
		loopArray( arguments, function ( transform, i ) {
			i !== 0 && style.push( transform );
		} );
		css( arguments[0], "transform", style.join( " " ) );
	};

	function n( n ) {
		return Math.abs( n ) < 0.01 ? 0 : n;
	}

	css.translate = function ( x, y, z ) {
		return tupleString( "translate3d", [n( x ) + "px", n( y ) + "px", n( z ) + "px"] );
	};
	css.scale = function () {
		return "scale(" + Array.prototype.join.call( arguments, "," ) + ")";
	};

	insert( ua, {
		iphone4 : ua.iphone && screen.height === 480,
		iphone5 : ua.iphone && screen.height === 568,
		iphone6 : ua.iphone && screen.height > 568
	} );

	// region 3d变换
	function eye() {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	function rotateX( angle ) {
		var sina = Math.sin( angle ), cosa = Math.cos( angle );
		return [
			1, 0, 0, 0,
			0, cosa, -sina, 0,
			0, sina, cosa, 0,
			0, 0, 0, 1
		];
	}

	function rotateY( angle ) {
		var sina = Math.sin( angle ), cosa = Math.cos( angle );
		return [
			cosa, 0, sina, 0,
			0, 1, 0, 0,
			-sina, 0, cosa, 0,
			0, 0, 0, 1
		];
	}

	function vec4_mat4x4_r( src, row ) {
		var rst = new Array( 4 );
		var offset = row * 4;
		loop( 4, function ( i ) {
			rst[i] = src[offset + i];
		} );
		return rst;
	}

	function vec4_mat4x4_c( src, col ) {
		var rst = new Array( 4 );
		loop( 4, function ( i ) {
			rst[i] = src[i * 4 + col];
		} );
		return rst;
	}

	function dot_vec4_vec4( l, r ) {
		var rt = 0.0;
		loop( 4, function ( i ) {
			rt += l[i] * r[i];
		} );
		return rt;
	}

	function mat4x4_vec4_4_c( src ) {
		var dest = new Array( 16 );
		loop( 4, function ( r ) {
			var offset = r * 4;
			loop( 4, function ( c ) {
				dest[offset + c] = src[c][r];
			} );
		} );
		return dest;
	}

	function mul_mat4x4_vec4( mat, vec ) {
		var rtv = new Array( 4 );
		loop( 4, function ( i ) {
			rtv[i] = dot_vec4_vec4( vec4_mat4x4_r( mat, i ), vec );
		} );
		return rtv;
	}

	function combine( l, r ) {
		var cols = new Array( 4 );
		loop( 4, function ( i ) {
			cols[i] = mul_mat4x4_vec4( l, vec4_mat4x4_c( r, i ) );
		} );
		return mat4x4_vec4_4_c( cols );
	}

	function rotate( matrix, x, y ) {
		return combine( combine( matrix, rotateX( y ) ), rotateY( -x ) );
	}

	function trans_mat4x4( src ) {
		var rows = new Array( 4 );
		loop( 4, function ( i ) {
			rows[i] = vec4_mat4x4_r( src, i );
		} );
		return mat4x4_vec4_4_c( rows );
	}

	function transform( matrix, vec ) {
		return mul_mat4x4_vec4( trans_mat4x4( matrix ), vec );
	}

	// endregion

	// region 球
	function makeSphere( fragments, r, doFragment ) {
		var data = [
			0.7623577990635768,
			0.3083251657260024,
			-0.568986975586412,
			0.8775183418402467,
			-0.2953121248763029,
			-0.37782576491682895,
			0.14220400694862798,
			0.36554229950395606,
			-0.9198678425084306,
			-0.007935130481616249,
			0.99996851635651,
			-3.685464294963838e-16,
			0.2771796259627252,
			-0.7416031098856175,
			-0.6108979312120354,
			0.4712279125067833,
			-0.1833180383880958,
			-0.862750688945561,
			0.10796498113790386,
			0.30313230983950673,
			0.9468127405032409,
			-0.5137529514094382,
			0.18298058603143774,
			0.8381980732820157,
			0.3992996357642775,
			-0.7406340411636113,
			0.5403896908233663,
			-0.7211644647895409,
			-0.37013657092502356,
			0.5855943421761179,
			-0.6587733062935752,
			-0.7490302523612281,
			0.07050824038866983,
			0.24062651818787278,
			0.7955510642607795,
			0.5560551977082154,
			0.6113022021013235,
			-0.788790685862905,
			-0.06417843564625668,
			0.8720432131220213,
			-0.3574938620779445,
			0.3342735003323128,
			0.9805280292184504,
			0.19483827391213496,
			0.024552615663545295,
			-0.35178332974586846,
			-0.7964331358352397,
			-0.49187676206195835,
			-0.7623577990635767,
			-0.30832516572600294,
			-0.568986975586412,
			-0.8775183418402467,
			0.29531212487630265,
			-0.3778257649168293,
			-0.1422040069486279,
			-0.36554229950395667,
			-0.9198678425084303,
			0.007935130481616249,
			-0.99996851635651,
			2.648737386723612e-16,
			-0.2771796259627251,
			0.7416031098856171,
			-0.610897931212036,
			-0.4712279125067833,
			0.18331803838809527,
			-0.8627506889455612,
			-0.10796498113790373,
			-0.3031323098395063,
			0.9468127405032412,
			0.5137529514094384,
			-0.18298058603143713,
			0.8381980732820156,
			-0.3992996357642776,
			0.7406340411636116,
			0.540389690823366,
			0.721164464789541,
			0.37013657092502394,
			0.5855943421761175,
			0.6587733062935751,
			0.7490302523612281,
			0.07050824038866935,
			-0.24062651818787256,
			-0.7955510642607793,
			0.556055197708216,
			-0.6113022021013236,
			0.788790685862905,
			-0.06417843564625716,
			-0.8720432131220212,
			0.35749386207794465,
			0.3342735003323128,
			-0.9805280292184504,
			-0.194838273912135,
			0.024552615663545493,
			0.35178332974586857,
			0.7964331358352392,
			-0.4918767620619589
		];
		loopArray( fragments, function ( fragment, i ) {
			fragment.spherePosition = [data[i * 3] * r, data[i * 3 + 1] * r, data[i * 3 + 2] * r, 1]; // 碎片的球面位置
			doFragment && doFragment( fragment );
		} );
	}

	// endregion
	sphereRadius = document.querySelector( "#layout" ).offsetHeight * 0.1969;

	// 计算图片cover指定宽高的style
	function getImageCoverStyle( img, dWidth, dHeight ) {
		var dRatio = dWidth / dHeight,
			nWidth = img.naturalWidth || img.width || img.clientWidth,
			nHeight = img.naturalHeight || img.height || img.clientHeight,
			nRatio = nWidth / nHeight,
			style = {
				position : "absolute"
			};

		// 计算居中缩放
		if ( dRatio < nRatio ) {
			style.height = px( dHeight );
			style.left = px( ( dWidth - dHeight / nHeight * nWidth) / 2 << 0 );
			style.top = 0;
		}
		else {
			style.width = px( dWidth );
			style.left = 0;
			style.top = px( ( dHeight - dWidth / nWidth * nHeight ) / 2 << 0 );
		}

		return style;
	}


	// 平方和
	function sumOfSquares( x, y ) {
		return x * x + y * y;
	}

	// 一般的senser,判断是否超出圆
	function outCircle( event ) {
		return sumOfSquares( event.distanceX, event.distanceY ) > SwipeRadius * SwipeRadius ? true : undefined;
	}

	// sense事件,根据触摸是否到达了阈值判断是否触发响应
	function sense( area, arg ) {
		return onPointerDown( area, function ( event, startX, startY ) {
			arg.onSenseStart && arg.onSenseStart( event );

			// 抬起时的失败事件
			var senseFailureHandle = event.onUp( function ( event ) {
				arg.onSenseFailure && arg.onSenseFailure( event );
			} );

			var senseHandle = event.onMove( function ( event, pageX, pageY ) {
				// 判断是否移动到了sense阈值,如果移动到了,停止判断,触发senseTrue响应
				event.distanceX = pageX - startX;
				event.distanceY = pageY - startY;

				var result = arg.isOut( event );
				if ( result !== undefined ) {
					// 移除sense事件和senseFailure事件,并触发senseTrue响应
					senseHandle.remove();
					senseFailureHandle.remove();
					result && arg.onSenseSuccess && arg.onSenseSuccess( event, pageX, pageY );
				}
			} );
		} );
	}

	// 根据一个out判断生成拖动事件
	function Drag( isOut ) {
		return function ( area, dragStart ) {
			return sense( area, {
				isOut : isOut,
				onSenseSuccess : function ( event, pageX, pageY ) {
					function Track( initialDistance, lastPos ) {
						var lastDirection = initialDistance === 0 ? undefined : initialDistance > 0, track = [], trackTime = 0,
							lastTime = +new Date(),
							startPos = lastPos;

						return {
							// 去抖动
							test : function ( curPos ) {
								return lastDirection === undefined || !( ( curPos - lastPos ) * ( lastDirection ? 1 : -1 ) < -20 );
							},
							track : function ( curPos ) {
								curPos = curPos || lastPos;

								// 计算目标位置和当前方向
								var curTime = +new Date(),
									duration = curTime - lastTime,
									curDirection = curPos === lastPos ? lastDirection : curPos > lastPos;

								if ( curDirection !== lastDirection || duration > 200 ) {
									// 如果转向或者两次移动时间间隔超过200毫秒,重新计时
									track = [];
									trackTime = 0;
								}
								else {
									// 如果一次移动大于200,清空记录
									if ( duration > 200 ) {
										track = [];
										trackTime = 0;
									}
									else {
										trackTime += duration;

										// 如果记录时间超过300毫秒,移除头部部分记录,使其减少到300毫秒
										while ( trackTime > 300 ) {
											trackTime -= track.shift().duration;
										}

										track.push( {
											duration : duration,
											distance : curPos - lastPos
										} );
									}
								}

								// 更新数据
								lastDirection = curDirection;
								lastPos = curPos;
								lastTime = curTime;
							},
							distance : function () {
								return lastPos - startPos + initialDistance;
							},
							direction : function () {
								return lastDirection;
							},
							speed : function () {
								var totalDiff = 0;
								loopArray( track, function ( unit ) {
									totalDiff += unit.distance;
								} );
								return trackTime === 0 ? 0 : ( totalDiff + 0 ) / trackTime;
							}
						};
					}

					var startTime = new Date(),
						dragMoveEvent = Event(), // 拖拽移动事件
						dragEndEvent = Event(), // 拖拽停止事件
						trackX = Track( event.distanceX, pageX ),
						trackY = Track( event.distanceY, pageY );

					function dragInfo() {
						return {
							distanceX : trackX.distance(),
							distanceY : trackY.distance(),
							directionX : trackX.direction(),
							directionY : trackY.direction()
						}
					}

					// 拖动开始回调
					dragStart( insert( dragInfo(), {
						onDragEnd : dragEndEvent.regist,
						onDragMove : dragMoveEvent.regist
					} ) );

					event.onMove( function ( event, pageX, pageY ) {
						if ( trackX.test( pageX ) && trackY.test( pageY ) ) {
							trackX.track( pageX );
							trackY.track( pageY );

							dragMoveEvent.trig( dragInfo() );
						}
					} );

					event.onUp( function () {
						trackX.track();
						trackY.track();

						// 触发拖动结束事件
						dragEndEvent.trig( insert( dragInfo(), {
							speedX : trackX.speed(),
							speedY : trackY.speed(),
							duration : +new Date() - startTime
						} ) );
					} );
				}
			} );
		};
	}

	var onDrag = Drag( outCircle );

	function getDirection( x, y ) {
		var v = Math.sqrt( x * x + y * y );
		return [x / v, y / v];
	}

	function CommentWall( parent, commentData ) {
		var fragmentSize = 25 / 504 * document.querySelector( "#layout" ).offsetHeight, // 碎片的尺寸

			sphereParent = element( "div.sphere-parent", parent ),
			tipsParent = element( "div.tips-parent", parent ),
			sphere = element( "div.sphere", sphereParent ),

			radius = sphereRadius,
			fragments = [],

			noNewTips = false, // 没有新的提示
			tipsNum = 0, // 弹框数量
			curMatrix = null, // 变换矩阵
			curDirection = getDirection( Math.random(), Math.random() ), // 转动方向
			toV = 0.003, curV = toV, // 当前速度和目标速度
			animateHandle = null;
		loopArray( [sphereParent, tipsParent], function ( parent ) {
			css( parent, {
				height : px( radius * 2 ),
				width : px( radius * 2 ),
				"margin-left" : px( -radius )
			} );
		} );
		css.size( sphere, radius * 2, radius * 2 );

		onPointerDown( parent, function ( event ) {
			event.preventDefault();
		} );

		// 当元素插入到文档时回调
		function onInsert( el, response ) {
			if ( document.documentElement.contains( el ) ) {
				response && response();
			}
			else {
				var insertEvent = bindEvent( el, "DOMNodeInsertedIntoDocument", function () {
					response && response( el );
					insertEvent.remove();
				} );
			}
		}

		// 设置碎片的评论
		function CommentFragment( comment, onLoad ) {
			var fragment = element( "div.item" ),
				img = new Image();

			img.onload = function () {
				onInsert( img, function () {
					css( img, getImageCoverStyle( img, fragmentSize, fragmentSize ) );
				} );
				fragment.appendChild( img );
				onLoad && onLoad();
			};
			img.src = comment.avatar;
			fragment.comment = comment;

			// 弹出提示,有缩放效果
			fragment.showTips = function () {
				Tips( fragment, {
					scale : false
				} );
				++tipsNum;
			};

			return fragment;
		}

		loopArray( commentData, function ( commentInfo ) {
			var fragment = CommentFragment( commentInfo );
			sphere.appendChild( fragment );
			fragments.push( fragment );
		} );

		makeSphere( fragments, radius );

		// 对球进行变换
		function transformSphere( matrix ) {
			curMatrix = matrix;

			// 计算并设置每个碎片变换后的位置
			loopArray( fragments, function ( fragment ) {
				css.transform( fragment, css.translate.apply( null, fragment.position = transform( curMatrix, fragment.spherePosition ) ) );
			} );
		}

		// 提示框
		function Tips( fragment, arg ) {
			arg = arg || {};
			var position = fragment.position,
				comment = fragment.comment,
				tips = element( "div.tips", {
					children : [
						element( "div.name", comment.name ),
						element( "div.duty", comment.duty )
					]
				}, tipsParent ),
				tipsTriangle = element( "div.triangle", tips ),

				tipsX = Math.min( position[0] + 40, ( document.querySelector( "#layout" ).offsetWidth - tips.offsetWidth ) / 2 - 28 ),
				relativeX = tipsX - position[0],
				relativeY = -tips.offsetHeight / 2 - 25,

				scale = arg.scale ? 0.01 : 1,
				onFrame = arg.scale ? function () {
					if ( scale !== 1 ) {
						scale = Math.min( 1, scale + 0.08 );
					}
					else {
						onFrame = null;
					}
				} : null;

			// 小头像
			var avatar = new Image();
			avatar.src = comment.avatar;
			avatar.classList.add( "avatar" );
			tips.appendChild( avatar );

			css( tips, {
				"margin-top" : px( -tips.offsetHeight / 2 ),
				"-webkit-transform-origin" : [px( position[0] + 40 - tipsX + 15 ), "100%", 0].join( " " ),
				visibility : "hidden"
			} );
			css( tipsTriangle, "left", px( position[0] + 40 - tipsX + 15 ) );

			function adjust() {
				onFrame && onFrame();
				position = fragment.position;
				css( tips, "visibility", "visible" );
				css.transform( tips, css.translate( position[0] + relativeX, position[1] + relativeY, position[2] ), css.scale( scale ) );
			}

			tips.fragment = fragment;
			fragment.tips = tips;

			function remove() {
				onFrame = null;
				fragment.tips = null;
				Z.removeNode( tips );
			}

			return insert( tips, {
				adjust : adjust,
				remove : function ( canScale, onEnd ) {
					if ( canScale ) {
						onFrame = function () {
							scale -= 0.08;
							if ( scale < 0.01 ) {
								remove();
								scale = 0.01;
								onEnd && onEnd();
							}
						};
					}
					else {
						remove();
					}
				}
			} );
		}

		// 请求连续动画
		var requestAnimate = function () {
			var timeout = null, tasks = LinkedList();

			return function ( task ) {
				var node = null;

				function start() {
					// 如果任务没有添加进链表,添加到链表中
					if ( node === null ) {
						node = tasks.insert( tasks.node( task ), null );

						// 如果当前没有计时,开始计时
						if ( timeout === null ) {
							timeout = setTimeout( function frame() {
								var cur;
								if ( tasks.tail() !== null ) {
									timeout = setTimeout( frame, 1000 / 60 );
									for ( cur = tasks.head(); cur !== null; cur = cur.next ) {
										cur.value();
									}
								}
								else {
									timeout = null;
								}
							}, 1000 / 60 );
						}
					}
				}

				start();

				return {
					start : start,
					remove : function () {
						node && tasks.remove( node );
						node = null;
					}
				};
			};
		}();

		// 旋转动画
		function runRotateAnimate() {
			var count = 0;
			animateHandle && animateHandle.remove();
			animateHandle = requestAnimate( function () {
				curV = curV + ( toV - curV ) / 20; // 速度逼近toV
				transformSphere( rotate( curMatrix, curDirection[0] * curV, curDirection[1] * curV ) ); // 旋转球体

				// 当动画运行20帧,并且速度稳定时,开始弹窗
				if ( ++count > 20 && Math.abs( curV - toV ) < 0.001 ) {
					var showTips = false; // 一次移动最多触发一个弹出提示
					loopArray( fragments, function ( fragment ) {
						// 如果碎片有提示,调整它
						if ( fragment.tips ) {
							fragment.tips.adjust();
						}

						// 根据碎片的Z轴位置,调整它的in位
						// 如果一个碎片由非in转为in,根据随机数和当前的数量,决定它是否弹出提示
						if ( !fragment.isIn && fragment.position[2] > radius * 0.85 ) {
							var random = Math.random();
							fragment.isIn = true;
							if ( !noNewTips && !showTips &&
								( tipsNum === 0 && random < 0.9 || tipsNum === 1 && random < 0.4 || tipsNum < 2 && random < 0.2 ) ) {
								fragment.showTips();
								showTips = true;
							}
						}
						// 如果一个碎片由in转为非in,如果有提示,移除它
						else if ( fragment.isIn && fragment.position[2] < radius * 0.85 ) {
							fragment.isIn = false;
							if ( fragment.tips ) {
								fragment.tips.remove( true, function () {
									--tipsNum;
								} );
							}
						}
					} );
				}
			} );
		}

		function stopRotateAnimate() {
			curV = toV;
			animateHandle && animateHandle.remove();
		}

		// 移除所有提示
		function removeTips( delay ) {
			tipsNum = 0;
			loopArray( fragments, function ( fragment ) {
				fragment.isIn = false;
				if ( fragment.tips ) {
					fragment.tips.remove();
				}
			} );

			if ( delay ) {
				noNewTips = true;
				setTimeout( function () {
					noNewTips = false;
				}, delay );
			}
		}

		// 拖拽旋转球体
		onDrag( sphereParent, function ( event ) {
			var startMatrix = curMatrix;

			sphereParent.classList.add( "lock" );
			animateHandle.remove();
			removeTips();

			event.onDragMove( function ( event ) {
				transformSphere( rotate( startMatrix, event.distanceX / 200, event.distanceY / 200 ) );
			} );

			event.onDragEnd( function ( event ) {
				var vx = event.speedX, vy = event.speedY,
					v = Math.sqrt( vx * vx + vy * vy );

				sphereParent.classList.remove( "lock" );

				curV = v / 10;
				if ( curV !== 0 ) {
					curDirection = [vx / v, vy / v];
				}
				runRotateAnimate();
			} );
		} );

		// 点击碎片弹出提示,点击时停止旋转动画,再次触摸屏幕时启动旋转动画
		loopArray( fragments, function ( fragment ) {
			onTap( fragment, function () {
				if ( fragment.position[2] > radius * 0.2 ) {
					animateHandle.remove();
					removeTips();

					var tips = Tips( fragment ),
						removeHandler = onPointerUp( document, function () {
							removeHandler.remove();
							tips.remove();
							runRotateAnimate();
						}, true );

					tips.adjust();
				}
			} );
		} );

		transformSphere( eye() ); // 进行单位变换

		return insert( parent, {
			fragments : fragments,
			runAnimate : runRotateAnimate,
			stopAnimate : stopRotateAnimate,
			removeTips : removeTips
		} );
	}

	window.sp = {
		onPointerDown : onPointerDown,
		commentWall : CommentWall,
		element : element
	};
	// endregion
})();