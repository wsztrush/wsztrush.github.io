---
layout: post
title: xml之schema
date: 2015-10-14
categories: 编程技术

---

在网络传输中JSON和XML是最长用的两种数据格式，JSON的特点是短小、简单，但是除了这点以外就完全不能跟XML比了，所以涉及到配置方面还是优先考虑XML吧！

但是裸奔的XML并不好用，比如我们打出来Jar包给别人用，需要他们自己在Spring配置中添加：

<pre class="prettyprint">
&lt;bean class="xxxxxx"/>
</pre>

功能简单的时候是没有问题的，当你做的东西比较复杂的时候就会变成：

<pre class="prettyprint">
&lt;bean class="xxx"&gt;
    &lt;property name="aaa" value="aaa"/&gt;
    &lt;property name="bbb" value="bbb"/&gt;
    &lt;property name="ccc" value="ccc"/&gt;
&lt;/bean&gt;
</pre>

除非在你的WILE里面写的非常清楚应用用哪个`class`，需要设置哪些`property`，哪些是必填的等等等，不然没人知道该怎么写，而更好的解决办法是编写schema来定义XML的规则！

## 命名空间（xmlns）

我们在配置Spring的时候经常会这么写：

<pre class="prettyprint">
&lt;beans:beans xmlns:beans="http://www.springframework.org/schema/beans"&gt;
    &lt;beans:import resource="xxx"/&gt;
&lt;/beans:beans&gt;
</pre>

其中`http://www.springframework.org/schema/beans`就是一个命名空间，而`xmlns:beans`相当于设置了命名空间的一个代号，在使用时`beans:import`就可以表示使用该命名空间中的import元素。

可以不写`:beans`来表示默认就用该命名空间，那么配置就更简单了：

<pre class="prettyprint">
&lt;beans xmlns="http://www.springframework.org/schema/beans"&gt;
    &lt;import resource="xxx"/&gt;
&lt;/beans&gt;
</pre>

在schema中由下面三个属性来控制命名空间的行为：

1. targetNamespace：目标命名空间
2. elementFormDefault：unqualified/qualified
3. attributeFormDefault：unqualified/qualified

当设置`unqualified`时schema中除了根元素以外，其他的元素都是没有命名空间的，在使用的时候需要将其命名空间设置为空：

<pre class="prettyprint">
&lt;easydt:easydt xmlns:easydt="http://www.cainiao.com/schema/easydt"&gt;
    &lt;provider xmlns=""/&gt;&lt;!-- 注意这里 --&gt;
&lt;/easydt:easydt&gt;
</pre>

而设置为`qualified`时schema中定义的所有元素都属于`targetNamespace`所定义的命名空间：

<pre class="prettyprint">
&lt;easydt:easydt xmlns="http://www.cainiao.com/schema/easydt"&gt;
    &lt;provider/&gt;&lt;!-- 看这里 --&gt;
&lt;/easydt:easydt&gt;
</pre>

显然用qualified看起来更简单一些，不过也是看情况的。

## 定义元素

完整的schema的定义如下：

<pre class="prettyprint">
&lt;?xml version="1.0"?&gt;
&lt;xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
targetNamespace="http://www.w3school.com.cn"
xmlns="http://www.w3school.com.cn"
elementFormDefault="qualified"&gt;
    在这里定义元素和属性
&lt;/xs:schema&gt;
</pre>

其目的就是配置出来一堆的`element`和`attribute`来约束XML的行为，简单来说

<pre class="prettyprint">
&lt;yyy xxx="xxx"/&gt;
</pre>

其中：yyy是element、xxx是属性！最简单的元素如下：

<pre class="prettyprint">
&lt;easydt:a&gt;123&lt;/easydt:a&gt;
</pre>

对应的配置如下：

<pre class="prettyprint">
&lt;xs:element name="a" type="xs:integer"/&gt;
</pre>

设置type为`integer`之后会对内容进行检查，如果不是数字则报错，另外可以通过`simpleType`对其扩展来实现更复杂的限定：

<pre class="prettyprint">
&lt;xs:element name="age"&gt;
    &lt;xs:simpleType&gt;
        &lt;xs:restriction base="xs:integer"&gt;
            &lt;xs:minInclusive value="0"/&gt;
            &lt;xs:maxInclusive value="100"/&gt;
        &lt;/xs:restriction&gt;
    &lt;/xs:simpleType&gt;
&lt;/xs:element&gt;
</pre>

向元素中添加子元素、属性之后就不是一个简单元素，而是一个复杂元素，可以用`complexType`定义其类型：

