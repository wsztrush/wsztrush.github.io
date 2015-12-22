---
layout: slides
title: ZOOKEEPER基础
date: 2015-12-22
categories: 编程技术

---

搞数据开发的对一些产品非常熟悉，比如：

1. HBase
2. Hadoop
3. ...

但是对它们背后共同的“男人”没有太多的了解，太不应该了。这篇是一个基础的介绍，看完之后应该会对ZOOKEEPER有大概了解。

## 安装部署

在[这里](http://zookeeper.apache.org/releases.html)下载包，放到你喜欢的目录解压缩：

> sudo tar -zxvf zookeeper-3.4.7.tar.gz

配置信息在**conf/zoo.cfg**中（可以在zoo_sample.cfg中看到），常用的几个设置项如下（更多看[这里](http://www.cnblogs.com/ggjucheng/p/3352591.html)）：

配置|作用
-|-
tickTime|客户端和服务器之间的心跳间隔（毫秒）
initLimit|FOLLOWER与LEADER初始连接的最大延迟心跳数
syncLimit|FOLLOWER与LEADER请求应答的最大延迟心跳数
dataDir|数据文件目录
dataLogDir|日志文件目录
clientPort|客户端连接端口

配置安成以后使用命令启动（standalone模式）：

> ./bin/zkServer.sh start

查看zookeeper的状态（看看起来没）：

> ./bin/zkServer.sh start

当然也可以用客户端试一下能不能连上：

> ./bin/zkCli.sh 或者 ./bin/zkCli.sh -server 127.0.0.1:2181

现在还是单个节点，离集群还差很多，怎么办？暂时没有很多机器，在单机上搞“伪集群”应该还是简单的，这样和真正的集群差的不是太多了。刚开始看[这里](http://blog.csdn.net/tanyujing/article/details/8504481)感觉没啥问题，但是有点烦，于是看下./bin/zkServer.sh的代码：

<pre class="prettyprint">
if [ "x$2" != "x" ]
then
    ZOOCFG="$ZOOCFGDIR/$2"
fi
</pre>

果然是可以指定配置文件的，于是创建文件**./conf/zoo_1.cfg**，内容如下：

<pre class="prettyprint">
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/1 # 新建个目录
clientPort=3181 # 注意端口不要冲突
server.0=127.0.0.1:2008:6008
server.1=127.0.0.1:2007:6007
</pre>

当然需要对原来的**./conf/zoo.cfg**做一点小修改：

<pre class="prettyprint">
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/tmp/zookeeper/0 # 新建个目录
clientPort=2181 # 注意端口不要冲突
server.0=127.0.0.1:2008:6008
server.1=127.0.0.1:2007:6007
</pre>

后面放的是ZK的服务器列表（每个节点上的列表都是一样的），格式如下：

> server.[myId]=[IP地址][通信端口][选举端口]

另外需要写入myid：

<pre class="prettyprint">
echo '0' > /tmp/zookeeper/0/myid
echo '1' > /tmp/zookeeper/1/myid
</pre>

现在可以启动了：

<pre class="prettyprint">
./bin/zkServer.sh start ./conf/zoo.cfg
./bin/zkServer.sh start ./conf/zoo_1.cfg
</pre>

再用命令查看状态显示**Mode: follower**，启动成功（STOP的时候也需要指定配置文件）。

## 原理


## 使用方法


## 总结