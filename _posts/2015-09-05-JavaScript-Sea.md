---
layout: post
title: JavaScript模块化及SEA.JS的使用
date: 2015-09-05
categories: 编程技术

---

最近因为缺前端，不得已要自学一下，囧~ 偶然在看到阮一峰很久之前关于模块化的文章：

1. [模块的写法](http://www.ruanyifeng.com/blog/2012/10/javascript_module.html)
2. [AMD规范](http://www.ruanyifeng.com/blog/2012/10/asynchronous_module_definition.html)
3. [require.js的用法](http://www.ruanyifeng.com/blog/2012/11/require_js.html)

看完之后用来下玉伯的sea.js，感觉比较给力。

## WHY

工程中前端开发的代码量早已与后端代码量差不了太多，如果将所有代码放到单个文件中是个头疼的问题：

1. 全局变量互相影响
2. JS文件变大影响加载速度
3. 结构混乱

但是比较悲剧：在JavaScript中并没有提供类、模块等封装的方法，那么就需要我们想办法利用现有的东西来做模块化。

2009年Ryan Dahl创建了node.js项目，将javascript用于服务器端编程，这标志"Javascript模块化编程"正式诞生。

## HOW

为了避免上面的缺点以及为了不暴露私有成员，通常用[立即执行函数](http://blog.csdn.net/qq838419230/article/details/8030078)来搞定模块化的定义模块：

<pre class="prettyprint">
var module1 = (function(){
    var _count = 0;
    var m1 = function(){
        //...
    };
    var m2 = function(){
        //...
    };
    return {
        m1 : m1, m2 : m2
    };
})();
</pre>

大家定义出来的模块可能五花八门，如果都用统一的形式来定义那就可以很方便的引用了。目前常用规范有两种：**CommonJS**和**AMD**，node.js的模块系统就是参照CommonJS来实现的：

<pre class="prettyprint">
var math = require('math');// 全局的require方法用来加载模块
math.add(2,3);
</pre>

其中math.add(2,3)要等到require完成之后才能执行，也就是说这是一个**同步**的过程，在网络不好的环境中浏览器就会进入假死状态，体验极差，为了解决这个问题我们来看**异步**的AMD规范(require.js)：

<pre class="prettyprint">
require(['math'], function (math) {// require([module], callback);
    math.add(2, 3);
});
</pre>

参数module是要加载模块的列表，callback则是加载成功之后回调函数。AMD规范中模块的写法如下：

<pre class="prettyprint">
// math.js
define(function (){
    var add = function (x,y){
        return x+y;
    };
    return { add: add };
});
</pre>

另外可以用require.js来加载非规范AMD模块、文本、图片等，感觉略强大。

## SEA.JS

CMD是sea.js使用的规范(所以这个术语貌似只有国人知道)，模块定义如下：

<pre class="prettyprint">
define(function(require, exports, module) {
    var a = require('./a');
    a.doSomething();
    var b = require('./b');
    b.doSomething();
});
</pre>

是不是和AMD很像？通过**require**在需要的时候引入依赖，通过**exports**来暴露接口。AMD和CMD的区别可以看[这里](http://www.zhihu.com/question/20351507/answer/14859415)，还有[这里](http://blog.chinaunix.net/uid-26672038-id-4112229.html)。sea.js中常用的API有：

1. [seajs.config](https://github.com/seajs/seajs/issues/262)：配制
2. [seajs.use](https://github.com/seajs/seajs/issues/260)：在页面上加载模块
3. [define](https://github.com/seajs/seajs/issues/242)：定义模块
4. [require](https://github.com/seajs/seajs/issues/259)：获取指定模块
5. [require.async](https://github.com/seajs/seajs/issues/242)：在模块内部异步加载一个或多个模块
6. [exports](https://github.com/seajs/seajs/issues/242)：在模块内部对外提供接口
7. [module.exports](https://github.com/seajs/seajs/issues/242)：在模块内部对外提供接口

这些API已经定义的足够简单，因此，例子就忽略了（你可以看[这里](http://)）。。。

## 总结

简单看下来，感觉很受用！不过...模块化的趋势貌似是[ECMAScript 6](http://es6.ruanyifeng.com/#docs/intro)，ES6的目标是让JavaScript可以用来编写大型、复杂的应用程序，成为企业级开发语言！

不过...[浏览器的支持程度](http://kangax.github.io/compat-table/es6/)比较堪忧。。。