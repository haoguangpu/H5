/*******************************
 * Copyright:智讯互动(www.zhixunhudong.com)
 * Author:Mr.Think
 * Description:图片预加载
 * 使用方法：_PreLoadImg(['img/img1.jpg','img/img2.jpg','img/img3.jpg',...],function(){ //加载完成后执行 });
 *******************************/
function _PreLoadImg(b,e){var c=0,a={},d=0;for(src in b){d++}for(src in b){a[src]=new Image();a[src].onload=function(){if(++c>=d){e(a)}};a[src].src=b[src]}};