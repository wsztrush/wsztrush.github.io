---
layout: post
title: JavaScript基础知识
date: 2015-09-09
categories: 编程技术

---

![](http://img3.douban.com/mpic/s8958650.jpg)

首先我并不是一个JavaScript高手，因为工作需要最近才开始学习，虽然之前陆陆续续地零碎看过一些，但是很不系统，这篇文章打算从一个门外汉的角度来分几步看，希望能对初学者有一些帮助~

## 基本语法

JavaScript是弱类型的，有六种基本类型（用`typeof`查看）：

类型|含义
-|-
undefined/null|区别看[这里](http://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html)，可能结合Map比较好理解一些
boolean|需要注意从其他类型转换到Boolean的规则
number|整数、浮点数、NaN
string|字符串
object|数据、对象的集合，是所有对象的基础

弱类型的强大之处在于将不同类型的数据进行比较的时候居然结果是一样的：`"123"==123`，简直毁三观~~不过也提供了另外一种方式`"123"===123`可以得到预期的结果。

在需要连续操作一个对象的多个属性或者方法时可以用`with`减少代码量：

<pre class="prettyprint">
with(location){
    var a = search.substring(1); // var a = location.search.substring(1)
    var b = hostname;// var b = location.hostname
}
</pre>

在JavaScript中定义函数非常灵活

> 既不需要定义返回值，也不需要定义入参（简直比弱类型还随意...）

可以使用`arguments`来获取所有的参数，这样看来参数的实现和**Python**有点像，参数名称仅仅是用为了在代码中方便使用参数！

在JavaScript中几乎所有的都是对象，第一种创建对象的方式为：

<pre class="prettyprint">
var Cat = {
    name : '',
    color : ''
}
</pre>

这种方式在创建多个对象时非常麻烦，另外一种方法是：

<pre class="prettyprint">
function Cat(name, color){
    this.name = name;
    this.color = color;
}
</pre>

这样在创建对象的时候就很简单了：`new Cat('abc', 'white')`，对象中有一些内部属性用来控制其行为：

内部属性|含义
-|-
configurable|能否通过`delete`删除属性从而重新定义属性，能够修改属性的特性或者能否把属性修改为访问器属性
enumerable|能否通过`for-in`循环返回属性
writable|能否修改属性的值
value|包含这个属性的数据值

用法如下：

<pre class="prettyprint">
var person = {};
Object.defineProperty(person, 'name', {
    writeable: false,
    value: 'abc'
});
</pre>

另外提供了`get、set`方法，有了它们之后就可以很容易监听对象中每个属性的变化，在做数据绑定的时候比较好用：

<pre class="prettyprint">
var person = {name : 'abc'};
Object.defineProperty(person, 'name', {
    get: function(){
        return 'bcd';
    },
    set: function(newValue){
        console.log('hehe');
    }
});
console.log(person.name);// bcd
</pre>



## 原型

习惯了**class based programming**直接看**prototype based programming**感觉有点诡异：

> 我们创建的每个函数都有一个prototype属性，指向一个对象，其中包含了可以由特定类型的所有实例共享的属性和方法

而作用则是：**从当前对象中获取不到的属性可以尝试从prototype中获取**，只要记住这一点，很多问题就引刃而解！原型的用法很简单：

<pre class="prettyprint">
function Person(){}
Person.prototype.name = 'abc';
var person1 = new Person();
console.log(person1.name);//abc
</pre>

接着来看一些和原型相关的方法：

方法|作用
-|-
Person.isPrototypeOf(person1)|对象和对象之间是否存在原型链
Object.getPrototypeOf(person1) == Person|获取原型
Person.prototype.constructor|指向prototype属性所在函数的指针（也就是构造函数）
person1.hasOwnProperty('name')|是否自己真的有，而不是从原型中获取
person1 instanceof Object|是否为指定类型

可以用原型来实现类似继承效果，直接设置prototype比较麻烦，最好封装一下：

<pre class="prettyprint">
function object(o){
    function F(){}
    F.prototype = o;
    return new F();
}
var person = {
    name : 'abc'
}
var another_person = object(person);
</pre>

另外一种常见的写法：

<pre class="prettyprint">
function extend(Child, Parent) {
    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
}
</pre>

其实原型就是原型，它本身的含义已经非常明确，如果非要和其他编程语言中的概念去做对比就容易把自己绕进去~

参考资料：

1. [Javascript面向对象编程（一）：封装](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_encapsulation.html)
2. [Javascript面向对象编程（二）：构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance.html)
3. [Javascript面向对象编程（三）：非构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance_continued.html)
4. [全面理解面向对象的 JavaScript](http://www.ibm.com/developerworks/cn/web/1304_zengyz_jsoo/)

## 闭包

闭包是一个既神秘又绕，但其本质又非常简单的一个概念：

> 有权访问另一个函数作用域中的变量的函数

赶紧来看一个例子：

<pre class="prettyprint">
function createFunctions(){
    var result = new Array();
    for(var i = 0; i < 10; i++){
        result[i] = function(){
            return i;// 注意这里，访问了外部函数中的变量
        };
    }
    return result;
}
</pre>

直观感觉`result[0]()`的返回值应该是0，实际上并非如此，内部函数可以访问外部函数作用域中的变量，但仅仅是包含一个引用而已，具体到执行的时候才去获取引用指向的值。

闭包绕就绕在作用域上，当它和其他作用域也比较绕的东西勾搭在一起的时候就需要小心了，比如this：

> 当方法被某个对象调用时，this就等于那个对象

我们来比较下面两段代码体会一下就好了，第一段：

<pre class="prettyprint">
var name = "the window";
var obj = {
    name : "my object",
    getNameFunc : function(){
        return function(){
            return this.name;
        }
    }
}
console.log(obj.getNameFunc()()); // the window
</pre>

第二段：

<pre class="prettyprint">
var name = "the window";
var obj = {
    name : "my object",
    getNameFunc : function(){
    	var self = this;
        return function(){
            return self.name;
        }
    }
}
console.log(obj.getNameFunc()()); // my object
</pre>

参考资料：

1. [Javascript的this用法](http://www.ruanyifeng.com/blog/2010/04/using_this_keyword_in_javascript.html)
2. [学习Javascript闭包（Closure）](http://www.ruanyifeng.com/blog/2009/08/learning_javascript_closures.html)
3. [闭包的秘密](http://www.gracecode.com/posts/2385.html)
4. [Private Members in JavaScript](http://www.crockford.com/javascript/private.html)

## DOM和BOM

作为网页脚本语言，需要频繁地和浏览器、文档打交道，**BOM**提供了对象用来访问浏览器的功能：

对象|功能
-|-
window|提供浏览器大小、位置以及很多基础方法
localtion|加载文档的信息
navigator|用来识别浏览器、检测插件、注册处理程序
screen|显示器像素
history|浏览器历史

而**DOM**则是一个多层结构，其中节点类型包括：

类型|含义
-|-
Node|基类，统一维护了节点的层次结构
Document|文档，提供读、写元素的操作，在JavaScript操作文档时经常用到
Element|元素
Text|文本
Comment|注释
CDATASection|XML中的CDATA(这个就不用多说了)
DocumentType|文档类型，能够影响到浏览器渲染时的行为(一个热乎的坑)
Attr|元素的特性

在判断节点类型中经常会用到`nodeName`和`nodeType`，另外有一个属性`childNodes`保存子节点：

> NodeList对象并不是Array，而是基于DOM结构动态查询得到的结果

其他属性（以及其他类型节点特有的属性）就不一一说了，直接用一个图来描述：

![](http://7xiz10.com1.z0.glb.clouddn.com/JavaScript-Basic-1.png)

用jQuery操作DOM很方便的一个原因是CSS选择器，其实在原生的JavaScript中也有类似的接口：

接口|作用
-|-
querySelector|接收一个CSS选择符，返回与该模式匹配的第一个元素
querySelectorAll|返回所有匹配CSS选择符的元素
matchesSelector|检测元素与CSS选择符是否匹配

HTML5规定可以为元素添加非标准的属性，但是要添加前缀`data-`，目的是为元素提供渲染无关的信息，访问时可以使用`dataset`：

<pre class="prettyprint">
&lt;div id="myDiv" data-appId="abc" data-myName="bcd"&gt;&lt;div&gt;
var div = document.getElementById("myDiv");
var appId = div.dataset.appId;
var myName = div.dataset.myName;
</pre>

## 事件

JavaScript可以操作DOM，反过来DOM也可以调用JavaScript，通过事件来实现，第一种绑定方式：

<pre class="prettyprint">
var btn = document.getElementById("myBtn");
btn.onclick = function(){
    alert("Clicked");
}
</pre>

第二种绑定方式：

<pre class="prettyprint">
var btn = document.getElementById("myBtn");
btn.addEventListener("click", function(){
    alert(this.id);
}, false);
</pre>

在事件中最核心的两个概念是：**捕获**和**冒泡**，冒泡是指事件开始时由最具体的元素接收，然后逐级向上传播到较为不具体的节点：

![](http://)

另一种事件流就是捕获了：不太具体的节点更早地接收到事件，而最具体的节点最后收到事件，事件捕获的用意在于事件到达预定节点之前捕获它：

![](http://)

为了阻止事件的向上冒泡常用的方法有：

方法|说明
-|-
return false|阻止触发事件的元素的默认动作，并且阻止冒泡
preventDefault|阻止默认动作
stopPragation|阻止冒泡

最后，可以通过模拟事件来实现快捷键的功能~~

参考资料

1. [javascript中return false;preventDefault();stopPragation()的区别](http://www.cnblogs.com/wang_yb/archive/2013/04/11/3014767.html)

## 通信

网页和服务器异步通信的功能是必不可少的，代码如下：

<pre class="prettyprint">
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function(){ // 监听状态发生变化
    if(xhr.readyState == 4){// 完成
        if((xhr.status &gt;= 200 && xhr.status &lt; 300) || xhr.status == 304){
            alert(xhr.responseText);
        } else{
            alert(xhr.status);
        }
    }
}
xhr.open("get", "xxx.xxx.com", true);
xhr.send(null);
</pre>

JavaScript对请求限制必须是相同域名的（为了安全），但是跨域的需求也是刚需，那么大家只能八仙过海各显神通，常见的方式有：

1. 图像Ping
2. JSONP
3. Comet
4. 服务器发送事件（SSE）

既然禁止跨域并不是合理的，那么就需要提供一套能够安全跨域的方案，于是有了CORS：

> 发送请求时将页面的源信息设置到Origin中，服务器根据Origin来判断是否允许访问，如果允许，那么在返回的头中设置Access-Control-Allow-Origin

参考资料

1. [HTML5中Access-Control-Allow-Origin解决跨域问题](http://www.111cn.net/wy/html5/75509.htm)






如果没有这个头部或者不匹配，浏览器就会驳回请求。多种浏览器在实现时都会做些限制：

1. cookie不会随请求发送，也不会随响应返回
2. 不能访问响应的头部信息
3. 限制对头部信息的设置

和上面的方案相比都是跨域，但是区别还是挺大的。


## 总结

前端需要学的东西太多了，虽然这两天花把JavaScript的基础过了一遍，但是要想在实际中真正的用起来，还是有很多规范、工具要去学的，加油！！！