---
layout: post
title: 模板语言设计
date: 2015-10-15
categories: 编程技术

---

平时各种模板用的很HIGH，但是当有一天遇到一个特殊需求，貌似现在的各种模板都不是那么好用，那么就不得不系统地思考一下模板语言应该如何设计~

## Veolcity

做过WEB开发的JAVAER可能都这么干过：

<pre class="prettyprint">
String data = "&lt;body&gt;hello world&lt;/body&gt;";
OutputStream outputStream = response.getOutputStream();
response.setHeader("content-type", "text/html;charset=UTF-8");
outputStream.write(data.getByte("UTF-8"));
</pre>

简单的输出没问题，稍微复杂一点就不行了：

1. 程序复杂
2. 代码几乎没有可读性和可维护性

在使用Velocity之后情况有了明显的好转，当你想输出一个列表的时候可以这么干：

<pre class="prettyprint">
&lt;ul&gt;
	#foreach($i in $list)
	&lt;li&gt;$i&lt;/li&gt;
	#end
&lt;/ul&gt;
</pre>

这种写法非常直观以至于我现在都用它来渲染SQL语句，如果你也想这么玩需要自己定义**ResourceLoader**来自定义资源加载。编写Velocity模板时只需要记住两个关键点：

1. 所有的控制结构是以`#`开头
2. 所有的取数据逻辑以`$`开头（恰好你也在用jQuery的话会产生冲突）

而其他的部分都会append到输出，使用时如果每次都对模板进行解析那速度估计就跟蜗牛一样，正确的姿势应该是**编译并缓存**（这些内容与主题关系不大就不说了）。

其中语法设计的核心思想是：

> 使用HTML（甚至普通文本）中很少用到的字符来区分语法结构

学习成本很低，但是单纯地使用它来编写一些复杂的逻辑还是很痛苦的事情。不过相比较来看**FreeMarker**的写法更让人难受，加个`<`有啥意义么（估计会被喷）：

<pre class="prettyprint">
&lt;ul&gt;
	&lt;#list list as i&gt;
		&lt;li&gt;i&lt;/li&gt;
	&lt;/#list&gt;
&lt;/ul&gt;
</pre>

类似的模板引擎还有**CommonTemplate**、**HTTL**等。虽然这些技术已经将性能提到到一个很高的水准，但在后端处理页面展示还是非常局限：

> 只能每次都获取全部的数据并把页面渲染一遍

浪费服务器资源不说，体验也很差，真是出力不讨好！

## Angular

