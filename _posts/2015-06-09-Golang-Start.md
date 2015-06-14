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





