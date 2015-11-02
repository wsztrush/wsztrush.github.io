---
layout: post
title: 组装页面
date: 2015-10-15
categories: 编程技术

---

在码农中最持久的一个口号就是：

> 低耦合、高内聚

先来看低耦合，在用Java写代码的时候大家已经习惯用**共享内存**的方式来实现多线程间的通信（就不举栗子了），有点问题的时候排查起来比较头疼，而另外一种思路是：

> 用通信的方式来共享内存

比如在古老的[Erlang](http://svn.liancheng.info/cpie-cn/trunk/.build/html/part-i/chapter-5.html)中是这样的：

<pre class="prettyprint">
receive
    Message1 [when Guard1] -&gt;
        Actions1 ;
    Message2 [when Guard2] -&gt;
        Actions2 ;
    ...
end
</pre>

而比较新的[Golang](http://www.cnblogs.com/hustcat/p/4003729.html)中是这样的：

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

在HTML中也有点像这种消息驱动的方式，页面上的每个操作都会转换成事件传递给JavaScript进行处理，在JavaScript中的事件处理方式如下（单线程）：

![](http://7xiz10.com1.z0.glb.clouddn.com/Build-Up-Page.jpg)

在可视化编程中这种方式还是挺给力的，在使用一个组件时，需要根据它的事件来让用户去扩展（写代码）：

<pre class="prettyprint">
@input(name = "abc")
    @on(click)
        ......
    @on(change)
        ......
</pre>

编写代码的时候需要关注两个量：

1. **event**：事件对象
2. **this**：订阅了事件的组件，也就是当前组件

组件可以监听另一个组件的事件，这样两个组件就可以实现交互（和HTML的区别是动作与展示结合在一起）：

<pre class="prettyprint">
@input(name = "abc")
    .....
@table(...)
    @target(abc)
        @on(click)
            .....
    @on(target = "abc" type="click")
        ....
</pre>

在时间对象中包含的字段有：

字段|作用
-|-
target|产生事件的组件名称
type|事件类型
data|数据

在实现时需要三个操作：

1. 绑定
2. 取消绑定
3. 发送

在组件从页面上消失的时候是需要取消绑定的，不然可能会有问题，在配置完成页面后组件之间的关系如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/Build-Up-Page-1.png)

在接收到事件的时候可以做任何你想做的事情，比如更新一下页面的展示。因为组件已经封装的比较彻底了，暴露给用户的只有数据，那么只能通过更新数据来更新展示：

<pre class="prettyprint">
@table
    @on(click)
        setState({list:[1,2,3,4]});
</pre>

如果对应的模板为：

<pre class="prettyprint">
@render
    for(var i in list){
        &lt;li&gt;${i}&lt;/li&gt;
    }
</pre>

那么得到的HTML的代码如下：

<pre class="prettyprint">
&lt;li&gt;1&lt;/li&gt;
&lt;li&gt;2&lt;/li&gt;
&lt;li&gt;3&lt;/li&gt;
&lt;li&gt;4&lt;/li&gt;
</pre>

在更新展示时如果直接用[innerHTML](http://www.w3school.com.cn/jsref/prop_tablerow_innerhtml.asp)或者[outerHTML](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/outerHTML)实现起来比较简单，但问题是体验比较差：

> 用户的输入（或者列表的选择）都会消失，感觉有点像区域被刷新了一下。

另外在全部更新的情况下要比逐个更新元素要快一些，但是很多情况下我们只需要更新页面上的一小部分，那么就可以考虑用JavaScript原生的DOM操作来搞：

操作|作用
-|-
[createElement](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createElement)|创建HTML元素
[appendChild](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild)|将一个节点插入到指定的父节点的最末尾处
[removeChild](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild)|从某个父节点中移除指定的子节点,并返回那个子节点
[replaceChild](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild)|用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点
[insertBefore](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore)|在当前节点的某个子节点之前再插入一个子节点

虽然没有**insertAfter**方法，但是实现起来非常简单。DOM结构中另一个变化的打头就是属性：

操作|作用
-|-
[getAttribute](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getAttribute)|获取属性
[setAttribute](https://developer.mozilla.org/zh-CN/docs/Web/API/element/setAttribute)|设置属性
[removeAttribute](https://developer.mozilla.org/zh-CN/docs/Web/API/element/removeAttribute)|移除属性

最后想修改标签中的字符时可以用[innerHTML](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/innerHTML)或者[textContent](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent)直接搞定，最后一个问题就是如何更新DOM结构：

![](http://7xiz10.com1.z0.glb.clouddn.com/Build-Up-Page-2.png)

追求性能可以根据**增**、**删**、**改**的成本用动态规划算出一个最有的修改方式，但是长期来看处理的数据都相当有限，只需要用贪心地策略来保证用户体验就可以了。







