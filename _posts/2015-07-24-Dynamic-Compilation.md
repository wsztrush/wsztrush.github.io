---
layout: post
title: Java中的动态执行
date: 2015-07-21
categories: 编程技术

---

假如你在用Java的碰到这些问题：

1. 灵活地配置规则
2. 部署代码无需重启即时生效

而恰恰你是个“low逼”或者“懒货”不想（更多的是不行）去定义自己的脚本、规则引擎，那么下面这些可能是个不错的选择。

## Groovy的使用

Groovy是一种基于JVM的敏捷开发语言，可以无缝与Java整合：

<pre class="prettyprint">
Binding binding = new Binding();
binding.setProperty("foo", new Integer(2));
GroovyShell shell = new GroovyShell(binding);
shell.evaluate("println foo");
</pre>

用**GroovyShell**看起来是非常简单的，但问题是每次在evaluate的时候都需要去解析、编译，速度肯定是上不去的，另外也会频繁地产生很多的Class，增加了内存回收的负担（甚至OOM），但是也看具体使用场景~~

<pre class="prettyprint">
String[] roots = new String[] { "your groovy script path" };
GroovyScriptEngine gse = new GroovyScriptEngine(roots);
Binding binding = new Binding();
binding.setProperty("foo", new Integer(2));
gse.run("GroovyShellHellow.groovy", binding);
</pre>

用**GroovyScriptEngine**的时候有了缓存，而且用起来也更加简单，用起来也很简单了，但是很多人开始诟病Groovy脚本的性能，确实是比较低，再来看一种处理方式：

<pre class="prettyprint">
new GroovyClassLoader().parseClass("print 123");// 得到Class
</pre>

在用**GroovyClassLoader**生成好Class之后通过反射调用对应的方法。有人可能觉得这种方法弱爆了，又难用又效率低，但是如果将生成的Class缓存起来呢？等等，应该怎么生成Class？

<pre class="prettyprint">
CompilerConfiguration configuration = new CompilerConfiguration();
configuration.setOutput(new PrintWriter(new FileWriter("D:\\a")));
configuration.setTargetDirectory("D:\\");
new GroovyClassLoader(
    Thread.currentThread().getContextClassLoader(),
        configuration)
        .parseClass("print 123");
</pre>

好了，讲差不多了，我们来重点看下GroovyClassLoader吧。可能在你看完GroovyScriptEngine之后会说：GroovyScriptEngine已经将GroovyClassLoader封装的挺不错的来，但是会有一个问题：

> 其中用的是同一个ClassLoader，在脚本发生变化的时候就生成新的Class，时间久了Perm就满了。

现在可以对GroovyClassLoader根据业务具体的需求进行封装即可，在上面的代码中可以在指定的文件夹中就可以生成好Class。

> 既然GroovyClassLoader直接可以解析脚本，为什么还需要生成Class。

如果做的平台用的人非常多，成千上万个脚本都是有可能的（虽然现在一个都没有），那么在系统启动的时候是不是要把所有的脚本拿下来编译一遍？这个可能会比较影响启动的速度，所以可以在保存Script的时候再保存一个Class文件，在系统启动的时候直接去Load即可。

再来看Groovy的好处：

<pre class="prettyprint">
@TypeChecked
int func(){
    def a = 123;
    a = a + "";
    return a;// 这里会报错
}
</pre>

在Groovy的2.0版本以后加入了静态类型检查器，可以在编写代码的时候看到类型错误。动态语言太灵活了，这样可以减少很多开发的成本，因为不用等到运行的时候才发现错误。

<pre class="prettyprint">
@CompileStatic
int func(){
    123 + 123 + 123;
}
</pre>

使用**@CompileStatic**注释将会静态地编译代码，产生的字节码和Java运行得一样快，这样看来性能也将不再是问题。

最后，现在很多规则的配置都用Groovy来解决，因为处理Map、新建类等非常方便，如果用原生的Java写的话，配置的时候不会真方便，当然，编译Java代码的方式也是要研究一下的。

## 动态编译Java源码

### JavaFileManager














