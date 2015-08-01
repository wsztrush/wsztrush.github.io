---
layout: post
title: 龙书学习笔记
date: 2015-08-01
categories: 编译原理

---

## 词法分析

编译器的目的是根据源码生成可以执行的文件，想一步到位完全不靠谱，可以先进行分词处理，那么这就是词法分析要完成的工作了！

用正则表达是来描述词法规则是比较简单的，而用状态机进行匹配则是比较迅速的，那么比较重要的就是在他们之间的互相转换：

![](http://7xiz10.com1.z0.glb.clouddn.com/Compiler-1.png)

这里有：

概念|含义
-|-
NFA|不确定自动机，从当前状态根据字符转移的时候，下一个状态是不确定的
DFA|确定自动机，状态转移时下一个状态时确定的

来看一个NFA的例子，对于**(a|b)\*abb**这样的词，对应的NFA为：

![](http://7xiz10.com1.z0.glb.clouddn.com/Compiler-2.png)

在遍历的过程中顺便更新状态就可以了，用代码来描述一下：

<pre class="prettyprint">
S = &epsilon;-closure(s0); // 注意：这里的S是个集合
c = nextChar();
while(c != eof){
    S = &epsilon;-closure(move(S,c));// 状态转移+空转移
    c = nextChar();
}
if(S &cap; F != &empty;) return "yes";
eles return "no";
</pre>

看起来NFA的模拟方式效率并不高，而且代码写起来也有点小复杂，而DFA则完全不一样：

<pre class="prettyprint">
s = s0;
c = nextChar();
while(c != eof){
    s = move(s, c);
    c = nextChar();
}
if(s在F中) return "yes";
else return "false";
</pre>

是不是简单了很多？但是也更显然，NFA与正则之间的关系更加直观，那么先来看从正则到NFA的转换：

![](http://7xiz10.com1.z0.glb.clouddn.com/Compiler-3.png)

用这种方式从**(a\|b)\*a**得到的NFA为：

![](http://7xiz10.com1.z0.glb.clouddn.com/Compiler-4.jpg)

既然DFA相对于NFA来说是有优势的，那么如果有一个方法能将NFA转换为DFA，那么可以一劳永逸。这里**子集构造法**还是相当的直观的的：

<pre class="prettyprint">
一开始，&epsilon;-closure(s0)是Dstates中唯一状态，且它未加标记;
while(在Dstates中一个未加标记状态T){
    给T加上标记;
    for(每个输入符号a){
        U = &epsilon;-closure(move(T,a));
        if(U不在Dstates中)
            将U加入到Dstates中，且不加标记;
        Dtran[T,a] = U;
    }
}
</pre>

其中的：

操作|描述
-|-
&epsilon;-closure(s)|能够从NFA的状态s开始只通过&epsilon;转换到达的NFA状态集合
&epsilon;-closure(T)|能够从T中某个NFA状态s开始只通过&epsilon;转换到达的NFA状态集合
move(T,a)|能够从T中某个状态s出发通过标号a的转换到达的NFA状态的集合

那么现在就有一条路径了：**正则-&gt;NFA-&gt;DFA**也太累了，有没有**正则-&gt;DFA**这样一条通路？答案是肯定的，首先根据正则构造出抽象语法树：

<pre class="prettyprint">
初始化Dstates,使之只包含未标记的状态firstpos(n0),其中n0是r(#)的抽象语法树的根节点;
while(Dstates中存在未标记的状态S){
    标记S;
    for(每个输入符号a){
        令U为S中和a对应的所有位置p的followpos(p)的并集;
        for(U不在Dstates中)
            将U作为未标记的状态加入到Dstates中;
        Dtran[S,a] = U;
    }
</pre>

其中：

定义|含义
-|-
nullable(n)|节点n的子表达式的语言中包含&epsilon;
firstpos(n)|以节点n为根的子表达式中第一个符号的位置的集合
lastpos(n)|以节点n为根的子表达式中最后一个符号的位置的集合
followpos(p)|可能出现在位置p后面的位置的集合

其实背后的底层原理与从NFA到DFA还是比较相似的，只不过是用不同的构造方式来做。DFA确实要比NFA好处理一些，但并不是说生成DFA之后就没事了，其中的状态数可以压缩：

1. 根据接收、非接收状态分为两组；
2. 遍历分组、字符，如果同一组内的状态根据该字符到达了不同的组，那么将继续将当前的分组进行分割；
3. 重复执行步骤2直到没有变化；
4. 每个分组中选择一个代表状态，重新构造DFA，最小化完成；

可以证明**最小化状态**数的DFA唯一性，然而最小化的过程更加容易让我们去理解状态机的本质。来个最小化状态数的例子：

![](http://7xiz10.com1.z0.glb.clouddn.com/Compiler-5.png)

## 语法分析




## 语法制导翻译