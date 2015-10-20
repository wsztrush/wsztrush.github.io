---
layout: post
title: 模板语言设计
date: 2015-10-15
categories: 编程技术

---

模板语言技术极大的减少了苦逼码农的工作量，使我们从大量的字符串拼接中脱离出来：

1. 有自己的语法控制结构
2. 将两种语法分割

作为一种语言运行的方式无非下面几种：

1. 边处理源码边渲染，和很多的脚本语言类似
2. 生成AST存到内存里面，每次渲染则是在AST上遍历完成
3. 生成目标语言或者字节码等

这篇文章的重点是比较各个模板语言，看看大家设计的思虑~ 具体如何解析、运行看看[《编程语言实现模式》](http://wsztrush.github.io/dsl/2015/09/06/Language-Implementation-Patterns.html)基本可以很快搞出来。

## 有控制结构

从实习就开始用**Velocity**来渲染HTML，感觉好用以至于现在都用它来渲染SQL语句：

<pre class="prettyprint">
#foreach($info in $list)
    $info.someList
#end
</pre>

所有的控制结构都是`#`开头的，而取数据则是`$`开头，剩下普通的字符串就直接向结果中拼接，因为#$在HTML中很少用到，所以这样设计还是非常好用的~

对应的，在前端世界里**EmberJS**与它很像：

<pre class="prettyrpint">
{{#if person}}
    Welcome back, &lt;b&gt;{{person.firstName}} {{person.lastName}}&lt;/b&gt;!
{{else}}
    Please log in.
{{/if}}
</pre>

这两年非常火的**Angular**基本上也是这种思路，用`{{}}`来取数据（双向绑定）：

<pre class="prettyprint">
&lt;div ng-if="person != null"&gt;
    Welcome back, &lt;b&gt;{{person.firstName}} {{person.lastName}}&lt;/b&gt;!
&lt;/div&gt;
&lt;div ng-if="person == null"&gt;
    Please log in.
&lt;/div&gt;
</pre>

由于Angular想做的事情是根据数据的变化来修改页面的展示，用Velocity这种有自己的控制语句来做还是非常困难的，那么更好的思路就是把控制结构与DOM结构绑定，比如`ng-if`，`ng-repeat`等。



## 无控制结构




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




## EmberJS

在绑定数据的同时可以进行一些简单的逻辑控制：



看起来有点像是Angular和Velocity的结合体！越是这么搞越像是在搞静态页面，对于动态页面来说基本是不行的~~

## Mustache

Mustache通常被称为JavaScript模板的基础：

<pre class="prettyprint">
Mustache.render("Hello, {{name}}", { name: "Jack" });
</pre>

用来渲染字符串（或者静态HTML）还是可以的！








