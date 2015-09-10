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

操作符也是将弱类型表现的淋漓尽致，比如**"123" == 123**的结果居然是true，而使用**"123" === 123**的时候才会比较类型。另外常用的引用类型有：

1. Array
2. Date
3. RegExp
4. Function
5. Boolean
6. Number
7. String
8. Global：全局对象(不属于任何其他对象的属性和方法都是它的)
9. Math

结构控制中比较特别是加了with语句：

<pre class="prettyprint">
with(location){
    var a = search.substring(1); // var a = location.search.substring(1)
    var b = hostname;// var b = location.hostname
}
</pre>

可以看做是一个作用域操作符！另一个能控制作用域的就只有函数了，没有块作用域也算比较奇葩~ 函数的定义非常灵活：

> 既不需要定义返回值，也不需要定义入参！

其实它是把参数放到数组arguments里面了，处理方式和Python有点像。函数可以作为参数传来传去很容易让人头晕，再加上匿名函数和闭包就更烦了：

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

更复杂度是：this的原始含义为：

> 当方法被某个对象调用时，this就等于那个对象。

**记住**：要时刻小心是是谁在调用方法。那在来看一段代码：

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

在SubType通过**call/apply**来执行SuperType方法，相当于是在当前的实例中产生了SuperType的备份，个人觉得把这种也算作继承有点牵强。

错误处理（try-catch-finally）和Java里面几乎一样，常见的错误类型有：

1. 类型转换错误
2. 数据类型错误
3. 通信错误

在写代码的时候要注意这些问题不要把程序搞挂了~ 语法上与Java等不同的地方基本就这些，下面来看JavaScript在实际前端开发中的应用。

## DOM



## 事件





## 其他


## 总结




