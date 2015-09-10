---
layout: post
title: JavaScript基础知识
date: 2015-09-09
categories: 编程技术

---

![](http://img3.douban.com/mpic/s8958650.jpg)

最近被逼着学习JavaScript，这篇也算是记得一些笔记，如果你对其他的语法（Java等）比较熟悉，那么看完这篇文章并实践一下，也差不多算入门了:)

## 基本语法

JavaScript中包括六种基本类型：

类型|含义
-|-
undefined/null|区别看[这里](http://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html)
boolean|需要注意从其他类型转换到Boolean的规则
number|整数、浮点数、NaN
string|字符串
object|数据、对象的集合，是所有对象的基础

接着来体会一下弱类型的方便之处：**"123" == 123**的结果居然是true，而**"123" === 123**才是预期中的false，此时会比较类型。常用的引用类型有：

1. Array
2. Date
3. RegExp
4. Function
5. Boolean
6. Number
7. String
8. Global：全局对象(不属于任何其他对象的属性和方法都是它的)
9. Math

结构控制语句中比较特别是加了**with**：

<pre class="prettyprint">
with(location){
    var a = search.substring(1); // var a = location.search.substring(1)
    var b = hostname;// var b = location.hostname
}
</pre>

可以看做是一个作用域操作符！另一个能控制作用域的就只有函数了，没有块作用域也算比较奇葩~ 函数的定义非常灵活：

> 既不需要定义返回值，也不需要定义入参！

其实它是把参数放到数组**arguments**里面了，处理方式和Python有点像。函数可以作为参数传来传去很容易让人头晕，再加上匿名函数和闭包就更烦了：

> 闭包是指有权访问另一个函数作用域中变量的函数，也就是在一个函数内部创建的函数。

来看看段代码理解一下闭包：

<pre class="prettyprint">
function createFunctions(){
    var result = new Array();
    for(var i = 0; i < 10; i++){
        result[i] = function(){
            return i;
        };
    }
}
</pre>

返回的方法数组每个的返回结果都是相同的，是不是和预期的不一样？要达到预期的效果需要：

<pre class="prettyprint">
function createFunctions(){
    var result = new Array();
    for(var i = 0; i < 10; i++){
        result[i] = function(num){
            return num;
        }(i);
    }
}
</pre>

更复杂度是：**this**的原始含义为：

> 当方法被某个对象调用时，this就等于那个对象。

**记住**：要时刻小心是是谁在调用方法，再来看一段代码：

<pre class="prettyprint">
var name = "the window";
vra obj = {
    var name = "my object";
    getNameFunc : function(){
        return function(){
            return this.name;
        }
    }
}
alert(obj.getNameFunc()());// the window
</pre>

是不是隐隐感觉到了**闭包+this**组合的强大威力？虽然很多程序猿没有对象，但面向对象编程是一个永恒的话题：

> 对象是无序属性的集合，其属性可以包含基本值、对象或者函数。

有一些属性只给引擎内部使用，在我们自己写的JavaScript中是无法访问的，常用的有：

1. configurable
2. enumerable：能否通过for-in循环，默认为true
3. writable：能否修改属性的值
4. value：值
5. get：在读取属性时调用的函数
6. set：在设置属性时调用的函数

创建对象除了用**new Object**之外还可以用构造函数**new Person**：

<pre class="prettyprint">
function Person(name, age, job){
    this.name = name;
    this.job = job;
    this.age = age;
}
var person = new Person();
</pre>

其背后处理的逻辑如下：

1. 创建一个新对象
2. 将构造函数函数的作用域赋给新对象（因此this指向了新对象）
3. 执行构造函数中的代码
4. 返回新对象

创建自定义的构造函数意味着将它的实例标志为一种特定的类型，这也是其优势所在：

<pre class="prettyprint">
alert(person instanceof Person); // true
</pre>

而最大的劣势在于：

> 每个方法都要在每个实例上创建一遍。

上面是将方法当成属性来使用，其实还有一种将方法当成方法来用的方法:)

<pre class="prettyprint">
function Person(){
}
Person.prototype = {
    name : "a";
    sayName : function(){
        alert(this.name);
    }
}
</pre>

在方法的**prototype**中指定的属性（原型），对其所有的实例可用，这样方法的用法就和Java一致，而属性就像是类的静态属性，而且可以方便地用来模仿继承：

<pre class="prettyprint">
function SubType(){
    this.sayHello = function(){
        alert("hello");
    }
}
function SuperType(){
}
SubType.prototype = SuperType;
new SubType().sayHello();// hello
</pre>

总的来说继承更像是提供了一个默认的parent指针，在查找属性、方法的时候可以递归向上查找，但是用不好的时候会出现一些莫名其妙的问题：

<pre class="prettyprint">
function Super(){
    this.key = [1, 2, 3];
}
function A(){}
function B(){}

