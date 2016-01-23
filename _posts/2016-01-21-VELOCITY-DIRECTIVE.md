---
layout: post
title: 在velocity中自定义标签
date: 2016-01-21
categories: 编程技术

---

用velocity搞html页面很好用，通过一些标签：

1. \#if
2. \#set
3. \#foreach
4. ...

几乎能实现所有需要的渲染逻辑。但是，如果能自定义一些标签，就可以更灵活地在vm中玩耍了，尤其是在实现工具的时候。

## 自定义标签

标签的定义是用velocity的属性来控制的，默认标签的定义存放在：

> org/apache/velocity/runtime/defaults/directive.properties

其中内容为（分别对应`#foreach`等标签、属性值为处理类名）：

<pre class="prettyprint">
directive.1=org.apache.velocity.runtime.directive.Foreach
directive.2=org.apache.velocity.runtime.directive.Include
directive.3=org.apache.velocity.runtime.directive.Parse
directive.4=org.apache.velocity.runtime.directive.Macro
directive.5=org.apache.velocity.runtime.directive.Literal
directive.6=org.apache.velocity.runtime.directive.Evaluate
directive.7=org.apache.velocity.runtime.directive.Break
directive.8=org.apache.velocity.runtime.directive.Define
</pre>

标签（自定义 or 系统的）对应的处理类都需要继承：

> org.apache.velocity.runtime.directive.Directive

并实现三个方法：

方法|作用
-|-
getName|返回标签名
getType|类型，分为LINE和BLOCK两种
render|渲染方法，所有的实现逻辑在这里实现

类型为**LINE**的标签在使用时不需要`#end`来标记结束，而且标签的内容可以分在多行：

<pre class="prettyprint">
#test(123 \n2)
</pre>

类型为**BLOCK**则需要用#end结尾：

<pre class="prettyprint">
#test(123) abc #end
</pre>

要想让自己定义的标签生效，需要在velocity初始化时设置属性：

- 属性名：**userdirective**（在velocity中写死的）
- 属性值：你实现的Directive的类全路径

现在我们来看个最简单的例子：

<pre class="prettyprint">
public static class Test extends Directive {
    public String getName() {
        return "test";
    }
    public int getType() {
        return LINE;
    }
    public boolean render(InternalContextAdapter context, 
        Writer writer, 
        Node node) throws IOException, ResourceNotFoundException, ParseErrorException, MethodInvocationException {
        writer.write("abc");// 啥都不做，直接输出abc
        return true;
    }
}
</pre>

然后初始化一个VelocityEngine测试`#test`标签：

<pre class="prettyprint">
VelocityEngine engine = new VelocityEngine();
//.. 省略若干属性设置
engine.addProperty("userdirective", "Test");

Template template = engine.getTemplate("#test");
StringWriter writer = new StringWriter();
template.merge(new EasydtContext(), writer);
System.out.println(writer.toString()); // 输出：abc
</pre>

用标签来实现的功能无非是做一些字符串的处理，处理过程中能拿到的信息都在render方法参数中：

参数|含义
-|-
context|保存上下文
writer|用来输出字符串
node|抽象语法树中和当前位置对应的节点

可以从节点（node）中拿到一些有意思的信息，比如：

- 模板名称
- 行号
- 列号
- 子节点

有了这些信息类似[这里](http://www.ibm.com/developerworks/cn/java/j-lo-velocity/)实现#cache时就不需要手动传入key了。回到正题，render其实是在抽象语法树上递归下降的过程，比如#foreach中：

<pre class="prettyprint">
// render方法中
node.jjtGetChild(3).render(context, writer);
</pre>

当然我们也可以继续用上面的例子测试，修改render方法：

<pre class="prettyprint">
render(/* ... */){
    StringWriter tmpWriter = new StringWriter();
    node.jjtGetChild(0).render(context, tmpWriter); // 递归执行
    writer.write(tmpWriter.toString());
    return true;
}
</pre>

测试使用的模板为`#test()#if(true)abc#end#end`，输出结果依然是abc。


## 在webx中扩展

在springmvc中设置velocity的属性还是非常简单的（略），但是webx做了相当多的约定性质的扩展（[参考](http://openwebx.org/docs/springext.html)），下面来看在webx中自定义velocity标签以及其他扩展的方法，创建文件：

> /META-INF/services-template-engines-velocity-plugins.bean-definition-parsers

其中的内容为：

<pre class="prettyprint">
my-support=com.xxx.MySupportDefinitionParser
</pre>

其中：

- 属性：标签名称
- 值：解析实现类，用来解析配置

编辑**my-support.xsd**，格式可以参考[这里](http://wsztrush.github.io/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2015/10/14/Xml-Schema.html)，这里就不写了，然后需要实现：

> com.xxx.MySupport

在其初始化方法（init）中可以对velocity的属性进行设置，具体的实现逻辑可以参考EscapeSupport，最后将添加到webx的配置中：

<pre class="prettyprint">
&lt;services:template xmlns="http://www.alibaba.com/schema/services/template/engines" searchExtensions="true"&gt;
    &lt;velocity-engine&gt;
        &lt;plugins&gt;
            &lt;vm-plugins:my-support/&gt;
        &lt;/plugins&gt;
    &lt;/velocity-engine&gt;
&lt;/services:template&gt;
</pre>

## 思考和总结

自定义标签的功能像是在velocity中开了一个口子，让我们实现自己的逻辑，甚至可以在vm中嵌套使用渲染引擎（在上面的例子中可以看出来这点吧）：

1. 使用velocity渲染
2. 使用自定义的引擎渲染，将最终的结果写到writer中

如果将这种看作是在velocity处理后扩展，那么：

> 有没有办法在velocity之前进行扩展？

答案是肯定的，现在想到的比较简单的方式是在ResourceLoader上做手脚，应该还有其他的思路。