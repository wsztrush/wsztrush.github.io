---
layout: post
title: 组装页面
date: 2015-10-15
categories: 编程技术

---

## 组件之间的通信

写了这么多年的代码，最持久的一个“口号”就是：

> 高内聚、低耦合

先来看低耦合，在用Java写代码的时候大家已经习惯用**共享内存**的方式来实现多线程间的通信（就不举栗子了），另外一种思路是：

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

还有比较新的[Golang](http://www.cnblogs.com/hustcat/p/4003729.html)中是这样的：

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

可能有人会纠结`接口`和`消息`这两种方式的区别，我总感觉他们之间没啥区别.. 

## 