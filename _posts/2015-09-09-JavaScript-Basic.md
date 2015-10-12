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

闭包是一个既神秘又绕但其本质又非常简单的一个概念：

> 有权访问另一个函数作用域中的变量的函数

赶紧来看一个例子：

<pre class="prettyprint">
function createFunctions(){
    var result = new Array();
    for(var i = 0; i < 10; i++){
        result[i] = function(){
            return i;
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