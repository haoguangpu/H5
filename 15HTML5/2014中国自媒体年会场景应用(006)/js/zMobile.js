/**
 * Created with JetBrains WebStorm.
 * User: Zuobai
 * Date: 13-8-9
 * Time: 上午11:38
 * To change this template use File | Settings | File Templates.
 */

(function () {
	// region 浏览器检测
	var ua = function ( ua, appVersion, platform ) {
		var canTouch = ("ontouchstart" in document) || (window.DocumentTouch && document instanceof DocumentTouch);
		if ( (/Chrome/gi).test( ua ) && (platform === "Win32") ) {
			canTouch = false;
		}

		return {
			// win系列
			win32 : platform === "Win32",
			ie : /MSIE ([^;]+)/.test( ua ),
			ieMobile : window.navigator.msPointerEnabled,
			ieVersion : Math.floor( (/MSIE ([^;]+)/.exec( ua ) || [0, "0"])[1] ),

			// ios系列
			ios : (/iphone|ipad/gi).test( appVersion ),
			iphone : (/iphone/gi).test( appVersion ),
			ipad : (/ipad/gi).test( appVersion ),
			iosVersion : parseFloat( ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec( ua ) || [0, ''])[1])
				.replace( 'undefined', '3_2' ).replace( '_', '.' ).replace( '_', '' ) ) || false,
			safari : /Version\//gi.test( appVersion ) && /Safari/gi.test( appVersion ),
			uiWebView : /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test( ua ),

			// 安卓系列
			android : (/android/gi).test( appVersion ),
			androidVersion : parseFloat( "" + (/android ([0-9\.]*)/i.exec( ua ) || [0, ''])[1] ),

			// chrome
			chrome : /Chrome/gi.test( ua ),
			chromeVersion : parseInt( (/Chrome\/([0-9]*)/gi.exec( ua ) || [0, 0])[1], 10 ),

			// 内核
			webkit : /AppleWebKit/.test( appVersion ),

			// 其他浏览器
			uc : appVersion.indexOf( "UCBrowser" ) !== -1,
			Browser : / Browser/gi.test( appVersion ),
			MiuiBrowser : /MiuiBrowser/gi.test( appVersion ),

			// 微信
			MicroMessenger : ua.toLowerCase().match( /MicroMessenger/i ) == "micromessenger",

			// 其他
			canTouch : canTouch
		};
	}( navigator.userAgent, navigator.appVersion, navigator.platform );
	// endregion

	// region 常量
	var SwipeRadius = 5, // 扫半径
		HMoveRatio = 0.5; // 横向移动比例

	// 方向
	var Direction = {
		positive : true,
		negative : false
	};
	// endregion

	// region util
	// 运行脚本
	function run( str ) {
		new Function( str )();
	}

	// 判断x是否在[a,b)或[b,a)区间内
	function inRange( x, a, b ) {
		if ( a <= b ) {
			return x >= a && x < b;
		}
		else {
			return inRange( x, b, a );
		}
	}

	// 将x限制在[a,b]或[b,a]内
	function range( x, a, b ) {
		if ( a <= b ) {
			return x < a ? a : x > b ? b : x;
		}
		else {
			return range( x, b, a );
		}
	}

	// 平方函数
	function square( x ) {
		return x * x;
	}

	// 循环
	function loop( t, block ) {
		for ( var i = 0; i !== t; ++i ) {
			block( i );
		}
	}

	// 遍历数组
	function loopArray( list, block ) {
		var retVal;
		for ( var i = 0, len = list.length; i !== len; ++i ) {
			if ( (retVal = block( list[i], i )) !== undefined ) {
				return retVal;
			}
		}
	}

	// 提供数组的top
	Object.defineProperty( Array.prototype, "top", {
		get : function () {
			return this[this.length - 1];
		},
		set : function ( val ) {
			this[this.length - 1] = val;
		}
	} );

	// 提供数组的删除和contains
	Array.prototype.remove = function ( arg ) {
		var retVal = [];
		loopArray( this, function ( item ) {
			is.Function( arg ) ? !arg( item ) && retVal.push( item ) : arg !== item && retVal.push( item );
		} );
		return retVal;
	};

	Array.prototype.contains = function ( arg ) {
		for ( var len = this.length, i = 0; i !== len; ++i ) {
			if ( is.Function( arg ) ? arg( this[i] ) : (this[i] === arg) ) {
				return true;
			}
		}
		return false;
	};

	// 遍历对象
	function loopObj( obj, block ) {
		for ( var key in obj ) {
			block( key, obj[key] );
		}
	}

	// 操作数组
	function reduce( initValue, array, operate ) {
		loopArray( array, function ( item, i ) {
			var result = operate( initValue, item, i );
			if ( result !== undefined ) {
				initValue = result;
			}
		} );
		return initValue;
	}

	// 使用handler处理数据,若未提供handler,返回未处理过的数据
	function handleData( handler, data ) {
		return handler ? handler.apply( null, Array.prototype.slice.call( arguments, 1 ) ) : data;
	}

	// 将一个元组转化为字符串
	// 如TupleString( "rgba" )( 2, 3, 4, 0.4 )会返回rgba(2,3,4,0.4);
	function TupleString( tupleName ) {
		return function () {
			return tupleName + "(" + Array.prototype.join.call( arguments, "," ) + ")";
		};
	}

	var translate3d = TupleString( "translate3d" );

	// 解析配对连接字符串,如name=tom&class=2&grade=3
	function parsePairString( str, split1, split2, doPair ) {
		loopArray( str.split( split1 ), function ( searchPair ) {
			var keyValue = searchPair.split( split2 );
			doPair( keyValue[0], keyValue[1] );
		} );
	}

	// 判断对象类型
	var is = reduce( {}, ["Array", "Boolean", "Date", "Function", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"], function ( is, typeName ) {
		is[typeName] = function ( obj ) {
			return Object.prototype.toString.call( obj ) == "[object " + typeName + "]";
		};
	} );

	// 将一个对象插入到另一个对象,修改obj1
	function insert( obj1, obj2 ) {
		loopObj( obj2, function ( key, value ) {
			obj1[key] = value;
		} );
		return obj1;
	}

	// 扩展对象,不修改它
	function extend( obj1 ) {
		var retVal = is.Array( obj1 ) ? [] : {};
		loopArray( arguments, function ( val ) {
			insert( retVal, val );
		} );
		return retVal;
	}

	// 设置参数的默认值
	function defaultArg( arg, defaultArg ) {
		return extend( defaultArg, arg || {} );
	}

	// 函数第一次被调用时执行回调
	function firstCall( func, callback ) {
		if ( !func.zFirstCall ) {
			callback();
			func.zFirstCall = true;
		}
	}

	// 双向链表
	function LinkedList() {
		var head = null, tail = null;
		var count = 0;

		function addTail( value ) {
			var node = Node( value );
			node.previous = tail;

			if ( tail === null ) {
				head = node;
			}
			else {
				tail.next = node;
			}
			tail = node;

			return node;
		}

		function Node( value ) {
			var node = {
				previous : null,
				next : null,
				value : value,
				remove : function () {
					--count;
					if ( node.previous !== null ) {
						node.previous.next = node.next;
					}
					else {
						head = node.next;
					}

					if ( node.next !== null ) {
						node.next.previous = node.previous;
					}
					else {
						tail = node.previous;
					}
				},
				insertBefore : function ( value ) {
					var newNode = Node( value );
					newNode.previous = node.previous;
					newNode.next = node;
					node.previous = newNode;
					if ( newNode.previous !== null ) {
						newNode.previous.next = newNode;
					}
					else {
						head = newNode;
					}
					return newNode;
				},
				insertAfter : function ( value ) {
					return node.next === null ? addTail( value ) : node.next.insertAfter( value );
				}
			};

			++count;
			return node;
		}

		return {
			addTail : addTail,
			addHead : function ( value ) {
				return head === null ? addTail( value ) : head.insertBefore( value );
			},
			head : function () {
				return head;
			},
			tail : function () {
				return tail;
			},
			count : function () {
				return count;
			}
		};
	}

	LinkedList.loop = function ( list, func ) {
		for ( var cur = list.head(); cur !== null; cur = cur.next ) {
			func( cur.value, cur );
		}
	};

	LinkedList.toArray = function ( list ) {
		var arr = [];
		LinkedList.loop( list, function ( value ) {
			arr.push( value );
		} );
		return arr;
	};

	// 开关,可以添加一个回调,当开关切换时会调用回调
	function Switcher( init, onSwitch, firstCut ) {
		var isOpen;

		function cut( val ) {
			if ( val === undefined ) {
				return isOpen;
			}
			else {
				if ( isOpen !== val ) {
					isOpen = val;
					onSwitch( val );
				}
			}
		}

		firstCut && cut( init );
		return cut;
	}

	// endregion

	// region DOM
	// 遍历节点
	function loopNodeList( node, func, className ) {
		if ( node && node.nextElementSibling !== undefined ) {
			while ( node ) {
				var nextNode = node.nextElementSibling;
				className ? node.classList.contains( className ) && func( node ) : func( node );
				node = nextNode;
			}
		}
		else if ( node && node.length ) {
			loopArray( node, func );
		}
	}

	function bubble( el, func, root ) {
		var retVal;
		while ( el !== null && el !== document && el !== root ) {
			if ( (retVal = func( el )) !== undefined ) {
				return retVal;
			}
			el = el.parentNode;
		}
	}

	function findAncestor( el, func ) {
		var retVal = null;
		bubble( el, function ( el ) {
			if ( func( el ) ) {
				return retVal = el;
			}
		} );
		return retVal;
	}

	// 判断一个节点是否在文档内
	function inDocument( el ) {
		return findAncestor( el, function ( el ) {
				return el === document.documentElement;
			} ) === document.documentElement;
	}

	// 计算一个元素相对于文档的偏移
	function CalculateElementDocumentOffset( offsetName ) {
		return function ( el ) {
			var retVal = 0;
			for ( var cur = el; cur !== null; cur = cur.offsetParent ) {
				retVal += cur[offsetName];
			}
			return retVal;
		};
	}

	var getPageLeft = CalculateElementDocumentOffset( "offsetLeft" ), getPageTop = CalculateElementDocumentOffset( "offsetTop" );

	// 移除节点
	function removeNode( el ) {
		el && el.parentNode && el.parentNode.removeChild( el );
	}

	// 根据pattern,移除class
	function removeClass( el, pattern ) {
		var matchedClass = [];
		loopArray( el.classList, function ( className ) {
			pattern.test( className ) && matchedClass.push( className );
		} );
		loopArray( matchedClass, function ( className ) {
			el.classList.remove( className );
		} );
	}

	// 加载脚本
	function loadScript( scriptSrc, onLoad ) {
		var script = document.createElement( "script" );
		script.src = scriptSrc;
		bindEvent( script, "load", onLoad );
		document.head.appendChild( script );
		return script;
	}

	// 切换状态
	function toggleState( el, fromState, toState ) {
		el.classList.remove( fromState );
		el.classList.add( toState );
	}

	// 根据flag,添加或删除class
	function switchClass( el, className, flag ) {
		flag ? el.classList.add( className ) : el.classList.remove( className );
	}

	// 覆写appendChild,提供页脚功能
	var appendChild = Node.prototype.appendChild;
	Node.prototype.appendChild = function ( el ) {
		if ( this.hasAttribute && this.hasAttribute( "data-zone" ) ) {
			var footer = this.footer || (this.footer = this.querySelector( "[data-footer]" ));
			footer ? this.insertBefore( el, footer ) : appendChild.call( this, el );
			footer && footer.getAttribute( "data-on-append" ) && window[footer.getAttribute( "data-on-append" )]( this, el, footer );
		}
		else {
			appendChild.call( this, el );
		}
		return el;
	};

	Node.prototype.appendChildren = function ( el ) {
		var nodeList = el.childNodes, len = nodeList.length;
		while ( len-- !== 0 ) {
			this.appendChild( nodeList[0] );
		}
		return el;
	};

	// 抽取属性,抽取后将该属性删除
	function extractAttribute( el, attrName ) {
		var retVal = el.getAttribute( attrName );
		el.removeAttribute( attrName );
		return retVal;
	}

	// 遍历选择器
	function loopSelector( parent, selector, func, child ) {
		if ( parent === document ) {
			loopArray( parent.querySelectorAll( selector ), func );
		}
		else {
			var ancestor = parent.parentNode || element( "div", {
					child : parent
				} );
			parent.setAttribute( "data-z", "" );
			var nodeList = !child ? ancestor.querySelectorAll( selector + "[data-z], [data-z] " + selector ) :
				ancestor.querySelectorAll( "[data-z] > " + selector );
			parent.removeAttribute( "data-z" );
			loopArray( nodeList, func );
		}
	}

	// 根据属性处理元素
	function doNodeByAttribute( root, attrName, func ) {
		function doAttr( attrName ) {
			loopSelector( root, "[" + attrName + "]", function ( node ) {
				func( node, extractAttribute( node, attrName ), attrName );
			} );
		}

		is.Array( attrName ) ? loopArray( attrName, doAttr ) : doAttr( attrName );
	}

	// 创建一个元素的快捷方式
	function element( tagName, arg, parentNode ) {
		function doClass( value ) {
			if ( is.String( value ) ) {
				el.classList.add( value );
			}
			else if ( is.Array( value ) ) {
				loopArray( value, function ( className ) {
					el.classList.add( className );
				} );
			}
		}

		var el = document.createElement( tagName );
		if ( is.Object( arg ) ) {
			loopObj( arg, function ( key, value ) {
				if ( value !== undefined ) {
					switch ( key ) {
						case "classList":
							doClass( value );
							break;
						case "css":
							css( el, value );
							break;
						case "attr":
							loopObj( el, function ( key, value ) {
								el.setAttribute( key, value );
							} );
							break;
						case "innerHTML":
							el.innerHTML = value;
							break;
						case "src":
						case "href":
						case "title":
							el.setAttribute( key, value );
							break;
						case "child":
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
							break;
					}
				}
			} );
		}
		else {
			doClass( arg );
		}

		parentNode && parentNode.appendChild( el );
		return el;
	}

	// HTML模板
	function doHTML( parentNode, handlers, context ) {
		// 处理字段对应的元素节点
		loopSelector( parentNode, "*", function ( fieldNode ) {
			loopObj( fieldNode.dataset, function ( key, value ) {
				var handler = handlers[key];
				if ( handler !== undefined ) {
					handler( fieldNode, value, context );
					fieldNode.removeAttribute( "data-" + key.replace( /([A-Z])/g, "-$1" ).toLowerCase() );
				}
			} );
		} );
	}

	function HTMLTemplate( templateDiv ) {
		var templates = {};
		var handlers = {
			field : function ( node, value, data ) {
				var html = data[value];
				node.innerHTML = html === undefined || html === null ? "" : html;
			},
			text : function ( node, value, data ) {
				node.textContent = data[value];
			},
			src : function ( node, value, data ) {
				node.setAttribute( "src", data[value] );
			},
			href : function ( node, value ) {
				onTap( node, function () {
					location.href = value;
				} );
			},
			attr : function ( node, value, data ) {
				parsePairString( value, " ", ":", function ( key, value ) {
					node.setAttribute( key, data[value] );
				} );
			},
			list : function ( node, value, data ) {
				var keyValue = value.split( " " );
				makeList( keyValue[0], keyValue[1] ? data[keyValue[1]] : data, node );
			},
			replace : function ( node, value, data ) {
				var arg = value.split( " " );
				data = arg[1] ? data[arg[1]] : data;
				if ( data !== undefined ) {
					node.parentNode.replaceChild( make( arg[0], data ), node );
				}
				else {
					removeNode( node );
				}
			},
			"class" : function ( node, value, data ) {
				loopArray( value.split( " " ), function ( fieldName ) {
					node.classList.add( data[fieldName] );
				} );
			},
			lengthOf : function ( node, value, data ) {
				node.innerHTML = value ? data[value].length : data.length;
			},
			length : function ( node, value, data ) {
				node.innerHTML = data._length;
			},
			index : function ( node, value, data ) {
				node.innerHTML = data._index + 1;
			}
		};

		// 储存模板,并将模板移出DOM树
		doNodeByAttribute( templateDiv, "data-template-id", function ( templateNode, templateId ) {
			var mainNode = templateNode.querySelector( "[data-main]" ) || templateNode;
			templates[templateId] = mainNode;
			mainNode.removeAttribute( "data-main" );
		} );

		removeNode( templateDiv );

		function make( templateID, data, apply ) {
			var templateNode = templates[templateID];
			var resultNode = templateNode.cloneNode( true );

			doHTML( resultNode, handlers, data );
			apply && apply( resultNode, data );

			return resultNode;
		}

		function makeList( templateID, dataList, container, apply ) {
			var len = dataList.length;
			loopArray( dataList, function ( data, i ) {
				var resultNode = make( templateID, extend( data, {
					_index : i,
					_length : len
				} ), function ( node, data ) {
					apply && apply( node, data, i );
				} );
				container && container.appendChild( resultNode );
			} );
		}

		return {
			make : make,
			makeList : makeList,
			addHandler : function ( val ) {
				insert( handlers, val );
			},
			hasTemplate : function ( templateId ) {
				return templates.hasOwnProperty( templateId );
			},
			handlers : function () {
				return handlers;
			}
		};
	}

	// endregion

	// region CSS
	// 非标准样式
	var nonstandardStyles = {
		transform : ["-webkit-transform", "-ms-transform", "transform"],
		transition : ["-webkit-transition", "transition"],
		animation : ["-webkit-animation"],
		"animation-play-state" : ["-webkit-animation-play-state"],
		"backface-visibility" : ["-webkit-backface-visibility", "-mozila-backface-visibility", "backface-visibility"],
		"transform-style" : ["-webkit-transform-style", "transform-style"],
		perspective : ["-webkit-perspective", "perspective"]
	};

	// 设置CSS值,可以设置一条或者设置一组
	function css( el, arg1, arg2 ) {
		function setStyle( styleName, styleValue ) {
			function doStyle( styleName ) {
				styleValue !== null ? el.style.setProperty( styleName, styleValue, "" ) : el.style.removeProperty( styleName );
			}

			styleName in nonstandardStyles ? loopArray( nonstandardStyles[styleName], doStyle ) : doStyle( styleName );
		}

		is.String( arg1 ) ? setStyle( arg1, arg2 ) : loopObj( arg1, setStyle );
	}

	// 移除CSS值,可以移除一条,或者移除一组
	function removeCss( el, styleName ) {
		function removeStyle( styleName ) {
			function doStyle( styleName ) {
				el.style.removeProperty( styleName );
			}

			styleName in nonstandardStyles ? loopArray( nonstandardStyles[styleName], doStyle ) : doStyle( styleName );
		}

		is.String( styleName ) ? removeStyle( styleName ) : loopArray( styleName, removeStyle );
	}

	// 生成CSS样式字符串
	function cssRuleString( cssStyles ) {
		var ruleText = "";
		loopObj( cssStyles, function ( styleName, styleValue ) {
			function addRule( styleName ) {
				ruleText += styleName + ":" + styleValue + ";";
			}

			styleName in nonstandardStyles ? loopArray( nonstandardStyles[styleName], addRule ) : addRule( styleName );
		} );
		return ruleText;
	}

	// 添加CSS规则
	var insertCSSRule = function () {
		var userSheet = LinkedList(), systemSheet = LinkedList();
		return function ( ruleText, isSystem ) {
			var styleSheet = isSystem ? systemSheet : userSheet; // 选择样式链表

			// 如果节点尚未创建,创建节点,系统样式表在所有样式表的最前,用户样式表在所有样式表的最后
			if ( styleSheet.node === undefined ) {
				styleSheet.node = document.head.insertBefore( document.createElement( "style" ), isSystem ? document.head.firstChild : null );
			}

			// 创建新规则,位置上最后规则+1
			var lastRule = styleSheet.tail(),
				newRule = styleSheet.addTail( lastRule === null ? 0 : lastRule.value + 1 );

			styleSheet.node.sheet.insertRule( ruleText, newRule.value );

			return {
				remove : function () {
					// 后面所有元素的位置-1
					var pos = newRule.value;
					for ( var curNode = newRule.next; curNode !== null; curNode = curNode.next ) {
						curNode.value = pos++;
					}

					// 移除节点并删除规则
					newRule.remove();
					styleSheet.node.sheet.deleteRule( pos );
				}
			};
		}
	}();

	function insertCSSRules( arg1, arg2, arg3 ) {
		function insertRules( selector, styles, isSystem ) {
			insertCSSRule( selector + " {" + cssRuleString( styles ) + "}", isSystem );
		}

		if ( is.String( arg1 ) ) {
			insertRules( arg1, arg2, arg3 );
		}
		else {
			loopObj( arg1, function ( selector, styles ) {
				insertRules( selector, styles, arg2 );
			} );
		}
	}

	// endregion

	// region 事件
	// 事件
	function Event( basicTask ) {
		var events = LinkedList();
		return {
			trig : function () {
				var arg = arguments;
				basicTask && basicTask.apply( null, arg ); // 回调基本事件
				LinkedList.loop( events, function ( task ) {
					task.apply( null, arg );
				} );
			},
			regist : events.addTail
		};
	}

	// 装载事件,装载成功后直接调用,装载成功前,排队等待调用
	function LoadEvent() {
		var isStartLoad = false, events = Event();

		return {
			regist : function ( task ) {
				events === null ? task() : events.regist( task );
			},
			load : function ( loadFunc ) {
				function loadDone() {
					events.trig();
					events = null;
				}

				!isStartLoad && (loadFunc === undefined ? loadDone() : loadFunc( loadDone ));
				isStartLoad = true;
			}
		};
	}

	// 根据选择器,监听全局事件
	function on( eventName, querySelector, response ) {
		function match( node, nodes ) {
			for ( var i = 0, len = nodes.length; i !== len; ++i ) {
				if ( node === nodes.item( i ) ) {
					return true;
				}
			}
			return false;
		}

		document.addEventListener( eventName, function ( event ) {
			var nodes = document.querySelectorAll( querySelector );
			bubble( event.target, function ( node ) {
				match( node, nodes ) && response && response( event, node );
			}, document.body );
		}, false );
	}

	function onBubble( eventName, response ) {
		document.addEventListener( eventName, function ( event ) {
			bubble( event.target, function ( node ) {
				response( node );
			}, document.documentElement );
		}, false );
	}

	function bindEvent( el, eventName, response, isCapture ) {
		el.addEventListener( eventName, response, isCapture === true );
		return {
			remove : function () {
				el.removeEventListener( eventName, response, isCapture === true );
			}
		};
	}

	function onInsert( el, response ) {
		if ( inDocument( el ) ) {
			response && response();
		}
		else {
			var insertEvent = bindEvent( el, "DOMNodeInsertedIntoDocument", function () {
				response && response( el );
				insertEvent.remove();
			} );
		}
	}

	// 取移动的事件坐标用
	loopArray( ["pageX", "pageY", "clientX", "clientY"], function ( coordinateName ) {
		Object.defineProperty( UIEvent.prototype, "z" + coordinateName.replace( /^./, function ( ch ) {
			return ch.toUpperCase();
		} ), {
			get : function () {
				return "touches" in this && this.touches[0] !== undefined ? this.touches[0][coordinateName] : this[coordinateName];
			}
		} );
	} );

	// touch事件绑定器
	function TouchBind( IEEventName, OtherEventName, PCName ) {
		return function ( el, response, isCapture ) {
			return ua.canTouch ? bindEvent( el, window.navigator.msPointerEnabled ? IEEventName : OtherEventName, response ) :
				bindEvent( el, PCName, response, isCapture );
		};
	}

	var onTouchMove = TouchBind( "MSPointerMove", "touchmove", "mousemove" ),
		onTouchEnd = TouchBind( "MSPointerUp", "touchend", "mouseup" ),
		onTouchStart = function () {
			var onTouchStart = TouchBind( "MSPointerDown", "touchstart", "mousedown" );
			return function ( el, response, isCapture ) {
				return onTouchStart( el, function ( event ) {
					// 此次touch的move事件和end事件,这两个事件仅对于当次touch有效
					var touchMoveEvent = Event(), touchEndEvent = Event();
					var pageX = event.zPageX, pageY = event.zPageY;

					var move = onTouchMove( document, function ( event ) {
						pageX = event.zPageX;
						pageY = event.zPageY;

						// 将move事件和end事件的注册指令添加到event中
						event.onTouchMove = touchMoveEvent.regist;
						event.onTouchEnd = touchEndEvent.regist;

						touchMoveEvent.trig( event, pageX, pageY );
					} );

					var end = onTouchEnd( document, function ( event ) {
						touchEndEvent.trig( event, pageX, pageY );
						move.remove();
						end.remove();
					} );

					// 将move事件和end事件的注册指令添加到event中
					event.onTouchMove = touchMoveEvent.regist;
					event.onTouchEnd = touchEndEvent.regist;

					// 回调response
					response( event, pageX, pageY );
				}, isCapture );
			}
		}();

	// sense事件,根据触摸是否到达了阈值判断是否触发响应
	function sense( el, senseFunc, arg ) {
		return onTouchStart( el, function ( event, startX, startY ) {
			arg.onSenseStart && arg.onSenseStart( event );

			// sense事件,判断触摸移动是否到达sense阈值,若只是小幅移动,不触发响应
			var senseTrue = false;
			var senseEvent = event.onTouchMove( function ( event, pageX, pageY ) {
				// 判断是否移动到了sense阈值,如果移动到了,停止判断,触发senseTrue响应
				event.distanceX = pageX - startX;
				event.distanceY = pageY - startY;

				if ( senseFunc( event ) ) {
					// 移除sense事件,不再侦测
					senseEvent.remove();
					senseTrue = true;

					// 触发senseTrue响应
					arg.onSenseTrue && arg.onSenseTrue( event, pageX, pageY );
				}
			} );

			// 如果抬起的时候没有senseTrue,触发senseFalse响应
			event.onTouchEnd( function ( event, pageX, pageY ) {
				if ( !senseTrue ) {
					arg.onSenseFalse && arg.onSenseFalse( event, pageX, pageY );
				}
				arg.onTouchEnd && arg.onTouchEnd();
			} );
		} );
	}

	// 一般的senser,判断是否超出圆
	function senser( event ) {
		return square( event.distanceX ) + square( event.distanceY ) > square( SwipeRadius );
	}

	// tap事件,轻触屏幕时(不引起sense)触发,在sense域时有class tap
	function onTap( el, response, stopPropagation ) {
		css( el, "cursor", "pointer" );

		if ( window.voiceOver ) {
			return bindEvent( el, "click", response );
		}
		else {
			return sense( el, senser, {
				onSenseTrue : function () {
					el.classList.remove( "tap" );
				},
				onSenseFalse : function ( event, pageX, pageY ) {
					!el.classList.contains( "disabled" ) && response && response( event, pageX, pageY );
				},
				onSenseStart : function ( event ) {
					!el.classList.contains( "disabled" ) && el.classList.add( "tap" );
					stopPropagation && event.stopPropagation();
				},
				onTouchEnd : function () {
					el.classList.remove( "tap" );
				}
			} );
		}
	}

	// 当摇晃屏幕时触发
	function onShake( task, strength ) {
		var lastTime = new Date();
		var lastX = 0, lastY = 0, lastZ = 0, isFirst = true;
		return Z.bindEvent( window, "devicemotion", function ( event ) {
			var acceleration = event.accelerationIncludingGravity,
				curTime = new Date();

			if ( (curTime - lastTime) > 100 ) {
				var diffTime = curTime - lastTime,
					x = acceleration.x, y = acceleration.y, z = acceleration.z,
					speed = isFirst ? 0 : Math.abs( x + y + z - lastX - lastY - lastZ ) / diffTime * 10000;

				event.speed = speed;
				if ( speed > 1000 * (strength || 1) ) {
					task( event );
				}

				lastX = x;
				lastY = y;
				lastZ = z;
				lastTime = curTime;
				isFirst = false;
			}
		} );
	}

	// swipeStart事件,沿某一方向滑动某个阈值时触发
	function SwipeStart( isHorizontal ) {
		return function ( el, response, arg ) {
			return sense( el, senser, {
				onSenseTrue : function ( event, pageX, pageY ) {
					var ratio = Math.abs( event.distanceY ) / Math.sqrt( square( event.distanceX ) + square( event.distanceY ) );

					if ( (ratio >= HMoveRatio) ^ isHorizontal ) {
						event.preventDefault();
						event.direction = isHorizontal ? event.distanceX > 0 : event.distanceY > 0;
						response( event, pageX, pageY );
					}
					else {
						arg.onSenseFailure && arg.onSenseFailure();
					}
				},
				onSenseFalse : arg.onSenseFailure,
				onSenseStart : arg.onSenseStart
			} );
		};
	}

	var onSwipeStartH = SwipeStart( true ), onSwipeStartV = SwipeStart( false );

	// 拖拽,只支持横向或纵向
	function Drag( isHorizontal ) {
		var swipeStart = isHorizontal ? onSwipeStartH : onSwipeStartV,
			getPos = isHorizontal ? function ( pageX ) {
				return pageX;
			} : function ( pageX, pageY ) {
				return pageY;
			};

		return function ( dragEl, moveEl, dragStart, arg ) {
			arg = arg || {};

			if ( moveEl.zLeft === undefined ) {
				translate( moveEl, 0, 0 );
			}

			var swipe = swipeStart( dragEl, function ( event, pageX, pageY ) {
				var dragEndEvent = Event(); // 拖拽停止事件
				var preventDefault = false; // 是否阻止默认事件

				// 位移函数,该函数可以被覆盖
				var move = isHorizontal ? function ( val ) {
					translate( moveEl, val, 0 );
				} : function ( val ) {
					translate( moveEl, 0, val );
				};

				// 拖动开始时的位置(touch位置),偏移(元素位置)和时间戳
				var startPos = getPos( pageX, pageY ),
					startOffset = isHorizontal ? moveEl.zLeft + event.distanceX : moveEl.zTop + event.distanceY,
					startTime = event.timeStamp || +new Date();

				// 上一次移动的位置,时间戳和方向
				var lastPos = startPos,
					lastTime = startTime,
					lastDirection = event.direction;

				var track = [], trackTime = 0; // 记录和记录总时间

				// 拖动开始回调,在该回调中可以阻止默认拖动事件,并覆盖位移函数
				dragStart( {
					direction : event.direction,
					onDragEnd : dragEndEvent.regist,
					setMove : function ( moveFunc ) {
						move = moveFunc;
					},
					preventDefault : function () {
						preventDefault = true;
					},
					targetPos : startOffset
				} );

				// 如果默认事件被阻止,不进行后面的工作,直接返回
				// 也就是说,此时手指挪动不会导致元素移动
				if ( preventDefault ) {
					return;
				}

				// 记录一次移动
				function trackTouchMove( timeDiff, distDiff ) {
					// 如果一次移动大于200,清空记录
					if ( timeDiff > 200 ) {
						track = [];
						trackTime = 0;
						return;
					}
					trackTime += timeDiff;

					// 如果记录时间超过300毫秒,移除头部部分记录,使其减少到300毫秒
					var headTrack;
					while ( trackTime > 300 ) {
						headTrack = track.shift();
						trackTime -= headTrack.timeDiff;
					}

					track.push( {
						timeDiff : timeDiff,
						distDiff : distDiff
					} );
				}

				event.onTouchMove( function ( event, pageX, pageY ) {
					event.preventDefault();
					var targetPos, curDirection, // 目标位置,当前方向
						curPos = getPos( pageX, pageY ); // 当前位置

					// 两次移动的时间差与距离差
					var timeDiff = (event.timeStamp || +new Date()) - lastTime;
					var distDiff = curPos - lastPos;

					// 去抖动
					if ( lastDirection === undefined || !(distDiff * (lastDirection ? 1 : -1) < -20) ) {
						// 计算目标位置和当前方向
						targetPos = startOffset + curPos - startPos;
						curDirection = curPos === lastPos ? lastDirection : curPos > lastPos;

						if ( curDirection !== lastDirection || timeDiff > 200 ) {
							// 如果转向或者两次移动时间间隔超过200毫秒,重新计时
							track = [];
							trackTime = 0;
						}
						else {
							// 否则加入计时记录
							trackTouchMove( timeDiff, distDiff );
						}

						// 更新数据
						lastDirection = curDirection;
						lastPos = curPos;
						lastTime = event.timeStamp || +new Date();

						move( targetPos, {
							direction : curDirection,
							distance : curPos - startPos
						} );
					}
				} );

				event.onTouchEnd( function ( event, pageX, pageY ) {
					// 当前位置差和时间差
					var curPos = getPos( pageX, pageY ), now = (event.timeStamp || +new Date());

					// 加入记录
					trackTouchMove( now - lastTime, curPos - lastPos );

					// 根据记录计算速度
					var totalDiff = reduce( 0, track, function ( total, unit ) {
						return total + unit.distDiff;
					} );
					var speed = trackTime === 0 ? 0 : totalDiff / trackTime;

					// 触发拖动结束事件
					dragEndEvent.trig( {
						targetPos : startOffset + curPos - startPos,
						direction : speed === 0 ? lastDirection : speed > 0,
						distance : curPos - startPos,
						speed : speed,
						duration : now - startTime
					} );
				} );
			}, arg );

			return {
				remove : swipe.remove
			};
		}
	}

	var onDragH = Drag( true ), onDragV = Drag( false );

	// 滚动事件
	function onScroll( el, func ) {
		return bubble( el, function ( el ) {
			var scroll;
			if ( ua.ios && el.hasAttribute( "data-scroll" ) ) {
				scroll = function () {
					func( {
						scrollTop : el.scrollTop,
						clientHeight : el.clientHeight,
						scrollHeight : el.scrollHeight,
						scrollNode : el
					} );
				};

				setTimeout( scroll, 0 );
				return bindEvent( el, "scroll", scroll );
			}
			else if ( !ua.ios && el.hasAttribute( "data-page-scroll" ) ) {
				scroll = function () {
					func( {
						scrollTop : document.body.scrollTop,
						clientHeight : el.parentNode.clientHeight,
						scrollHeight : document.body.scrollHeight,
						scrollNode : el.parentNode
					} );
				};

				if ( el.zScroll === undefined ) {
					el.zScroll = Event();
				}

				setTimeout( scroll, 0 );
				return el.zScroll.regist( scroll );
			}
		} );
	}

	// 当滚动到某元素时触发
	function onScrollTo( node, func, height ) {
		return onScroll( node, function ( event ) {
			var scrollTop = event.scrollTop;
			var top = getPageTop( node ) - getPageTop( event.scrollNode );
			if ( top >= scrollTop - height && top < scrollTop + event.clientHeight ) {
				inDocument( node ) && func();
			}
		} );
	}

	function scrollElement( el ) {
		return ua.ios ? bubble( el, function ( node ) {
			return node.hasAttribute( "data-scroll" ) ? node : undefined;
		} ) : document.body;
	}

	// 当图片加载时触发
	function onImgLoad( node, func ) {
		var loadEvent, errorEvent;

		function LoadEvent( isError ) {
			return function ( event ) {
				event.isError = isError;
				func( event );
				loadEvent.remove();
				errorEvent.remove();
			}
		}

		loadEvent = bindEvent( node, "load", LoadEvent( false ) );
		errorEvent = bindEvent( node, "error", LoadEvent( true ) );
	}

	// 装载器
	function Loader( callback ) {
		var loadDoneEvent = Event( callback ),
			curCount = 0, isStart = false;

		function loadDone() {
			if ( curCount === 0 && isStart ) {
				loadDoneEvent.trig();
			}
		}

		return {
			load : function ( task ) {
				++curCount;
				task( function () {
					--curCount;
					loadDone();
				} );
			},
			onLoad : loadDoneEvent.regist,
			start : function () {
				setTimeout( function () {
					isStart = true;
					loadDone();
				}, 0 );
			}
		}
	}

	// 数据装载器
	function DataLoader( load ) {
		var data = null, list = [];
		return function ( onLoad ) {
			if ( data === null ) {
				list.push( onLoad );
				if ( list.length === 1 ) {
					load( function ( tData ) {
						data = tData;
						loopArray( list, function ( task ) {
							task && task( tData );
						} );
						list = null;
					} );
				}
			}
			else {
				onLoad && onLoad( data );
			}
		};
	}

	// endregion

	// region url与ajax
	function url( path, arg, hash ) {
		var url = path, i = 0;
		arg && loopObj( arg, function ( name, value ) {
			url += value !== undefined ? (i++ === 0 ? "?" : "&") + encodeURIComponent( name ) + "=" + encodeURIComponent( value ) : "";
		} );
		url += hash ? "#" + hash : "";
		return url;
	}

	Object.defineProperty( String.prototype, "path", {
		get : function () {
			return this.split( "#" )[0].split( "?" )[0];
		}
	} );

	Object.defineProperty( String.prototype, "arg", {
		get : function () {
			var arg = {};
			parsePairString( decodeURIComponent( (this.split( "?" )[1] || "").split( "#" )[0] ) || "", "&", "=", function ( key, value ) {
				key !== "" && (arg[key] = value);
			} );
			return arg;
		}
	} );

	Object.defineProperty( String.prototype, "hash", {
		get : function () {
			return this.split( "#" )[1];
		}
	} );

	function ajax( arg ) {
		arg = defaultArg( arg, {
			arg : {},
			requestHeader : {},
			method : "get",
			data : null
		} );

		arg.requestHeader = defaultArg( arg.requestHeader, {
			Accept : "*/*"
		} );

		// 计算url
		var xhr = new XMLHttpRequest();
		xhr.onload = function ( event ) {
			try {
				var data = xhr.responseText;
				if ( arg.isJson ) {
					data = JSON.parse( data );
				}
				arg.onLoad( handleData( arg.dataHandler, data, xhr ), xhr, event );
			}
			catch ( e ) {
				arg.onException && arg.onException( e );
			}
		};
		xhr.onerror = arg.onError;
		xhr.open( arg.method, url( arg.url, arg.arg ), true );

		// 添加requestHeader
		loopObj( arg.requestHeader, function ( key, value ) {
			xhr.setRequestHeader( key, value );
		} );

		xhr.send( arg.data );
		return xhr;
	}

	ajax.xWWW = function ( data ) {
		var retVal = "", i = 0;
		loopObj( data, function ( key, value ) {
			if ( value !== undefined ) {
				retVal += (i++ !== 0 ? "&" : "") + encodeURIComponent( key ) + '=' + encodeURIComponent( value );
			}
		} );
		return retVal;
	};

	function Router( route, fallbackAction ) {
		var routeMap = {};

		return {
			// 注册一个动作
			regist : function ( routeName, action ) {
				routeMap[routeName] = action;
			},
			// 根据路径和参数进行路由
			route : function ( link ) {
				return routeMap[route( link )] || fallbackAction;
			}
		};
	}

	// endregion

	// region 动画
	// 过渡
	function Transition( el, transition, style, styleValue, onEnd ) {
		return function retFunc() {
			onEnd = is.String( style ) ? onEnd : styleValue;
			css( el, "transition", transition );

			if ( ua.android && ua.androidVersion < 3 ) {
				css( el, style, styleValue );
				onEnd && onEnd();
			}
			else {
				css( el, "transition", transition );
				el.transition && el.transition.remove();
				var isEnd = false;

				function end() {
					if ( !isEnd ) {
						isEnd = true;
						removeCss( el, "transition" );
						onEnd && onEnd();
						transitionEnd.remove();
						removeEvent.remove();
					}
					el.transition = null;
				}

				var removeEvent = bindEvent( el, "DOMNodeRemovedFromDocument", end );
				var transitionEnd = bindEvent( el, "webkitTransitionEnd", end );
				el.transition = transitionEnd;

				setTimeout( function () {
					css( el, style, styleValue );
				}, 20 );
			}
			return retFunc;
		};
	}

	function transition( el, transition, style, styleValue, onEnd ) {
		return Transition( el, transition, style, styleValue, onEnd )();
	}

	var translate = function ( el, left, top, transformStyle ) {
		el.zLeft = left;
		el.zTop = top;
		css( el, "transform", [translate3d( left + "px", top + "px", 0 ), transformStyle || ""].join( " " ) );
	};

	var requestAnimate = function () {
		var timeout = null;
		var tasks = LinkedList();

		return function ( task ) {
			var node = null;

			function start() {
				// 如果任务没有添加进链表,添加到链表中
				if ( node === null ) {
					task.start = new Date(); // 这个任务的开始时间
					node = tasks.addTail( task );

					// 如果当前没有计时,开始计时
					if ( timeout === null ) {
						var lastTime = new Date();
						timeout = window.setTimeout( function () {
							var curTime = new Date();
							if ( tasks.tail() !== null ) {
								timeout = window.setTimeout( arguments.callee, 1000 / 60 );
								LinkedList.loop( tasks, function ( task ) {
									task( curTime - task.start, curTime - lastTime );
								} );
							}
							else {
								timeout = null;
							}
							lastTime = curTime;
						}, 1000 / 60 );
					}
				}
			}

			start();

			return {
				start : start,
				stop : function () {
					node && node.remove();
					node = null;
				}
			};
		};
	}();

	function Bezier( x1, y1, x2, y2 ) {
		var xTolerance = 0.0001;

		return function ( xTarget ) {
			function bezier( t, p1, p2 ) {
				var ct = 1 - t, ct2 = ct * ct;
				var t2 = t * t, t3 = t2 * t;
				var tct2 = t * ct2, t2ct = t2 * ct;
				return 3 * p1 * tct2 + 3 * p2 * t2ct + t3;
			}

			function bezierD( t, p1, p2 ) {
				return (9 * p1 - 9 * p2 + 3) * t * t + (6 * p2 - 12 * p1) * t + 3 * p1;
			}

			var t = 0.5;
			while ( Math.abs( xTarget - bezier( t, x1, x2 ) ) > xTolerance ) {
				t = t - (bezier( t, x1, x2 ) - xTarget) / bezierD( t, x1, x2 );
			}

			return bezier( t, y1, y2 );
		}
	}

	var Timing = {
		linear : function ( t ) {
			return t;
		},
		quadraticEase : function ( t ) {
			return 1 - Math.pow( (1 - t), 2 );
		},
		ease : Bezier( 0.25, 1, 0.25, 1 ),
		easeInOut : Bezier( 0.42, 0, 0.58, 1 )
	};

	function animate( animationInfo ) {
		var duration = animationInfo.duration * 1000, // 时续时间
			timing = (animationInfo.timing || Timing.quadraticEase), // 缓动函数
			onStart = animationInfo.onStart, // 开始回调
			onAnimate = animationInfo.onAnimate, // 动画回调
			onEnd = animationInfo.onEnd, // 结束回调
			onReverseEnd = animationInfo.onReverseEnd; // 逆转结束回调

		var isAnimateStart = true, // 动画是否启动
			positive = true; // 是否沿着正方向进行

		onStart && onStart();
		onAnimate( 0 );

		var startTime = new Date();
		var timer = requestAnimate( function () {
			var t = new Date() - startTime;

			if ( t >= duration ) {
				timer.stop();
				onAnimate( positive ? 1 : 0 );
				isAnimateStart = false;
				positive ? onEnd && onEnd() : onReverseEnd && onReverseEnd();
			}
			else {
				onAnimate( timing( (positive ? t : duration - t) / duration ) );
			}
		} );

		return extend( timer, {
			reverse : function () {
				positive = !positive;
				if ( !isAnimateStart ) {
					timer.start();
					isAnimateStart = true;
					if ( positive === true ) {
						onStart && onStart();
					}
				}
			}
		} );
	}


	animate.Timing = Timing;
	animate.Bezier = Bezier;

	// 位移动画
	function moveAnimate( animationInfo ) {
		var onAnimate = animationInfo.onAnimate, // 动画回调
			startPos = animationInfo.startPos, // 起始位置
			distance = animationInfo.endPos - startPos; // 移动距离

		return animate( {
			timing : animationInfo.timing,
			duration : animationInfo.duration,
			onAnimate : function ( ratio ) {
				onAnimate( startPos + distance * ratio );
			},
			onEnd : animationInfo.onEnd
		} );
	}

	// endregion

	// region 控件
	// 切页面板
	var PagePanel = function () {
		var CutEffect = {
			SlideIn : function ( screen, page ) {
				return {
					lay : function ( isIn ) {
						css( page, "transform", translate3d( isIn ? "100%" : 0, 0, 0 ) );
					},
					transition : function ( isIn, duration, onEnd ) {
						return transition( page, "ease-in-out " + duration + "s", "transform", translate3d( isIn ? 0 : "100%", 0, 0 ), onEnd );
					},
					clear : function () {
						removeCss( page, "transform" );
					},
					fixed : true
				};
			},
			FadeIn : function ( screen, page ) {
				return {
					lay : function ( isIn ) {
						css( page, "opacity", isIn ? 0 : 1 );
					},
					transition : function ( isIn, duration, onEnd ) {
						return transition( page, duration + "s", "opacity", isIn ? 1 : 0, onEnd );
					},
					clear : function () {
						removeCss( page, "opacity" );
					}
				};
			}
		};

		var CutinMode = {
			normal : 0,
			reverse : 1,
			noEffect : 2
		};

		function PagePanel( parent, globalArg ) {
			firstCall( PagePanel, function () {
				insertCSSRules( {
					".z-page" : {
						position : "absolute",
						left : 0,
						right : 0,
						top : 0,
						bottom : 0,
						"z-index" : 1
					},
					"body > .z-page" : {
						position : "fixed"
					}
				}, true );
			} );

			globalArg = defaultArg( globalArg, {
				effect : CutEffect.SlideIn,
				duration : 0.2
			} );

			// 初始化元素
			parent.classList.add( "z-page-panel" );
			var pages = {};

			var mainPage = parent.querySelector( ".main-page" ); // 主页
			var curPage = mainPage; // 当前页面

			// 遍历子页节点,存储该子页节点,并删除其id
			loopArray( parent.querySelectorAll( ".main-page, .sub-page, .slide-page" ), function ( page ) {
				pages[page.classList.contains( "main-page" ) ? "$" : extractAttribute( page, "id" )] = page;
				page !== mainPage && removeNode( page );
			} );

			// 如果是安卓的话,将全局滚动绑定到页面版的滚动
			!ua.ios && bindEvent( window, "scroll", function () {
				curPage && curPage.zScroll && curPage.zScroll.trig();
			} );

			// 修饰页面,添加事件和display方法
			function doPage( newPage ) {
				var insertEvent = Event(),
					removeEvent = Event(),
					cutInEndEvent = Event(),
					cutOutStartEvent = Event();

				newPage.classList.add( "z-page" );
				!ua.ios && newPage.setAttribute( "data-page-scroll", "" );

				return insert( newPage, {
					// 显示页
					display : function ( arg ) {
						if ( newPage === curPage ) {
							return;
						}
						newPage.classList.add( "visibility" );
						arg = defaultArg( arg, globalArg );
						var oldPage = curPage;
						var cutInMode = arg.cutinMode || CutinMode.normal; // 切入模式,默认是正切入
						var isIn = cutInMode === CutinMode.normal; // 是否是切入
						var cutAnimate = arg.effect( parent, isIn ? newPage : oldPage ); // 切入动画

						// 加载到文档中
						if ( ua.ios ) {
							parent.appendChild( newPage );
							loopSelector( oldPage, "[data-scroll]", function ( node ) {
								node.pScrollTop = node.scrollTop;
							} );
							loopSelector( newPage, "[data-scroll]", function ( node ) {
								node.pScrollTop !== undefined && node.pScrollTop !== node.scrollTop && (node.scrollTop = node.pScrollTop);
							} );
						}
						else {
							cutAnimate.fixed ? document.body.appendChild( newPage ) : parent.appendChild( newPage );
							oldPage.pScrollTop = document.body.scrollTop;
							newPage.pScrollTop && css( newPage, "top", -newPage.pScrollTop + "px" );
						}
						isIn ? insertEvent.trig() : oldPage.cutOutStartEvent.trig();

						// 动画结束的清理工作
						function end() {
							cutAnimate.clear && cutAnimate.clear( isIn );
							removeCss( newPage, ["top", "z-index"] );
							removeNode( oldPage );
							document.body.classList.remove( "cutting" );

							if ( !ua.ios ) {
								cutAnimate.fixed && parent.appendChild( newPage );
								document.body.scrollTop = newPage.pScrollTop;
								newPage.zScroll && newPage.zScroll.trig()
							}

							isIn ? cutInEndEvent.trig() : oldPage.removeEvent.trig();
							isIn && arg.onCutIn && arg.onCutIn();
						}

						// 触发动画
						var curScrollTop = document.body.scrollTop;
						css( newPage, "z-index", isIn ? 3 : -1 );
						document.body.classList.add( "cutting" );
						cutAnimate.lay && cutAnimate.lay( isIn );
						setTimeout( function () {
							if ( !ua.ios ) {
								document.body.scrollTop = curScrollTop;
							}
							newPage.classList.remove( "visibility" );
							cutInMode === CutinMode.noEffect ? end() : setTimeout( function () {
								cutAnimate.transition( isIn, arg.duration, end );
							}, 0 );
						}, 0 );

						curPage = newPage;
					},
					onInsert : insertEvent.regist,
					onRemove : removeEvent.regist,
					onCutInEnd : cutInEndEvent.regist,
					onCutOutStart : cutOutStartEvent.regist,
					cutOutStartEvent : cutOutStartEvent,
					removeEvent : removeEvent
				} );
			}

			doPage( mainPage );

			insert( parent, {
				curPage : function () {
					return curPage;
				},
				mainPage : function () {
					return mainPage;
				},
				pages : function () {
					return pages;
				},
				getPage : function ( pageId ) {
					return is.String( pageId ) ? pageId in pages ? doPage( pages[pageId].cloneNode( true ) ) : null : doPage( pageId );
				}
			} );

			return parent;
		}

		PagePanel.CutEffect = CutEffect;
		PagePanel.CutinMode = CutinMode;

		return PagePanel;
	}();

	function SlideListPanel( parent, arg ) {
		firstCall( SlideListPanel, function () {
			insertCSSRules( {
				".z-slide-list-panel" : {
					overflow : "hidden",
					position : "relative"
				},
				".z-slide-list-panel > ul" : {
					height : "100%",
					overflow : "hidden"
				},
				".z-slide-list-panel > ul > li" : {
					height : "100%",
					"float" : "left",
					"min-height" : "1px"
				}
			}, true );
		} );

		parent.classList.add( "z-slide-list-panel" );

		arg = defaultArg( arg, {
			width : 1,
			cycle : false,
			slideRatio : 1,
			margin : 0
		} );

		var ul = parent.querySelector( "ul" ), items = [];
		var isCycle = arg.cycle, slideRatio = arg.slideRatio, margin = arg.margin;
		var slideDistance = arg.width + margin;
		var disabled = false;

		// 事件
		var cutToEvent = Event(),
			animateStartEvent = Event(),
			slideStartEvent = Event();

		// 尺寸计算
		var parentWidth = parent.offsetWidth, itemWidth = parentWidth * arg.width, marginWidth = parentWidth * margin, maxItems = 3;
		onInsert( parent, function () {
			parentWidth = parent.offsetWidth;
			itemWidth = parentWidth * arg.width;
			marginWidth = parentWidth * margin;

			// 根据宽度计算最大项术
			maxItems = function () {
				var start = 1;
				while ( arg.width * start + margin * (start - 2) < 1 ) {
					start += 2;
				}
				return start + slideRatio * 2;
			}();

			css( ul, {
				"width" : maxItems * itemWidth + (margin > 0 ? marginWidth * maxItems : 0) + "px",
				"margin-left" : "-" + (maxItems * arg.width - 1) / 2 * parentWidth + "px"
			} );
		} );

		// 将ul中已有的元素添加到items中,并移除它们
		loopSelector( ul, "li", function ( li ) {
			items.push( li );
			removeNode( li );
		}, true );

		var curCenterIndex = 0;

		function cycleIndex( index ) {
			return isCycle ? (index + items.length) % items.length : index;
		}

		function slideLi( li, isFirst ) {
			css( li, "width", itemWidth + "px" );
			margin && css( li, "margin", "0 " + marginWidth / 2 + "px" );
			isFirst && margin && css( li, "margin-left", -marginWidth * (maxItems - 1) / 2 + "px" );
			return li;
		}

		// 调整元素
		function adjust() {
			var lay = arg.lay;
			var centerDiff = -Math.floor( (ul.zLeft + itemWidth / 2) / itemWidth );

			arg.lay && loopSelector( ul, "li", function ( li, i ) {
				var centerI = (i - (maxItems - 1) / 2);

				!li.zEmpty && lay( li, {
					index : centerI - centerDiff,
					offset : centerI * (itemWidth + marginWidth) + ul.zLeft,
					width : itemWidth
				} );
			} );
		}

		// 将centerIndex为中心,摆放元素
		function lay( centerIndex ) {
			ul.innerHTML = "";

			function emptyLi() {
				var li = document.createElement( "li" );
				li.zEmpty = true;
				return li;
			}

			translate( ul, 0, 0 );
			loop( maxItems, function ( i ) {
				var targetIndex = i - (maxItems - 1) / 2 + centerIndex;
				var li = isCycle && items.length <= 2 ? i === 1 ? items[centerIndex] : emptyLi() :
				items[cycleIndex( targetIndex )] || emptyLi();
				ul.appendChild( slideLi( li, i === 0 ) );
			} );
			adjust( ul.firstChild.offsetWidth );
			curCenterIndex = centerIndex;

			cutToEvent.trig( {
				curIndex : centerIndex
			} );
		}

		var inAnimate = false;

		function doWhenItem2( targetPos ) {
			// 取出副项和两个空项,showBlankLi是要显示的,hiddenBlankLi是未显示的
			var subLi = items[cycleIndex( curCenterIndex + 1 )];
			var showBlankLi = ul.children[targetPos > 0 ? 0 : 2], hiddenBlankLi = ul.children[targetPos < 0 ? 0 : 2];

			// 如果要显示的不是副项,替换为副项
			if ( showBlankLi !== subLi ) {
				ul.replaceChild( slideLi( document.createElement( "li" ) ), hiddenBlankLi );
				ul.replaceChild( slideLi( subLi ), showBlankLi );
			}
		}

		function cutTo( step ) {
			inAnimate = true;
			var endIndex = range( cycleIndex( curCenterIndex + step ), 0, items.length - 1 );

			function endAnimate() {
				lay( endIndex );
				inAnimate = false;
			}

			animateStartEvent.trig( {
				curIndex : curCenterIndex,
				targetIndex : endIndex
			} );

			if ( isCycle && items.length === 2 ) {
				doWhenItem2( -step );
			}

			if ( arg.lay ) {
				moveAnimate( {
					startPos : ul.zLeft,
					endPos : (curCenterIndex - endIndex) * (itemWidth + marginWidth),
					onAnimate : function ( pos ) {
						translate( ul, pos << 0, 0 );
						adjust( itemWidth );
					},
					onEnd : endAnimate,
					duration : 0.2
				} );
			}
			else {
				transition( ul, "0.2s", {
					transform : translate3d( (isCycle ? -step : (curCenterIndex - endIndex)) * (1 + margin) * itemWidth + "px", 0, 0 )
				}, endAnimate );
			}
		}

		onDragH( ul, ul, function ( event ) {
			if ( disabled || inAnimate || (isCycle && items.length === 1) ) {
				event.preventDefault();
				return;
			}

			slideStartEvent.trig( {
				curIndex : curCenterIndex
			} );

			event.setMove( function ( targetPos ) {
				var length = items.length;
				if ( !isCycle && ((curCenterIndex === 0 && targetPos > 0) || (curCenterIndex === length - 1 && targetPos < 0)) ) {
					targetPos = Math.atan( targetPos / parentWidth / 2 ) * parentWidth * arg.width / 2;
				}
				// 当列表循环,并且只有两项的时候,往左滑时,副项在右,往右滑时,副二项在左
				else if ( isCycle && length === 2 ) {
					doWhenItem2( targetPos );
				}

				translate( ul, range( targetPos, -parentWidth + 2, parentWidth - 2 ) * slideDistance, 0 );
				adjust();
			} );

			event.onDragEnd( function ( event ) {
				// 计算移动多少项
				var direction = event.direction ? 1 : -1;
				var step = event.duration < 200 ? -direction : -direction * (Math.abs( ul.zLeft / parentWidth + direction * 0.3 ) > 0.5 ? 1 : 0);

				// 触发动画
				cutTo( step );
			} );
		} );

		return insert( parent, {
			item : function ( index ) {
				return items[index];
			},
			disable : function ( val ) {
				disabled = val;
			},
			length : function () {
				return items.length;
			},
			addItem : function ( li ) {
				items.push( li );
			},
			clear : function () {
				curCenterIndex = 0;
				items = [];
			},
			curIndex : function () {
				return curCenterIndex;
			},
			display : lay,
			cutTo : function ( index ) {
				cutTo( index - curCenterIndex );
			},
			cutRight : function ( index ) {
				cutTo( index || 1 );
			},
			onCutTo : cutToEvent.regist,
			onSlideStart : slideStartEvent.regist,
			onAnimateStart : animateStartEvent.regist
		} );
	}

	// endregion

	// region 裁剪
	function Stream( str ) {
		return {
			str : str,
			cur : 0
		};
	}

	function doUaExpr( stream ) {
		stream.str += ")";

		function cur() {
			return stream.str.charAt( stream.cur );
		}

		function eat() {
			++stream.cur;
		}

		function doExpr() {
			function readToken() {
				var token = "";
				var ch = cur();
				while ( inRange( ch.charCodeAt( 0 ), 0x30, 0x3A ) || inRange( ch.toUpperCase().charCodeAt( 0 ), 0x41, 0x5B ) ) {
					token += ch;
					eat();
					ch = cur();
				}
				return ua[token];
			}

			function readOp() {
				var retVal = cur();
				eat();
				eat();
				return retVal;
			}

			function doTerm() {
				var retVal;
				switch ( cur() ) {
					case "!":
						eat();
						return !doTerm();
					case "(":
						eat();
						retVal = doExpr();
						eat();
						return retVal;
					default:
						return readToken();
				}
			}

			var curValue = doTerm();
			while ( cur() !== ")" ) {
				var op = readOp();
				var rhs = doTerm();

				if ( op === "&" ) {
					curValue = curValue && rhs;
				}
				else {
					curValue = curValue || rhs;
				}
			}

			return curValue;
		}

		return doExpr();
	}

	var contentLoad = bindEvent( document, "DOMContentLoaded", function () {
		doNodeByAttribute( document, "data-ua-style", function ( node, uaStyle ) {
			if ( !doUaExpr( Stream( uaStyle.replace( " ", "" ) ) ) ) {
				removeNode( node );
			}
		} );
		contentLoad.remove();
	} );
	// endregion

	// region 加载
	function loadDependency( arg, onLoad ) {
		var loader = Loader(), file = {};
		// 加载脚本
		loopArray( arg.script || [], function ( scriptPath ) {
			loader.load( function ( done ) {
				loadScript( scriptPath, done );
			} );
		} );

		// 加载样式
		loopArray( arg.style || [], function ( stylePath ) {
			var link = document.createElement( "link" );
			link.href = stylePath;
			link.setAttribute( "rel", "stylesheet" );
			document.head.appendChild( link );
		} );

		// 加载文件
		loopObj( arg.file || {}, function ( name, filePath ) {
			loader.load( function ( done ) {
				Z.ajax( {
					url : filePath,
					onLoad : function ( data ) {
						file[name] = data;
						done();
					}
				} );
			} );
		} );

		loader.onLoad( function () {
			onLoad( file );
		} );
		loader.start();
	}

	var dependency = {
		script : [],
		style : [],
		file : {}
	};

	var loadEvent = Event();

	function onLoad( response ) {
		loadEvent.regist( response );
	}

	onLoad.addDependency = function ( arg ) {
		dependency.script = dependency.script.concat( arg.script || [] );
		dependency.style = dependency.style.concat( arg.style || [] );
		insert( dependency.file, arg.file || {} );
	};

	window.addEventListener( "load", function load() {
		loadDependency( dependency, function ( files ) {
			loadEvent.trig( files );
			loadEvent = null;
			window.removeEventListener( "load", load );
		} );
	}, false );

	// endregion

	// region 导出
	window.Z = window.Z || {};
	insert( window.Z, {
		// 常量
		Direction : Direction,
		ua : ua,

		// util
		is : is,
		loop : loop,
		loopArray : loopArray,
		loopObj : loopObj,
		loopNodeList : loopNodeList,
		insert : insert,
		extend : extend,
		LinkedList : LinkedList,
		defaultArg : defaultArg,
		handleData : handleData,
		TupleString : TupleString,
		parsePairString : parsePairString,
		range : range,
		inRange : inRange,
		firstCall : firstCall,
		run : run,
		Switcher : Switcher,

		// 事件
		Event : Event,
		LoadEvent : LoadEvent,
		bindEvent : bindEvent,
		on : on,
		onBubble : onBubble,
		onInsert : onInsert,
		onTouchStart : onTouchStart,
		onTouchMove : onTouchMove,
		onTouchEnd : onTouchEnd,
		Drag : Drag,
		onDragH : onDragH,
		onDragV : onDragV,
		onSwipeStartH : onSwipeStartH,
		onSwipeStartV : onSwipeStartV,
		onTap : onTap,
		onShake : onShake,
		onScroll : onScroll,
		onScrollTo : onScrollTo,
		onImgLoad : onImgLoad,
		Loader : Loader,
		DataLoader : DataLoader,

		// DOM
		pageLeft : getPageLeft,
		pageTop : getPageTop,
		removeNode : removeNode,
		element : element,
		doHTML : doHTML,
		HTMLTemplate : HTMLTemplate,
		loopSelector : loopSelector,
		extractAttribute : extractAttribute,
		doNodeByAttribute : doNodeByAttribute,
		loadScript : loadScript,
		toggleState : toggleState,
		switchClass : switchClass,
		removeClass : removeClass,
		findAncestor : findAncestor,
		inDocument : inDocument,
		bubble : bubble,
		scrollElement : scrollElement,

		// css
		css : css,
		removeCss : removeCss,
		cssRuleString : cssRuleString,
		translate : translate,
		insertCSSRule : insertCSSRule,
		insertCSSRules : insertCSSRules,

		// 动画
		Transition : Transition,
		transition : transition,
		requestAnimate : requestAnimate,
		animate : animate,
		moveAnimate : moveAnimate,

		// 控件
		PagePanel : PagePanel,
		SlideListPanel : SlideListPanel,

		// Ajax
		url : url,
		ajax : ajax,
		Router : Router,

		// 加载
		onLoad : onLoad,
		loadDependency : loadDependency
	} );
	// endregion

	// region 优化
	Z.onLoad( function () {
		// 屏蔽图片拖动
		if ( ua.win32 ) {
			onTouchStart( document, function ( event ) {
				if ( event.target.nodeName.toLowerCase() === "img" ) {
					event.preventDefault();
				}
			} );
		}

		// 焦点时设置focus类
		onBubble( "focusin", function ( node ) {
			node.classList.add( "focus" );
		} );
		onBubble( "focusout", function ( node ) {
			node.classList.remove( "focus" );
		} );
	} );

	ua.ios && onTouchStart( document, function () {
	} );
	// endregion
})();