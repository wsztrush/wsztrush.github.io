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

另外，你应该先知道编译的过程大概分成哪几步骤以及为什么这样划分！废话少说，来看这本书的内容。

## 解析输入

词法分析和语法分析很多地方都是相同的，解析器结构如下：

<pre class="prettyprint">
public class G extends Parser {
    // 类型定义
    // 合适的构造函数
    // 规则对应的方法
}
</pre>

在一个规则中包含很多子规则时，根据向前看符号来决定使用哪个，这个逻辑的代码描述可以用if-else来做：

<pre class="prettyprint">
if(向前看到alt1){
    // 匹配alt1
} else if(向前看到alt2){
    // 匹配alt1
}....
</pre>

当然这里也可以用switch做，在规则上定义的一些常见操作有：

1. (T)?：T可有可无
2. (T)+：多个T
3. (T)*：零个或多个T

这些操作的代码描述：

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

能利用好这三个操作大部分的规则都可以搞定了！词法分析相对语法分析了来说简单很多，Lexer会提供**nextToken()**来供Parser使用来不断地获取TOKEN：

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

直观上来看用switch进行预测，相当于构造了一个状态机吧，其中**consume()**方法自增下标并将下一个字符当做向前看字符（消费字符）。在仅使用一个向前看符来进行语法分析时，也就是LL(1)，对于下面语法：

> - list : '[' elements ']';
> - elements : element (',' element);
> - element : NAME \| list;

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

很简单的语法用LL(1)是没有问题的，对于稍微复杂一点的其预测能力差就暴露出来了，怎么办？当然是多拿几个进行预测！可以构造环形缓冲区来存放用来预测的TOKEN，另外增加两个方法：

1. **LA**：返回第k个向前看词法单元的类型
2. **LT**：返回第k个词法单元

那么文法：

> element : NAME '=' NAME : NAME : list ;

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

但是LL(K)也不是万能的，如果向前看k个解决不了问题，那么向前无限个总应该可以搞定了吧？回溯解析中使用递归尝试不同的规则，在发现无法匹配时把消费掉的TOKEN吐出来：

<pre class="prettyprint">
public void rule() {
    if(speculate_alt1()){
        // 匹配alt1
    } else if(speculate_alt2()){
        // 匹配alt2
    } else { throw new Error("语法错误！"); }
}
public boolean speculate_alt1() {
    boolean success = true;
    mark();// 标记当前位置，供release使用
    try{
        // 匹配alt1
    } catch(Exception e){ success = false; }
    release();// 将消费掉的TOKEN重新放回去
    return success;
}
</pre>

回溯解析最大的缺陷就是性能低，而其中一个原因则是做了不少重复工作，对于语法：

> s : expr ':' \| expr ';';

在尝试第一个子规则失败时会去尝试第二个，那么expr就会被匹配两次！如果能把之前匹配过的结果记住就好了（参考[记忆化搜索](http://www.cnblogs.com/kedebug/archive/2013/04/07/3006493.html)），此时仅需要做一些很小的修改：

<pre class="prettyprint">
// 每个规则有一个Map来保存结果
Map&lt;Integer, Integer&gt; list_memo = new HashMap&lt;Integer, Integer&gt;;
public void list(){
    boolean failed = false;
    int startTokenIndex = index();
    if(isSpeculating() && aleadyParsedRule(list_memo)) return;
	try{_list();}
    catch(Exception e) {failed = true; throw e; }
    finally{
         if(isSpeculating())
             memoize(list_memo, startTokenIndex, failed);
    }
}
public void _list(){
    match(XXX);
    elements();
    match(XXX);
}
</pre>

简单说明下上面用到的几个方法：

1. **aleadyParsedRule**：使用缓存的结果：成功返回TRUE、失败抛异常、未处理过返回FALSE
2. **memoize**：回溯时将结果记录到缓存

另外需要清楚一个细节：

> 推演时没有通过的try-catch逻辑在非推演时更不可能走到！

最后，在遇到上下文相关的语法时使用谓词是个不错的选择，用代码描述就是增加条件：

<pre class="prettyprint">
public void rule(){
    if(向前看符号测试alt1 && 谓词1) {
        // 匹配alt1
    } else if(向前看符号测试alt2 && 谓词2) {
        // 匹配alt2
    } ...
}
while(对循环的alt进行向前看符号判断 && 谓词判断) {
    子规则的代码用来匹配alt
}
</pre>

到这里解析输入的逻辑基本上就看完了，简单来说：

1. Lexer产出Token流
2. Parser产出方法执行流

接下来我们就需要在Parser产出的方法执行流上面来进行分析。

## 分析输入

将源码结构化时一般用到两种方式：**语法分析树**和**抽象语法树**，从三个方面来看：

1. 紧凑：不含无用节点
2. 易用：很容易遍历
3. 显意：突出操作符、操作对象，以及它们互相间的关系，不再拘泥于文法

抽象语法树都要更优秀一些！程序实现时，我们在Parser匹配的过程中向方法中插入一些代码即可得到想要的树形结构：

<pre class="prettyprint">
public void rule(){
    RuleNode r = new RuleNode("规则名");
    if(root == null) root = r;
    else currentNode.addChild(r);
    ParseTree _save = currentNode;
    // 原始的规则代码
    currentNode = _save;
}
</pre>

要比想象的简单很多，因为在LL的解析中：

> 解析过程就可以看做是在语法分析树上做DFS，任意当前树节点的父亲必然是前面遍历过的某个节点！

不同实现节点的方式后续树的遍历等都是有影响的，有如下方式：

类型|含义
-|-
同型AST|只有一种节点类型AST，要依据TOKEN来区分不同类型
规范异型AST|从基类AST派生不同的节点类型，子节点列表统一
不规范异型AST|可以添加不同的子节点属性，能够让代码的可读性更高

好不容易拿到树形结构了，遍历它也不是一个轻松的活。回想大学用Java写二叉树遍历的时候通常是这样：

<pre class="prettyprint">
public class Node {
    Node left, right;
    void visit(){
        left.visit();
        right.visit();
    }
}
</pre>

把遍历操作嵌入节点内部最明显的缺点是：**逻辑散落在各节点中操作起来很麻烦**，可以将遍历操作统一放到一个地方：

<pre class="prettyprint">
public abstract class VecMathNode extends HeteroAST {
    public abstract void visit(VecMathVisitor visitor);
}
public interface VecMathVisitor {
    void visit(AssignNode n);
    void visit(PrintNode n);
    void visit(StatListNode n);
    void visit(VarNode n);
    // ...
}
</pre>

在实现的时候在Visitor中将**this**传递就可以达到遍历的目的了：

<pre class="prettyprint">
public class PrintVisitor implements VecMathVisitor {
    public void visit(AssignNode n){
        n.id.visit(this);// 看这里
        System.out.print("=");
        n.value.visit(this);
    }
}
</pre>

提到外面代码量并没有减少，但是这种代码很有规律，ANTLR可以大幅度地减少你的工作量！当然还有其他的方式来实现相同的目的，这里就不啰嗦了。




