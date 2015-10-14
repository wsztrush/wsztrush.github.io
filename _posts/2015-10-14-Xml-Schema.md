---
layout: post
title: xml之schema
date: 2015-10-14
categories: 编程技术

---

XML和JSON是两种比较常见的数据格式，但是除了JSON占用的空间小一点之外，其他方面XML绝对可以秒杀JSON格式。

如果我们在做一个系统，让别人去配置一堆的`<bean>`的体验非常差，完全是在QJ用户啊~而如果自定义一个schema的话，不仅配置看起来非常简洁直观，而且在IDE中配置的时候一般都会有很好的提示，逼格也有所提高！

## 定义

在schema中使用`xmlns`来管理元素的定义，比如设置了

<pre class="prettyprint">
xmlns:beans="http://www.springframework.org/schema/beans"
</pre>

可以使用`beans`来使用其中定义的元素

<pre class="prettyprint">
&lt;beans:import resource="xxxx"/&gt;
</pre>

而且可以设置默认命名空间`xmlns="xxxx"`来进一步简化配置为`<import resource="xxx"/>`，在定义schema时可以控制命名空间的使用：

1. **targetNamespace**：目标命名空间
2. **elementFormDefault**：unqualified/qualified
3. **attributeFormDefault**：unqualified/qualified

设置为`unqualified`时schema除根元素以外的元素都没有命名空间，那么配置就变成：

<pre class="prettyprint">
&lt;easydt:easydt xmlns:easydt="http://www.cainiao.com/schema/easydt"&gt;
    &lt;provider xmlns=""/&gt;&lt;!-- 注意这里 --&gt;
&lt;/easydt:easydt&gt;
</pre>

而设置为`qualified`时schema中定义的所有元素都属于targetNamespace所定义的命名空间，这样配置会看起来简单一下：

<pre class="prettyprint">
&lt;easydt:easydt xmlns="http://www.cainiao.com/schema/easydt"&gt;
    &lt;provider/&gt;&lt;!-- 看这里 --&gt;
&lt;/easydt:easydt&gt;
</pre>

一个配置文件看起来是这样的：

<pre class="prettyprint">
&lt;?xml version="1.0"?&gt;
&lt;xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="http://www.w3school.com.cn"
xmlns="http://www.w3school.com.cn"
elementFormDefault="qualified"&gt;
...
...
&lt;/xs:schema&gt;
</pre>

在schema中可以定义很复杂的文档结构，不过其最基本的内容为`<element>`、`<attribute>`，另外可以用`restriction`来设置元素或者属性的取值：

<pre class="prettyprint">
&lt;element name="test"&gt;
    &lt;simpleType&gt;
        &lt;restriction base="integer"&gt;
            &lt;minExclusive value="0"/&gt;&lt;!-- 最小值 --&gt;
            &lt;maxExclusive value="100"/&gt;&lt;!-- 最大值 --&gt;
        &lt;/restriction&gt;
    &lt;/simpleType&gt;
&lt;/element&gt;
</pre>

复杂的类型则需使用`<complexType>`进行组合：

<pre class="prettyprint">
&lt;element name="easydt"&gt;
    &lt;complexType&gt;
        &lt;attribute name="app" type="string" use="required"/&gt;
    &lt;/complexType&gt;
&lt;/element&gt;
</pre>

上面定义的配置格式为`<easydt app="xxx"/>`，设置`use="required"`之后就要求必须有app，不然会报错。常用的元素如下：

元素|作用
-|-
[complexType](http://www.w3school.com.cn/schema/el_complextype.asp)|复杂类型
[complexContent](http://www.phpstudy.net/e/schema/el_complexcontent.html)|对复杂类型的限制或扩展
[simpleType](http://www.w3school.com.cn/schema/el_simpletype.asp)|简单类型，规定与具有纯文本内容的元素或属性的值有关的信息以及对他们的约束
[simpleContent](http://www.w3school.com.cn/schema/el_simpleContent.asp)|对complexType元素的扩展或限制并且不包含任何元素
[sequence](http://www.w3school.com.cn/schema/el_sequence.asp)|数组中的元素按照指定的顺序出现在包含元素中，每个元素可以出现0次到任意次数
[extension](http://www.w3school.com.cn/schema/el_extension.asp)|指定目标进行扩展
[all](http://www.w3school.com.cn/schema/el_all.asp)|子元素可以按照任意顺序出现，每个子元素可以出现一次或者零次
[anyAttribute](http://www.w3school.com.cn/schema/el_anyattribute.asp)|使得配置可以通过未被schema规定的属性来扩展XML文档
[choice](http://www.w3school.com.cn/schema/el_choice.asp)|允许其包含的元素中的一个出现
[group](http://www.w3school.com.cn/schema/el_group.asp)|定义元素组，可以在复杂类型中使用
[attributeGroup](http://www.w3school.com.cn/schema/el_attributegroup.asp)|对属性声明进行组合，这样这些声明就能够以组合的形式合并到复杂类型中

运用这些元素可以方便地配置出复杂的类型，而且可以方便地重用其中一些部分，很直观是不是？在我们自己设计系统的时候也可以借鉴这种思路。

## 解析










## 总结





