---
layout: post
title: 组件化
date: 2015-07-31
categories: 编程技术

---

做后端开发已经很清楚地知道如何抽象、解耦，现在RESTful风格的再次流行也让整个后端开发看起来尽善尽美，而前段也很牛逼，有了bootstrap之后，不懂css也能很快上手搞出一个页面，况且还有[ibootstrap](http://www.ibootstrap.cn/)这种工具逆天般的存在。

但是，让一个人做出来一个完整的功能就傻逼了，而有组件化之后就不同了。

## 目标

页面都是用一堆的HTML拼出来的，可以进行划分为一些小块：

1. 输入框
2. 下拉列表
3. 按钮
4. 列表
5. ...

在同一个应用中，这些组件都长得差不多，那么在一个VM上开发了一个按钮之后，通常的做法是在另外一个VM上把代码粘贴上去并简单修改一些参数。在用webx的时候我们会做一堆的controller，但是这个还远远不够。

组件化的目标就是：**让你ctrl-c、ctrl-v个痛快**，

## 第一种方案

同事正在做的方式，通过一个后台的页面来维护一个树状结构：

- 页面
  - 容器
   - 组件A
   - 组件B
  - 容器
   - 组件C
   - 组件D

用一个巨复杂的页面来一个一个构建。这种方案的缺点是：

1. 在数据库中用各种表来保存组件数据；
2. 在第一次使用中完全不知道怎么使用，除非你知道这套系统的执行逻辑；
3. 偶尔会出现配置出错的情况，这台方案回滚起来只能靠人脑了；
4. 功能越强大，用起来越复杂；
5. 在需要增加新功能的时候必然要去修改配置的页面；

## 第二种方案

为了改善易用性，另外一种就是用高大上的前端来搞定配置的过程：

![](http://)

在配置页面的过程中，可以在组件上绑定属性和事件，这种方式的问题在于：

1. 底层结构复杂；
2. 配置页面的交互开发量太大；

## 第三种方案

通常来说DSL基本上是每个专业领域提升效率的终极武器，在配置一个页面的时候可以这样：

<pre class="prettyprint">
@layout
    @input(name = "warehouse_id", label = "仓库")
    @inputWithTime(name = "xxx", label = "xxx")
    @button(label = "查询")
    @button(label = "导出")
@layout
	@table // 列表的展示
    @page  // 分页组件的展示
</pre>

页面之间最麻烦的是数据交互和联动，比如在查询的时候需要知道查询条件分别是什么，有两种解决办法，第一种是为button绑定事件，在点击的时候获取其他组件的数据：

<pre class="prettyprint">
@button
	@onclick
    	var warehouse_id = getByName("warehouse_id");
        var response = query("/path", warehouse_id);
        // 更新table的展示
</pre>

看起来是搞定了，而且可以吧获取参数等操作进行封装，使得配置起来更加简单，不过他们之间的耦合有点紧，现在的想法是可以用订阅者模式来松一松：

<pre class="prettyprint">
@channel(name = "queryParam")
// ..
@input(name = "warehouse_id", outChannel = "queryParam")
// ..
@button(label = "查询", inChannel = "queryParam")
</pre>

在组件中定义了输出数据的接口以及接收数据的接口，在input发生变化的时候将数据发送给channel，在channel中有数据的时候将结果推送给订阅过它的组件。

那么问题来了：

> 往channel中放的数据是什么格式的？

貌似**key-value**的形式可以搞定很多的需求，而在各个组件的作用域也有一个map来保存数据，仅仅是用channel来互相之间同步数据。当然并不是传输数据的时候都去覆盖掉老的数据，可能会有一些个性化的操作：

<pre class="prettyprint">
@button(label = "查询", inChannel = "queryParam")
	@onclick
        data = query("/", warehouse_id);
        putChannel("tableData", data);
</pre>

在拿到这个模板之后，我们可以这么干：

1. 解析模板文件；
2. 生成AST，然后翻译生成JS文件；
3. 前端页面加载JS文件之后，根据其中的数据生成页面展示；

这样搞起来感觉难度挺大，但是好处多多！

## 总结

组件化很多人在做，做的时间也比较久，但是好像没有做得比较好用的。那么，为什么不尝试一些新的方法和技术。