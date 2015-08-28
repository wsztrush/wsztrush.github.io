---
layout: post
title: Java并发编程实战
date: 2015-08-19
categories: 读书笔记

---

看完之后感觉Doug Lea写的书都是精品，不过有些地方翻译的确实不怎么样...

## 线程

线程比进程更轻，更易于共享数据，关于Java中的线程要了解：

1. 线程安全
2. 可见性
3. 中断
4. 关闭钩子
5. 守护线程
6. ThreadLocal
7. 线程的开销

很长一段时间对线程安全的定义比较迷糊，下面这个定义感觉是比较准确的：

> 当多个线程访问某个类时，不管运行时环境采用何种调度方式，该类都能表现出正确的行为，那么就称这个类是线程安全的。

或者更简单地描述：

> 结果与调度的方式无关。

看似简单但坑却不少，比如多线程中可见性这种反直觉的东西：

<pre class="prettyprint">
private static boolean ready;
private static int number;
static class ReaderThread extends Thread {
	public void run() {
    	while(!ready){
        	Thread.yield();
        }
        System.out.println(number);
    }
}
public static void main(String[] args){
	new ReaderThread().start();
    number = 42;
    ready = true;
}
</pre>

这里程序可能持续运行下去，因为ReaderThread可能永远看不到ready的值；程序也可能输出0，因为ReadyThread可能只看到写入ready的值：

> 在没有同步的情况下编译器、处理器以及运行时等都可能对操作的执行顺序进行一些意想不到的调整。

开启线程只需要一个start，而想让它停下来就没那么简单了，因为stop已经不建议再使用，原因是：

1. 在任意位置抛出ThreadDeath
2. 释放锁
3. 关闭时需要同步，如果run是同步的那就永远都无法关闭

取而代之的是中断，但是中断并不代表停止，而是：

> 调用interrupt并不意味着立即停止目标线程的执行，而只是传递请求中断的消息。

但是比较靠谱的是在很多库中已经对中断做了处理：

1. 在调用join、sleep、wai等阻塞返回后会抛出异常并擦除中断状态
2. 在IO操作上阻塞时也会抛出异常并关闭流
3. 在java.nio.channel.Selector上等待时也会立即返回

如果没有上面这些情况的话，调用中断不会对线程的执行造成半毛钱影响，如果你需要你的线程去响应中断，需要在合适的地方增加代码去判断并处理。

想让线程按照我们的意愿停止已经很麻烦了，但是如果它运行的时候还抛出莫名其妙的异常就更加恼火了，不过幸好还有：

<pre class="prettyprint">
public interface UncaughtExceptionHandler {
	void uncaughtException(Thread t, Throwable e);
}
</pre>

有时候我们需要在程序运行完成的时候做一些扫尾的工作，可以用关闭钩子来实现：

<pre class="prettyprint">
Runtime.getRuntime().addShutdownHook(new Thread(){
	public void run(){
    	// your code
    }
})
</pre>

只有JVM是正常结束的时候才会运行钩子，被暴力kill掉的时候就没机会执行了。既然讲到JVM的退出刚好可以看下Daemon和正常线程的区别：

> 当线程退出时，JVM会检查其他正在运行的线程，如果这些线程都是守护线程，那么JVM将退出。

类似垃圾回收这些线程就得设置成守护线程，不能让他们影响了JVM的正常退出。在开启多线程的时候ThreadLocal真是一个神器，可以让很多信息的传递变得非常简单，具体可以看[这里](http://wsztrush.github.io/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2015/05/14/Java-ThreadLocal.html)。

最后，线程不仅在效率还是体验方面都带来了巨大的提升，单并非多多益善，增加线程也同时会增加一些开销：

1. 上下文切换
2. 内存同步（这个影响很小）
3. 阻塞（竞争的同步可能需要操作系统的介入）

现在大家已经很少new Thread().start();这么玩了，大部分都会用线程池来管理，下面接着看：

## 线程池

创建新线程也是有开销了，所以可以将线程缓存下来重复利用，在使用线程池时需要注意：

1. 阀值
2. 饱和策略
3. ThreadFactory

平时用到的大部分线程池的底层都是ThreadPoolExecutor，在初始化时有几个关键的阀值需要注意：

阀值|作用
-|-
corePoolSize|在execute时如果当先线程数小于该值则直接创建新线程来运行
maximumPoolSize|最大线程数
keepAliveTime|Worker取任务的等待时长，超时后Worker就退出了

如果在execute的时候线程池已经满了，同时任务队列也满了，那么此时任务怎么办？这时候就饱和策略就要上场了：

<pre class="prettyprint">
public interface RejectedExecutionHandler {
    void rejectedExecution(Runnable r, ThreadPoolExecutor executor);
}
</pre>

同时提供四种实现：

1. AbortPolicy：抛异常
2. CallerRunsPolicy：退回到调用者线程处理任务
3. DiscardOldestPolicy：抛弃最老任务
4. DiscardPolicy：抛弃

最后可以通过ThreadFactory来设置线程池中线程的属性：

<pre class="prettyprint">
public interfact ThreadFactory{
    Thread newThread(Runnable r);
}
</pre>

在execute时如果需要创建新的线程就会调用该方法。

## 锁

多个线程同时跑为了保证结果的准确锁是少不了的：

1. 锁的实现
2. 死锁
3. 活锁
4. 减少锁竞争

常用的锁有两种实现：

1. synchronized
2. concurrent

在之前concurrent要比synchronized快很多，但这个已经是很久之前的事情了，在synchronized的实现中通过偏向锁、轻量级锁优化了性能，而concurrent则是Doug Lea的作品。

相比较来说各有优劣：

> synchronized缺点是不够灵活，但是你不需要费心释放锁；而concurrent使用很灵活，可以分别在不同的地方加锁、解锁，但是如果忘记解锁就悲剧了，一般用try-finally来做。

另外concurrent中实现了各种策略的锁：

锁|作用
-|-
ReentrantLock|可重入独占锁
ReentrantReadWriteLock|可重入读写锁
Condition|条件
CountDownLatch|向下递减，到0时线程被唤醒
CyclicBarrier|有指定书目的线程await之后，一起开始执行
FutureTask|先提交任务，在get时阻塞
Semaphore|信号量

其实concurrent中核心是AQS框架，它将等待队列等操作都进行了封装，你只需要实现下面四个方法即可实现需要的锁：

1. tryAcquire
2. tryAcquireShared
3. tryRelease
4. tryReleaseShared

锁用的比较多的时候就容易产生死锁，一般原因分为下面几类：

1. 锁顺序死锁
2. 资源死锁
3. 线程饥饿死锁：在同一个线程池中执行有互相依赖的任务时需要注意

可以用**jstack –l pid**来检测死锁。既然看到到了死锁，那就顺便看一下活锁：

> 不停地取出第一个任务，但是每次都会失败。

其实活锁看起来就是代码写的太挫了...用锁的时候除了导致程序的活跃性问题，还可能导致性能问题，减少锁开销的一般方法为：

1. 缩小同步的范围，快进快出
2. 减少锁的粒度
3. 锁分段

用锁一定要慎重。

## 总结

多线程编程中还需要看看**非阻塞算法**、**Java内存模型**，而真正在写代码的时候能写好确实是一件非常不容易的事情，通常需要通过很多代码的磨练总结在使用各个工具时候的一些基本原则，才能慢慢顺手一些。