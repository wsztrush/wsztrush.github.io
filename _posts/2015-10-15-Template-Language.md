---
layout: post
title: 模板语言的设计
date: 2015-10-15
categories: 编程技术

---

最近在搞数据报表的显示配置，有点头疼，想自己设计一套DSL来做，原因是：

1. 上手成本低
2. 可以持续添加新功能
3. 在实现不同功能时可以用不同的引擎进行解析

但是现在的各种也不更新，简直可以把一个页面当做是一个应用来看！要定义这样的DSL也不是一件容易的事情，还是要好好从现有的模板中找找灵感~~

## Velocity

在后端的世界里Velocity应该是非常著名的，一个简单的循环如下：

<pre class="prettyprint">
#foreach( $info in $list)
	$info.someList
#end
</pre>

在进行渲染时，从上下文中取出变量将`$info.someList`进行替换，于是得到了一个静态的字符串（页面），自身的逻辑控制则用`#`打头的一些关键字来做！

用了这么些年，感觉用来生成静态页面（有时候也会用来当做模板引擎渲染SQL啥的）还是很好用的！但是不适合用它来写复杂的逻辑！

## React

最近两年React红的发紫，不仅仅因为有个好爹，体验了一下感觉JSX还是不错的：

<pre class="prettyprint">
var root =(
    &lt;ul className="my-list"&gt;
        &lt;li&gt;First Text Content&lt;/li&gt;
        &lt;li&gt;Second Text Content&lt;/li&gt;
    &lt;/ul&gt;
);
</pre>

这种JS和XML混排的方式看着有点头大，但是仔细看下还是挺直观的！在遇到`<xxx>`的时候创建元素，在遇到`{xxx}`的时候当做JS解析，而最终是将其翻译成JS代码来执行：

<pre class="prettyprint">
var child1 = React.createElement('li', null, 'First Text Content');
var child2 = React.createElement('li', null, 'Second Text Content');
var root = React.createElement('ul', { className: 'my-list' }, child1, child2);
</pre>

让JS参与到模板渲染的过程中能极大地提高模板的能力，但是问题是太灵活了以至于数据变化的时候都不知道该怎么修改DOM了，这么看来虚拟DOM的**Diff**算法其实也是无奈之举~~~

## Angular

感觉Angular中最有特色的就是用`{{}}`做双向数据绑定：

<pre class="prettyprint">
&lt;div ng-if="person != null"&gt;
    Welcome back, &lt;b&gt;{{person.firstName}} {{person.lastName}}&lt;/b&gt;!
&lt;/div&gt;
&lt;div ng-if="person == null"&gt;
    Please log in.
&lt;/div&gt;
</pre>

但是对于列表什么的比较复杂的结构怎么搞？`ng-repeat`貌似不是一个很好的选择~


## EmberJS

在绑定数据的同时可以进行一些简单的逻辑控制：

<pre class="prettyrpint">
{{#if person}}
  Welcome back, &lt;b&gt;{{person.firstName}} {{person.lastName}}&lt;/b&gt;!
{{else}}
  Please log in.
{{/if}}
</pre>

看起来有点像是Angular和Velocity的结合体！越是这么搞越像是在搞静态页面，对于动态页面来说基本是不行的~~

## Mustache

Mustache通常被称为JavaScript模板的基础：

<pre class="prettyprint">
Mustache.render("Hello, {{name}}", { name: "Jack" });
</pre>

用来渲染字符串（或者静态HTML）还是可以的！