在JavaScript的世界里也有与Velocity相似的模板技术（更多可以看[这里](http://cdc.tencent.com/?p=5723)）：

<pre class="prettyprint">
&lt;h3&gt;
&lt;% if (typeof content === 'string'){ %&gt;
	&lt;%= content %&gt;
&lt;% } %&gt;
&lt;/h3&gt;
</pre>

从Java转JavaScript可能觉得这种方式很好用：在数据发生变化的时候执行一下render然后替换掉原先改位置的DOM结构就可以了~ 但是能不能更进一步：

> DOM结构随着数据的变化而自动跟着变化

看起来是终极目标，貌似[Angular](http://www.apjs.net/)完美地实现了：

<pre class="prettyprint">
Your name: &lt;input type="text" ng-model="yourname" placeholder="World"&gt;
&lt;hr&gt;
My name: &lt;input type="text" ng-model="yourname" placeholder="World"&gt;
</pre>

执行的效果为：

![](http://)

两个输入框的内容，你随便改变哪一个，另一个都会随之变化，这就是**双向绑定**（也许你已经注意到`ng-model`了），当你需要输出列表时要用到`ng-repeat`：

<pre class="prettyprint">
&lt;ul&gt;
    &lt;li ng-repeat="o in question.options"&gt;
        &lt;b&gt;{{$index+1}}.&lt;/b&gt;
        &lt;input type="radio" name="optcheck" /&gt;
        {{o.content}}
    &lt;/li&gt;
&lt;/ul&gt;
</pre>

这种思想非常先进，和之前出现的模板都是不一样的：

> 之前的模板都是静态的，像一锤子买卖，而Angular的模板是动态的！

刚开始接触前端的时候也想过这个问题，但是实在没有想出来应该如何定义这样的模板语言，而Angular则已经实现了，但是代价就是上手成本高：

1. 模块
2. 控制器
3. 过滤器
4. 指令
5. 作用域
6. ...

可能大家不明白为什么上手成本高：当你在适合Angular的例子上操作的时候上手非常容易，但是实现复杂的功能需要熟悉很多不那么直观的概念。还有一点比较不喜欢的是：

> 将展示和数据完全分开，甚至模板与展示相关的判断逻辑也分开！

这样确实能保持模板的简洁，但是总体上是否简洁、直观就不好说了。甚至连双向绑定这么好的卖点都有时候会被吐槽：

![](http://)

在页面复杂的时候双向数据绑定的行为可能是预测不出来（这点保留意见，没有深入玩过）。

参考资料：

1. [走进AngularJs(一)angular基本概念的认识与实战](http://www.cnblogs.com/lvdabao/p/AngularJs.html?utm_source=tuicool&utm_medium=referral#myexample)
2. [走进AngularJs(二) ng模板中常用指令的使用方式](http://www.cnblogs.com/lvdabao/p/3379659.html)
3. [2015年的JavaScript：Angular之类的框架将被库取代](http://ourjs.com/detail/5483d2d10dad0fbb6d000014)
4. [AngularJS 作用域与数据绑定机制](https://www.ibm.com/developerworks/cn/opensource/os-cn-AngularJS/)
5. [我是怎么从顾虑到热爱ReactJS的(与AngularJS经典MVC数据绑定的对比)](http://ourjs.com/detail/5567c046d11a73aa4d000003)

## React

上面已经有文章把它与Angular进行了比较，那么现在我们来近距离看看最近红得发紫的React，第一关是**JSX**语法：

<pre class="prettyprint">
var root =(
  &lt;ul className="my-list"&gt;
    &lt;li&gt;First Text Content&lt;/li&gt;
    &lt;li&gt;Second Text Content&lt;/li&gt;
  &lt;/ul&gt;
);
</pre>

看起来就是将HTML代码嵌入到JavaScript中，看起来很怪但是也比较容易理解，而真正得到的代码如下:

<pre class="prettyprint">
var root = React.createElement(
    "ul",
    { className: "my-list" },
    React.createElement("li", null, "First Text Content"),
    React.createElement("li", null, "Second Text Content")
);
</pre>

当然你也可以在[babel在线工具](https://babeljs.io/repl/)来体验这种语法。

看起来很美好，但实际上也不能太任性：在模板中也仅仅是能取数据而已，控制语句`for`等不能使用（多用babel玩一下就能体会到从JSX到JS之间的转换有多简单）：

> 思路有点像Angular那样去扩展HTML原有的东西（Angular扩展的是Attribute，而React进一步扩展了Element）！

在用React的时候需要过的第二关是**生命周期**，讲道理的话生命周期这种东西应该越简单越合理，然而并不是这样：

状态|含义
-|-
Mounting|已插入真实 DOM
Updating|正在被重新渲染
Unmounting|已移出真实 DOM

为每个状态配了两个处理函数：`will`函数在进入状态之前调用，`did`函数在进入状态之后调用：

1. componentWillMount
2. componentDidMount
3. componentWillUpdate
4. componentDidUpdate
5. componentWillUnmount

另外提供两个特殊状态的处理函数：

函数|作用
-|-
componentWillReceiveProps|已加载组件收到新的参数时调用
shouldComponentUpdate|组件判断是否重新渲染时调用

大家都在讲React很快、非常快，这就是第三关了VirtualDOM：真实的DOM操作代价太大，在`render`会先操作内存中的DOM结构，然后最小化反映到真正的DOM上（DomDiff算法可以在[这里](https://github.com/migijs/migi/wiki/%E5%9F%BA%E4%BA%8Evd%E5%92%8Cvr%E7%9A%84DomDiff%E7%AE%97%E6%B3%95)感受下）。

参考资料：

1. [深入浅出React（三）：理解JSX和组件](http://www.infoq.com/cn/articles/react-jsx-and-component?utm_campaign=rightbar_v2&utm_source=infoq&utm_medium=articles_link&utm_content=link_text)
2. [深入浅出React（四）：虚拟DOM Diff算法解析](http://www.infoq.com/cn/articles/react-dom-diff)
3. [组件的详细说明和生命周期](http://reactjs.cn/react/docs/component-specs.html)
4. [react.js的的diff算法真的很强大](http://zjumty.iteye.com/blog/2207030)
5. [React 的 diff 算法](http://segmentfault.com/a/1190000000606216)
6. [React 入门实例教程](http://www.ruanyifeng.com/blog/2015/03/react.html)
7. [React官网](http://facebook.github.io/react/index.html)

## Noob Template

写了这么多年的代码，最持久的一个“口号”就是：

> 高内聚、低耦合

先来看低耦合，在用Java写代码的时候大家已经习惯用**共享内存**的方式来实现多线程间的通信（就不举栗子了），另外一种思路是：

> 用通信的方式来共享内存

在古老的[Erlang](http://svn.liancheng.info/cpie-cn/trunk/.build/html/part-i/chapter-5.html)语言中是这样的：

<pre class="prettyprint">
receive
    Message1 [when Guard1] -&gt;
        Actions1 ;
    Message2 [when Guard2] -&gt;
        Actions2 ;
    ...
end
</pre>

还有比较新的[Golang](http://www.cnblogs.com/hustcat/p/4003729.html)中的channel：

<pre class="prettyprint">
func Producer (queue chan&lt;- int){
    for i:= 0; i &lt; 10; i++ {
        queue &lt;- i
    }
}
func Consumer( queue &lt;-chan int){
    for i :=0; i &lt; 10; i++{
        v := &lt;- queue
            fmt.Println("receive:", v)
    }
}
func main(){
    queue := make(chan int, 1)
    go Producer(queue)
    go Consumer(queue)
    time.Sleep(1e9) //让Producer与Consumer完成
}
</pre>

而回头再开看看浏览器中JS的执行方式：

![](http://)

几乎所有的东西都是`事件`->`回调函数`这种模式，而恰好你也玩过C里面的`epoll`的话也许会觉得这种方式是多么高效，那么：

> 各个组件之间的关系是可以互相发送消息，在组件收到消息的时候执行内部操作！

可能有人会纠结`接口`和`消息`这两种方式的区别，我总感觉他们之间没啥区别.. 低耦合看完了再回过头来看如何高内聚：在上面我们看到的各种办法把逻辑与HTML代码分开，如果是JS的话：

> HTML的`<`和JavaScript的`{`其实已经天然地起到了这个作用！

下面这段代码不用说也应该可以猜到输出应该是什么吧：

<pre class="prettyprint">
&lt;ul&gt;
    for(var i = 0; i &lt; 10; i++){
        &lt;li&gt;${i}&lt;/li&gt;
    }
&lt;/ul&gt;
</pre>

当用组件来搭建一个页面的时候可以是这样（包含嵌套的逻辑）：

<pre class="prettyprint">
@xxxxxx
    @yyyyyy
        ...
    @yyyyyy
        ...
    @yyyyyy
        ...
</pre>

用过**MarkDown**或者**Jade**或者**Python**的同学可能对这种方式已经比较熟悉了，都没用过的话可以对比一下几种层级表示方式：

1. 缩进
2. 大括号
3. END表示结束符



















