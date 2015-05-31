---
layout: post
title: Java对象占用了多少空间？
date: 2015-05-14
categories: 编程技术

---

在Java中没有sizeof运算符，所以没办法知道一个对象到底占用了多大的空间，但是在分配对象的时候会有一些基本的规则，我们根据这些规则大致能判断出来对象大小。

## 对象头

对象的头部至少有两个WORD，如果是数组的话，那么三个WORD，内容如下：

1. 对象的HashCode，锁信息等
2. 到对象类型数据的指针
3. 数组的长度（如果是数组的话）

## 规则

首先，任何对象都是8字节对齐，属性按照[long,double]、[int,float]、[char,short]、[byte,boolean]、reference的顺序存放，举个例子：

<pre class="prettyprint">
public class Test {
    byte a;
    int b;
    boolean c;
    long d;
    Object e;
}
</pre>

如果这个对象的属性按照顺序存放的话，要占用的空间为：head(8) + a(1) + padding(3) + b(4) + c(1) + padding(7) + d(8) + e(4) + padding(4) = 40。但是按照这个规则得到：head(8) + d(8) + b(4) + a(1) + c(1) + padding(2) + e(4) + padding(4) = 32。可以看到节省了不少空间。

在涉及继承关系的时候有一个最基本的规则：首先存放父类中的成员，接着才是子类中的成员，举个例子：

<pre class="prettyprint">
class A {
    long a;
    int b;
    int c;
}
class B extends A {
    long d;
}
</pre>

这样存放的顺序及占用空间如下：head(8) + a(8) + b(4) + c(4) + d(8) = 32。那如果父类中的属性不够八个字节怎么办？这样就有了新的一条规则：父类中最后一个成员与子类的第一个成员的间隔如果不够4个字节，此时需要扩展到4个字节的基本单位，举个例子：

<pre class="prettyprint">
class A {
    byte a;
}
class B extends A {
    byte b;
}
</pre>

那么此时占用的空间如下：head(8) + a(1) + padding(3) + b(1) + padding(3) = 16。显然这种方式比较浪费空间，那么就有了：如果子类的第一个成员是double或者long，并且父类并没有用完8个字节，JVM会破坏规将较小的数据填充到该空间，举个例子：

<pre class="prettyprint">
class A {
    byte a;
}
class B extends A {
    long b;
    short c;
    byte d;
}
</pre>

此时占用的空间如下：head(8) + a(1) + padding(3) + c(2) + d(1) + padding(1) + b(8) = 24。