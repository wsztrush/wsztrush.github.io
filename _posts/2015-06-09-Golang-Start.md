---
layout: post
title: Golang入门
date: 2015-06-09
categories: 编程技术

---

## 环境搭建

因为我仅仅打算在ubuntu上面进行golang的开发，所以其他的系统后面用过了再来补充！配置来说相当容易：

1. 下载golang的包解压安装，如果官网上的访问不到就到[golang中国](http://www.golangtc.com/)找个版本下载
2. 在/etc/profile中配置**PATH**、**GOROOT**、**GOPATH**
3. 配置你的IDE

下面就开始GOLANG的学习。

## 基础语法

按照惯例，来看Hello World代码：

<pre class="prettyprint">
package main

import "fmt"

func main(){
    fmt.Println("Hello World");
}
</pre>

使用**go run hello.go**即可执行，也可以使用**go build hello.go**打包完成之后在运行，所有的命令作用如下：

命令|作用
-|-
build|用于测试编译
clean|移除当前源码包里面编译生成的文件
env|环境变量
fix|修复以前老版本的代码到新版本
fmt|代码格式化
generate|
get|动态获取远程代码包的，目前支持的有BitBucket、GitHub、Google Code和Launchpad
install|生成结果文件(可执行文件或者.a包)，把编译好的结果移到$GOPATH/pkg或者$GOPATH/bin
list|列出当前全部安装的package
run|编译并运行Go程序
test|自动读取源码目录下面名为*_test.go的文件，生成并运行测试用的可执行文件
tool|运行对应的工具类
version|版本号

码代码最基本的是变量和常量，在Go中的定义方法如下：

<pre class="prettyprint">
var a string = "initial"  /* 变量 */
const s string = "initial" /* 常量 */
</pre>

另外一些基本的控制结构也基本一致，简单来看就是省略了不少的括号：

<pre class="prettyprint">
// FOR
for i &lt;= 3
for i := 1; i &lt;= 3; i++
for
// IF
if 8%4 == 0
if num := 9; num &lt; 0
// SWITCH
switch time.Now().Weekday() {
    case time.Saturday, time.Sunday:
    default:
}
</pre>

Go中的集合用起来感觉跟Python中的有点像：

<pre class="prettyprint">
// ARRAY:数组
var a [5]int
b := [5]int{1, 2, 3, 4, 5}
var c [2][3]int

// SLICES:跟数组很像，不过区间操作非常方便
s := make([]string, 10)
l := s[2:5]
l := s[2:]
l := s[:5]

// RANGE:更方便地遍历，数组的话返回下标和值，MAP返回KEY、VALUE
for _,num := nums {
    sum += num;
}

// MAP:这个没什么好说的
m := make(map[string]int)
m["a"] = 1
m["b"] = 2
</pre>

在Go中定义方法也是比较奇葩的语法，用过的其他语言大部分把返回值写在前面，而它是写在后面，不过应该也没有谁优谁劣，而且在Go中方法可以返回多个值(尤其是在后面会用来返回错误)：

<pre class="prettyprint">
func vals() (int, int) {// 普通函数：a, b := vals()
    return 1, 2;
}
func sum(nums ...int) {// 可变参数：sum(1, 2)   sum(1, 2, 3)
}
func zeroptr(iptr *int) {// 参数类型为指针
    *iptr = 0
}
func intSeq() func() int {// 闭包
    i := 0
    return func() int {
        i += 1
        return i
    }
}
</pre>

在Go中所有的面向对象就是**struct**了，是不是感觉有点简单？或者有点low？另外在Go中定义了一个奇葩的**interface**，感觉有点像是一个方法的集合：

<pre class="prettyprint">
type method interface {
    output();
}

type person struct {
    name string
    age  int
}

func (p *person) output(){// 定义方法，再次吐槽：是不是跟Python很像
    fmt.Println(p.name, p.age);
}

func f(m method) { // 为不同对象定义相同的方法，用这个来实现泛型的话，额~~
	fmt.Println(m);
    m.output();
}

func f1(arg int) (int, error) {
    return -1, errors.New("i can't work！"); // 返回错误
}

// 调用方法
fmt.Println(person{"Bob", 20})
fmt.Println(person{name: "Alice", age: 30})
</pre>

在Go中比较吸引人的应该就是**goroutines**，面向并发的语言自然要最大程度的简化对应的代码才算合格。在Go中任意一个方法都可以使用**go**这个关键字来当做一个协程进行处理：

> go func("abc")

仅仅这样是不够的，在Go中又提供了**channel**用来做消息传递，这样：

1. 消息传递
2. 共享内存

这两种方式在Go里面就凑齐了，另外**select**也大大简化了IO时候的操作，代码减了多少并不重要，关键是代码与其含义更加地贴近：

<pre class="prettyprint">
messages := make(chan string)
messages := make(chan string, 2)

messages &lt;- "buffered" // 写入
msg := &lt;-messages // 读取

select {
    case msg := &lt;-messages:
        fmt.Println("received message", msg)
    default:// 这样就不会阻塞了
        fmt.Println("no message received")
}
</pre>

总是感觉select与switch很像，不仅仅是写法上面，另外连TimeOut的写法能很简单、粗暴地搞定：

<pre class="prettyprint">
select {
    case res := &lt;-c1:
        fmt.Println(res)
    case &lt;-time.After(time.Second * 1):
        fmt.Println("timeout 1")
    }
</pre>

用这种方式能设置延迟，在需要重复的场景下可以用**ticker := time.NewTicker(time.Millisecond * 500)**来解决。

在Go语言中不支持传统的try-catch-finally这种异常机制，因为Go的设计者认为可能程序员经常会滥用，所以在大部分的情况都通过返回多个值、其中一个为**ERROR**的办法来处理，只有在真正异常的情况下才使用Go的Exception机制：

1. **defer**：为函数添加结束时执行的语句
2. **panic**：非常严重的不可恢复的错误
3. **recover**：从错误中恢复

来看简单的例子：

<pre class="prettyprint">
func f() (result int) {// 返回值为1，只有defer执行后才有效
    defer func() {
        result++
    }()
    return 0;
}
panic("problem");// 在这个地方程序就挂掉了

func a(){
    panic("a---error");
}
func b(){
    panic("b---error");
}
func(){
    def func(){
        if r:= recover(); r != nil {
            log.Printf("caught: %v", r);
        }
    }
}
</pre>

用recover的方法有点像缩水版的try-catch，简单把Go的语法过了一遍，总体的感觉就是简单、面向工程开发，没有很多的废话，也没有太多学术上很有用、工程上用的不多的细节。基本语法的例子都可以在[这里](https://gobyexample.com/)找到。

## 工程开发































