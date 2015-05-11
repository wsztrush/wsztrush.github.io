---
layout: post
title: Java 解惑
date: 2015-05-11 07:22:00
categories: 读书笔记

---

![](http://img5.douban.com/mpic/s1491187.jpg)

这本书给我们列举了很多Java编程中容易产生迷惑的地方，先看几个例子：

1、在刚开始学编程的时候都会遇到swap操作，开始作为一个新手老老实实地用另外一个变量tmp来存，偶然看到用异或来实现感觉好牛逼，不过这种方式在Java上行不通：

<pre class="prettyprint">
int x = 1;
int y = 2;
x ^= y ^= x ^= y;
System.out.println("x = " + x + " y = " + y);
</pre>

出乎意料地是这段代码执行的结果是x = 0 y = 1，而不是希望的x = 2 y = 1，接下来从字节码（javap -c）中找答案：

<pre class="prettyprint">
   0:   iconst_1
   1:   istore_1
   2:   iconst_2
   3:   istore_2
   4:   iload_1
   5:   iload_2
   6:   iload_1
   7:   iload_2
   8:   ixor
   9:   dup
   10:  istore_1
   11:  ixor
   12:  dup
   13:  istore_2
   14:  ixor
   15:  istore_1
</pre>
原来执行过程竟然是这样的，为了更清晰给一个图来看栈帧的变化：

![栈帧的变化](http://7xiz10.com1.z0.glb.clouddn.com/Java解惑-Stack.png)

在Java语言规范描述中：操作符的操作数是从左到右求值的，对于x^=expr的表达式，x的值是在计算expr之前被提取的，那么因此也就有了上面这个结果。

2、在做ACM的时候经常会用到位操作，但是被下面这个代码还是惊了一下：

<pre class="prettyprint">
int i = 0;
while (-1 << i != 0)
    i++;
System.out.println(i);// 没输出，死循环啦。
</pre>

对于-1直观的想法是在i=32的时候**-1\<\<i==0**，因为左移了32位嘛，随便什么数都成0了。

原因很简单：对于太大的数位操作会取模，比如int来说移位数为**i&31**，对于long来说移位数为**i&63**。

3、对于初始化顺序大家应该都是知道的，但是当看到下面这段代码输出9900的时候还是得仔细看一下：
<pre class="prettyprint">
public class TestMain {
    static {
        initializeIfNecessary();
    }
    private static int sum;

    public static int getSum() {
        initializeIfNecessary();
        return sum;
    }

    private static boolean initialized = false;// 这里会设置成false。

    private static synchronized void initializeIfNecessary() {
        if (!initialized) {
            for (int i = 0; i < 100; i++)
                sum += i;
            initialized = true;
        }
    }

    public static void main(String[] args) {
        System.out.println(TestMain.getSum());
    }
}
</pre>
在加载的时候会先分配内存，然后依次执行static，而其顺序和申明的顺序一致，那么这个结果自然就明白了。

4、第一眼看去这段代码重写的equals，而且非常正确，但是输出却是**false**。
<pre class="prettyprint">
public class Name {
	private String first, last;
	public Name(String first, String last) {
		this.first = first;
		this.last = last;
	}
	public boolean equals(Object o) {
		if (!(o instanceof Name))
			return false;
		Name n = (Name)o;
		return n.first.equals(first) && n.last.equals(last);
	}
	public static void main(String[] args) {
		Set s = new HashSet();
		s.add(new Name("Mickey", "Mouse"));
		System.out.println(
		s.contains(new Name("Mickey", "Mouse")));
	}
}
</pre>
这就是没有仔细思考的结果，想一下**HashSet.contains()**的运行机制就会焕然大悟：肯定是先比较hashCode，相同的情况下才调用equals。所以：**无论何时，只要你覆盖了equals方法，就同时必须覆盖hashCode方法**。

5、对于这段代码可能会直观的顺着代码写的顺序去执行，但是非常容易忽略掉一点**static是类初始化的一部分**，当执行到t.join()的时候貌似主线程在等待t执行完成，但是此时主线程也在等待自己执行完成，所以**死锁**了。。。
<pre class="prettyprint">
public class Lazy {
	private static boolean initialized = false;
	static {
	Thread t = new Thread(new Runnable() {
		public void run() {
			initialized = true;
		}
	});
	t.start();
		try{
			t.join();
		}catch (InterruptedException e){
			throw new AssertionError(e);
		}
	}
	public static void main(String[] args){
		System.out.println(initialized);
	}
}
</pre>

当然书中的例子并不只上面几个（一共有95个），总体来看有：

- 小心溢出以及浮点精度
- NaN是个奇葩
- 继承中的各种陷阱，比如：
    - 覆写：完全相同的方法。
    - 隐藏：完全相同，但是为private。
    - 重载：参数类型不同。
    - 遮蔽：外面相同名字的变量被里面的变量遮蔽。
    - 遮掩：用变量名和类名冲突。
- 泛型擦除术

## 总结

不可否认看完这本书的很多例子能帮助我们写出更高质量的代码（比如覆写equels不覆写hashCode），不过很多例子（尤其是继承）编写很多年的工程代码都不会遇到。

看完这本书最大的收获就是对Java有了更深的理解。另外，像位移这种反直觉的设计真的好吗？