A.prototype = new Super();

var a1 = new A();
a1.key.push(4);
alert(a1.key);// [1, 2, 3, 4]

var a2 = new A();
alert(a2.key);// [1, 2, 3, 4]

// 用一个公共的方法来包装对象，这样就可以直接在对象上"继承"了
function object(o){
    function F(){}
    F.prototype = o;
    return new F();
}
</pre>

在ECMAScript 5中新增了方法**Object.create()**规范了原型继承（类似object方法）。把SuperType中的属性共享给SubType的每个实例可能不能满足需求，那么可以试试下面这种方法：

<pre class="prettyprint">
function SuperType(){
    this.colors = [1, 2, 3];
}
function SubType(){
    SuperType.call(this); // apply也可以
}
var instance1 = new SubType();
instance1.colors.push(4);
alert(instance1.colors);// [1,2,3,4]

var instance2 = new SubType();
alert(instance2.colors);// [1,2,3]
</pre>

在SubType通过**call/apply**来执行SuperType方法，相当于是在当前的实例中产生了SuperType的备份，个人觉得把这种也算作继承有点牵强。最后，错误处理（try-catch-finally）和Java里面几乎一样，常见的错误类型有：

1. 类型转换错误
2. 数据类型错误
3. 通信错误

在写代码的时候要注意不要因为这些问题把程序搞挂了~

## DOM与BOM

**BOM**(浏览器对象模型)中提供了对象用来访问浏览器的功能：

对象|功能
-|-
window|提供浏览器大小、位置以及很多基础方法
localtion|加载文档的信息
navigator|用来识别浏览器、检测插件、注册处理程序
screen|显示器像素
history|浏览器历史

浏览器就是JavaScript的运行环境，不同的浏览器实现的不同到时运行会有意想不到的结果，在做兼容性时需要写逻辑代码来测试浏览器对需要的功能是否支持！

**DOM**(文档对象模型)是针对HTML和XML文档的一个API，将它们描绘成一个由多层节点构成的结构，节点的类型包括：

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

写JavaScript比较爽的就是随时运行随时生效，具体操作DOM的API还是很简单的，打开**console**尝试一下吧:)

## 事件

JavaScript与HTML之间的交互是通过事件来实现的，而事件则是文档或者浏览器窗口中发生的一些特定的**交互瞬间**。事件流的方式有两种：

1. **事件冒泡**：由最具体的元素接收，然后逐级上传
2. **事件捕获**：上层节点更早接收到事件，而最具体的节点最后收到

第一种监听事件的方式为直接绑定属性：

<pre class="prettyprint">
var btn = document.getElementById("myBtn");
btn.onclick = function(){
    alert("Clicked");
}
</pre>

另一种方法为增加监听器，用这种方法可以为同一个时间添加多个监听器（虽然没啥用）

<pre class="prettyprint">
var btn = document.getElementById("myBtn");
btn.addEventListener("click", function(){
    alert(this.id);
}, false);
</pre>

不同浏览器的API有所不同，可以统一封装掉提供一个EventUtil来操作事件监听，在事件对象（event）中包含了相关的信息，细节就不讲了，常见的事件类型有下面几种：

1. UI事件
2. 焦点事件
3. 鼠标与滚轮事件
4. 键盘与文本事件
5. 复合事件
6. 变动事件
7. HTML5事件
8. 设备事件
9. 触摸与手势事件
10. 拖放事件

事件也是要消耗内存的，使用需谨慎！

## 通信

既然是浏览器脚本语言，和服务器通信自然是少不了的：

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

现代Web应用中频繁使用的一项功能就是表单数据序列化，XMLHttpRequest2级为此定义了**FormData**类型。使用Ajax进行跨域是比较常见的需求，之前都是利用一些浏览器允许跨域的请求来做：

1. 图像Ping
2. JSONP
3. Comet
4. 服务器发送事件（SSE）
5. Web Scokets

既然大家这么需要跨域，而且浏览器禁止不住，那干脆就提供一套好用的协议出来，于是有了CORS（跨域资源共享）：

> 发请求时将请求页面的源信息设置到Origin中，服务器根据Origin来判断是否允许访问，如果运行返回的头中设置Access-Control-Allow-Origin:*。

如果没有这个头部或者不匹配，浏览器就会驳回请求。多种浏览器在实现时都会做些限制：

1. cookie不会随请求发送，也不会随响应返回
2. 不能访问响应的头部信息
3. 限制对头部信息的设置

和上面的方案相比都是跨域，但是区别还是挺大的。

## 其他

操作JSON、XML等数据，这里就记了，都是API~

## 总结

前端需要学的东西太多了，虽然这两天花把JavaScript的基础过了一遍，但是要想在实际中真正的用起来，还是有很多规范、工具要去学的，加油！！！