<pre class="prettyprint">
&lt;xs:element name="note"&gt;
    &lt;xs:complexType&gt;
        &lt;xs:attribute name="app" type="xs:string"/&gt;
    &lt;/xs:complexType&gt;
&lt;/xs:element&gt;
</pre>

对应的XML的配置为`<easydt:note app="123"/>`，子节点的定义也很简单：

<pre class="prettyprint">
&lt;xs:element name="note"&gt;
    &lt;xs:complexType&gt;
        &lt;xs:sequence&gt;
            &lt;xs:element name="a" type="xs:integer"/&gt;
            &lt;xs:element name="b" type="xs:integer"/&gt;
        &lt;/xs:sequence&gt;
    &lt;/xs:complexType&gt;
&lt;/xs:element&gt;
</pre>

对应的XML的配置为`<note><a>1</a><b>2</b></note>`，其中sequence的作用是

> 组中的元素以指定的顺序出现在包含元素中，每个子元素可以出现0次到任意次

当然还有其他的方式：

指示器|含义
-|-
all|子元素可以按照任意顺序出现，且每个子元素必须只出现一次
choice|随便添加子元素，可以使用`maxOccurs`来设置可添加子元素的数目
attributeGroup|属性组
group|元素组

元素的类型是非常复杂的，不同的类型之间很可能有一些定义是可以重用的，我们可以定义一些基础的类型，然后使用`extension`对其进行扩展可以得到：

<pre class="prettyprint">
&lt;xs:complexType name="baseInfo"&gt;
    &lt;xs:sequence&gt;
        &lt;xs:element name="id" type="xs:string"/&gt;
    &lt;/xs:sequence&gt;
&lt;/xs:complexType&gt;
&lt;xs:complexType name="fullpersoninfo"&gt;
    &lt;xs:complexContent&gt;
        &lt;xs:extension base="baseInfo"&gt;
            &lt;xs:sequence&gt;
                &lt;xs:element name="name" type="xs:string"/&gt;
            &lt;/xs:sequence&gt;
        &lt;/xs:extension&gt;
    &lt;/xs:complexContent&gt;
&lt;/xs:complexType&gt;
</pre>

其他元素的可以在[这里](http://www.w3school.com.cn/schema/schema_elements_ref.asp)查看使用方法~~

当上面这些不能满足你的需求时，可以使用`any`、`anyAttribute`来允许用户配置没有在schema中定义过的东西，然后在解析的阶段进行处理！

## 解析

在Spring中定义解析需要用下面两个文件来配置（需要放在META-INF目录，Spring会自动加载）：

1. **spring.schemas**：命名空间对应的schemas配置的位置
2. **spring.handlers**：命名空间对应的解析类

来看个例子：

<pre class="prettyprint">
// spring.schemas
http\://www.cainiao.com/schema/easydt/easydt.xsd=META-INF/easydt.xsd
// spring.handlers
http\://www.cainiao.com/schema/easydt=com.cainiao.easydt.client.springTag.EasyDtNamespaceHandler
</pre>

在`NamespaceHandlerSupport`中定义了遇到对应的元素的时候应该使用Parser：

<pre class="prettyprint">
public class EasyDtNamespaceHandler extends NamespaceHandlerSupport {
	public void init() {
		registerBeanDefinitionParser("easydt", new EasyDtBeanDefinitionParser());
	}
}
</pre>

然后用`AbstractBeanDefinitionParser`中拿到配置信息并使用`addPropertyValue`来定义BeanDefinition：

<pre class="prettyprint">
public class EasyDtBeanDefinitionParser extends AbstractSingleBeanDefinitionParser{
	protected Class&lt;EasyDt&gt; getBeanClass(Element element) {
		return EasyDt.class;
	}
	protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
		builder.addPropertyValue("domain", element.getAttribute("domain"));
	}
}
</pre>

关于BeanDefinition的载入和解析的过程可以看[这里](http://book.51cto.com/art/201203/322589.htm)，具体的解析工作是交给`BeanDefinitionParserDelegate`来完成的，如果子元素不是简单元素可以调用`parseCustomElement`来完成解析：

<pre class="prettyprint">
builder.addPropertyValue("provider",
    parserContext.getDelegate().parseCustomElement(
        DomUtils.getChildElementByTagName(element, "provider"),
        builder.getRawBeanDefinition()));
</pre>

想更灵活地在Spring中玩耍XML还是要多看看Bean的解析过程。

## 总结

用这些最基本的用法基本可以搞定大部分的自定义schema的需求，对于复杂的还需要深入去研究。