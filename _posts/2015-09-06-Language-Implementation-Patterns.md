---
layout: post
title: 编程语言实现模式
date: 2015-09-06
categories: DSL

---

![](http://img4.douban.com/mpic/s7661036.jpg)

很久之前已经把这本书看过一遍了，但是一直没有实践过!于是，拿出来再复习一遍，顺便记录笔记。关于这本书有几点：

1. ANTLR贯穿全书：作者是**Terence Parr**，这点也就不奇怪了
2. ANTLR生成的代码是LL(K)的
3. 偏重实践，原理很少，想看原理要去看[龙书](http://img3.douban.com/mpic/s3392161.jpg)

另外，你应该知道一个编译的过程大概分成哪几部分以及为什么这样划分!废话少说，来看这本书的内容。

## 解析模式

词法分析和语法分析很多地方都是相同的，生成的对应的解析器结构为：

<pre class="prettyprint">
public class G extends Parser {
    // 类型定义
    // 合适的构造函数
    // 规则对应的方法
}
</pre>

在一个规则中包含很多子规则时，根据向前看符号来决定使用哪个的代码可以用if-else来实现：

<pre class="prettyprint">
if(向前看到alt1){
    // 匹配alt1
} else if(向前看到alt2){
    // 匹配alt1
}....
</pre>

这里当然也可以用switch来实现。通常规则上都有一些操作符来增强规则，比如：

1. (T)?：T可有可无
2. (T)+：多个T
3. (T)*：零个或多个T

它们的代码描述如下：

<pre class="prettyprint">
// (T)?
if(向前看到T){ match(T);}
// (T)+
do{
    match(T);
} while(向前看到T)
// (T)*
while(向前看到T){
    match(T);
}
</pre>

通常来将利用好上面三个操作大部分的规则都可以搞定!词法分析相对语法分析了来说简单很多，Lexer会提供**nextToken()**来供Parser使用来不断地获取TOKEN：

<pre class="prettyprint">
public Token nextToken(){
    while(lookahead-char != EOF) {
        switch(lookahead-char){
            case 空白字符: { consume(); continue; }
            case 字符后面可能是T1: return T1();
            case 字符后面可能是T2: return T2();
			// ...
            default:
                出错;
        }
    }
    return EOF;
}
</pre>

直观上来看用switch进行预测，也可以说是构造了一个状态机吧，其中**consume()**方法自增下标并将下一个字符当做向前看字符（消费字符）。

在仅使用一个向前看符来进行语法分析时，也就是LL(1)，对于下面语法：

> list : '[' elements ']';
> elements : element (',' element);
> element : NAME | list;

生成的Paser如下：

<pre class="prettyprint">
public class ListParser extends Parser {
    public void list(){
        match(ListLexer.LBRACK); // 匹配并消耗词法单元
        elements();
        match(ListLexer.RBRACK);
    }
    public void elements(){
        element();
        while(lookahead.type == ListLexer.COMMA) {
            match(ListLexer.COMMA);
            element();
        }
    }
    public void element(){
        if(lookahead.type == ListLexer.NAME) match(ListLexer.NAME);
        else if(lookahead.type == ListLexer.LBRACK) list();
        else throw new Error("语法错误");
    }
}
</pre>

很简单的语法用LL(1)是没有问题的，对于稍微复杂一点的其预测能力差就暴露出来了，怎么办？当然是多拿几个进行预测!可以构造环形缓冲区来存放用来预测的TOKEN，另外增加两个方法：

1. **LA**：返回第k个向前看词法单元的类型
2. **LT**：返回第k个词法单元

那么文法：

> element : NAME '=' NAME
>         : NAME
>         : list
>         ;

对应的程序描述就变为：

<pre class="prettyprint">
public void element(){
    if(LA(1) == LookaheadLexer.NAME && LA(2) == LookaheadLexer.EQUALS) {
        match(LookaheadLexer.NAME);
        match(LookaheadLexer.EQUALS);
        match(LookaheadLexer.NAME);
    } else if(LA(1) == LookaheadLexer.NAME) {
        match(LookaheadLexer.NAME);
    } else if(LA(1) == LookaheadLexer.LBACK) {
        list();
    } else {
        throw new Error("语法错误!");
    }
}
</pre>



## 分析输入





