---
layout: post
title: Java中的ThreadLocal
date: 2015-05-14
categories: 编程技术

---

## 用法

多个线程在调用同一个方法的时候，会有并发问题，解决这种问题最简单的办法就是将数据保存在Thread的自己的结构中，也就是ThreadLocal的作用了。用法如下：

<pre class="prettyprint">
class JavaBean {
    static ThreadLocal&lt;Integer&gt; threadLocal = new ThreadLocal&lt;Integer&gt;();

    public void prepare() {
        threadLocal.set(0);
    }

    public void work() {
        for (int i = 0; i &lt; 1000; i++) {
            int val = threadLocal.get();
            val++;
            threadLocal.set(val);
        }
        System.out.println(threadLocal.get());
    }
}

class Worker extends Thread {
    JavaBean bean;

    public Worker(JavaBean bean) {
        this.bean = bean;
    }

    public void run() {
        bean.prepare();
        bean.work();
    }
}

public class ThreadLocalDemo {
    public static void main(String[] args) {
        JavaBean bean = new JavaBean();
        for (int i = 0; i &lt; 100; i++) {
            new Worker(bean).start();
        }
    }
}
</pre>

从输出中可以看到，多个线程操作同一个threadLocal时，结果并不会出错。

可以将ThreadLocal看做是对**Thread.threadLocals**的封装，况且在程序中也是不能直接访问到Thread.threadLocals。

## 原理

下面简单看ThreadLocal的原理，在Thread中保存了一个Map，类型可以认为是**Map\<ThreadLocal, T\>**，其中T是要保存数据的类型。当要从中取出数据时，调用的流程如下：

<pre class="prettyprint">
Thread.currentThread().threadLocals.getEntry(threadLocal).value
</pre>

这样，不同的线程在执行的时候在同一个threadLocal上获取到的是不同的数据，线程之间的隔离性是通过"各自保存不同的Map"来实现的，而看到的threadLocal对象其实是**KEY**，在操作前get到的是**VALUE**。其实自己动手做一个线程安全的数据保存的解决方法也是这个思路。

在ThreadLocalMap中使用的并不是普通的引用保存数据，而是使用**WeakReference**来做：

<pre class="prettyprint">
static class Entry extends WeakReference&lt;ThreadLocal&gt; {
    Object value;
    Entry(ThreadLocal k, Object v) {
        super(k);
        value = v;
    }
}
</pre>

这样如果ThreadLocal被释放了，那么ThreadLocalMap中的Entry也会被释放，不至于造成内存泄露。