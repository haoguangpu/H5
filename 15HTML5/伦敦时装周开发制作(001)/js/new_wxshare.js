/**
 * 微信统一调用接口
 * 通过meta来获取微信分享的内容
 */
(function(){
    // 执行回调
    function execHandler(handler){
        if(handler && handler instanceof Object){
            var callback = handler.callback || null;
            var opts = handler.args || [];
            var context = handler.context || null;
            var delay = handler.delay || -1;

            if(callback && callback instanceof Function){
                if(typeof(delay) == "number" && delay >= 0){
                    setTimeout(function(){
                        callback.call(context, opts);
                    }, delay);
                }else{
                    callback.call(context, opts);
                }
            }
        }
    }

    // 合并参数后执行回调
    function execAfterMergerHandler(handler, _args){
        if(handler && handler instanceof Object){
            var args = handler.args || [];

            handler.args = _args.concat(args);
        }

        execHandler(handler);
    }
    
    // 检测微信准备就绪
    document.addEventListener("WeixinJSBridgeReady", function(){
        window.G_WEIXIN_READY = true;
    }, false);

    // 检测微信是否加载成功
    function CallWeiXinAPI(fn, count){
        var total = 2000;   //30s     
        count = count || 0;
        
        if(true === window.G_WEIXIN_READY || ("WeixinJSBridge" in window)){
            fn.apply(null, []);
        }else{
            if(count <= total){
                setTimeout(function(){
                    CallWeiXinAPI(fn, count++);
                }, 15);
            }
        }
    }

    // 微信接口
    window.WEIXIN_API = _api = {
        Share : {
            /**
             * 分享到微博
             * @param Object options {String content, String url}
             * @param Object handler
             */
            "weibo" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:weibo",function(argv){
                        WeixinJSBridge.invoke('shareWeibo', options, function(res){
                            execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            },
            /**
             * 朋友圈
             * @param Object options {
             *                  String img_url, 
             *                  Number img_width, 
             *                  Number img_height, 
             *                  String link, 
             *                  String desc, 
             *                  String title
             * }
             * @param Object handler
             */
            "timeline" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:timeline",function(argv){
                        WeixinJSBridge.invoke('shareTimeline', options, function(res){
                            execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            },
            /**
             * 朋友
             * @param Object options {
             *                  String appid, 
             *                  String img_url, 
             *                  Number img_width, 
             *                  Number img_height, 
             *                  String link, 
             *                  String desc, 
             *                  String title
             * }
             * @param Object handler
             */
            "message" : function(options, handler){
                CallWeiXinAPI(function(){
                    WeixinJSBridge.on("menu:share:appmessage",function(argv){
                        WeixinJSBridge.invoke('sendAppMessage', options, function(res){
                            execAfterMergerHandler(handler, [res]);
                        });
                    });
                });
            }
        },
        /**
         * 设置底栏
         * @param boolean visible 是否显示
         * @param Object handler
         */
        "setToolbar" : function(visible, handler){
            CallWeiXinAPI(function(){
                if(true === visible){
                    WeixinJSBridge.call('showToolbar');
                }else{
                    WeixinJSBridge.call('hideToolbar');
                }
                execAfterMergerHandler(handler, [visible]);
            });
        },
        /**
         * 设置右上角选项菜单
         * @param boolean visible 是否显示
         * @param Object handler
         */
        "setOptionMenu" : function(visible, handler){
            CallWeiXinAPI(function(){
                if(true === visible){
                    WeixinJSBridge.call('showOptionMenu');
                }else{
                    WeixinJSBridge.call('hideOptionMenu');
                }
                execAfterMergerHandler(handler, [visible]);
            });
        },
        /**
         * 调用微信支付
         * @param Object data 微信支付参数
         * @param Object handlerMap 回调句柄 {Handler success, Handler fail, Handler cancel, Handler error}
         */
        "pay" : function(data, handlerMap){
            CallWeiXinAPI(function(){
                var requireData = {"appId":"","timeStamp":"","nonceStr":"","package":"","signType":"","paySign":""};
                var map = handlerMap || {};
                var handler = null;
                var args = [data];

                for(var key in requireData){
                    if(requireData.hasOwnProperty(key)){
                        requireData[key] = data[key]||"";
                        console.info(key + " = " + requireData[key]);
                    }
                }

                WeixinJSBridge.invoke('getBrandWCPayRequest', requireData, function(response){
                    var key = "get_brand_wcpay_request:";
                    switch(response.err_msg){
                        case key + "ok":
                            handler = map.success;
                            break;
                        case key + "fail":
                            handler = map.fail || map.error;
                            break;
                        case key + "cancel":
                            handler = map.cancel || map.error;
                            break;
                        default:
                            handler = map.error;
                            break;
                    }

                    execAfterMergerHandler(handler, args);
                });
            });                
        }
    };

    // 获取微信设置信息
    var meta, metas = document.getElementsByTagName('meta');
    for (var i = 0, len = metas.length; i < len; i++) {
        if (metas[i].getAttribute('name') == 'sharecontent') {
            meta = metas[i];
        }
    }

    // 判断是否有输出标间，并配置分享
    if (!meta) { 
        return;
    }

    // 默认图片
    var imgs = document.getElementsByTagName('img'),
        shareImg,
        isImgUrl = /(^data:.*?;base64)|(\.(jpg|png|gif)$)/;
    for (var i = 0, len = imgs.length; i < len; i++) {
        if (isImgUrl.test(imgs[i].getAttribute('src'))) {
            shareImg = imgs[i].getAttribute('src');
            break;
        } else {
            continue;
        }
    }

    // 分享给朋友设置
    var link = window.location.href;
    var opt_msg = {
        "img_url" : meta.dataset.msgImg || "http://" + window.location.host + shareImg,
        "link" : link,
        "desc" : meta.dataset.msgContent || document.title + '，敬请访问！',
        "title" : meta.dataset.msgTitle || document.title
    };
    var handler_msg = {
        "urlCall" : meta.dataset.msgCallback || '',
        callback : function(res){
            if(res[0].err_msg.indexOf('cancel') == -1) {
                if (window.BI_weixin) {
                    //传递opts对象,用于
                    opt_msg.link = BI_weixin.save_openid_uid(opt_msg);
                    //这里传递回调的链接参数...
                    BI_weixin.wxcallback(opt_msg);
                } else {
                    if (handler_line.urlCall) {
                        window.location.href = handler_msg.urlCall;
                    }
                }
            }
        }
    };

    // 朋友圈分享设置
    var opt_line = {
        "img_url" : meta.dataset.lineImg || "http://" + window.location.host + shareImg,
        "link" : link,
        "desc" : meta.dataset.lineTitle || document.title + '，敬请访问！',
        "title" : meta.dataset.lineTitle || document.title + '，敬请访问！'
    }; 
    var handler_line = {
        "urlCall" : meta.dataset.lineCallback || '',
        callback : function(res){
            if(res[0].err_msg.indexOf('cancel') == -1) {
                if (window.BI_weixin) {
                    //opts用于将对象传递进来...
                    opt_line.link = BI_weixin.save_openid_uid(opt_line);
                    //这里传递回调的链接参数...
                    BI_weixin.wxcallback(opt_line);
                } else {
                    if (handler_line.urlCall) {
                        window.location.href = handler_msg.urlCall;
                    }
                }
            }
        }
    }

    // 微信设置配置
    _api.Share.message(opt_msg, handler_msg);
    _api.Share.timeline(opt_line, handler_line);
})();



