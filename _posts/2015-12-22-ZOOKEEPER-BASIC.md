---
layout: post
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

现在还是单个节点，离集群还差很多，怎么办？暂时没有很多机器，在单机上搞“伪集群”应该还是简单的，这样和真正的集群差的不是太多了。刚开始看[这里的方法](http://blog.csdn.net/tanyujing/article/details/8504481)感觉没啥问题，但是有点烦，于是看下./bin/zkServer.sh的代码：

<pre class="prettyprint">
if [ "x$2" != "x" ]
then
    ZOOCFG="$ZOOCFGDIR/$2"
fi
</pre>

发现果然是可以指定配置文件的，于是创建文件**./conf/zoo_1.cfg**，内容如下：

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

## 实现原理

在分布式的环境中保证数据的一致是比较困难的，比如用主备方式（两个都是中心）：

> 主机挂了备如何自动起来？备也挂了怎么办？

下面来看ZK如何做到**去中心化**的，在集群中有下面几种角色：

角色|作用
-|-
LEADER|数据同步、发起选举
FOLLOWER|响应客户端请求，并在选举的过程中投票
OBSERVER|响应客户端请求，不参与投票（不影响写性能、提高读性能）
CLIENT|发送请求

在他们之间流转的消息有：

消息|作用
-|-
PING|心跳
REQUEST|FOLLOWER发出的提议（写请求、同步请求）
PROPOSAL|LEADER发起的提案，要求FOLLOWER投票
ACK|FOLLOWER对提案的回复（超过半数就算通过）
REVALIDATE|用来延长SESSION有效时间
COMMIT|服务端最新一次提案的信息，FOLLOWER收到后更新本地数据
UPTODATE|同步完成

总体上是通过选举机制来保证集群中LEADER的唯一性（就算集群被分成两半），然后用LEADER来保证数据的一致性。时刻记着**过半就安全**会比较好理解一些，下面来看一些主要流程。

### 一、写入

客户端连的可能是FOLLOWER，也可能是LEADER，写操作引发的消息如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/ZOOKEEPER-1.png)

所有的都会交给LEADER来顺序处理，因此就没有“同时”写入这么一说了。我们知道ZK一个典型的使用场景**分布式锁**，那么：

> 是否所有的分布式锁都适合用ZK来实现？

每个写入都需要投票，只有收到过半的同意才算完，当ZK集群数量较多时IO的压力还是比较大的，那么如果我想在每个写操作上加锁（防止多台机器并发），而且TPS峰值会比较高，用ZK来实现是不怎么合适的。

另外，如果太高的TPS峰值把ZK给压挂了，重新进行选举，那选举的过程中你也是加不了锁的:D。接着看，ZK保证高可用是因为必然会有FOLLOWER保存了数据，那么：

> FOLLOWER中的数据是什么时候写进去的？

当FOLLOWER收到PROPOSAL消息后会将其写入日志文件并发送ACK消息，ZK相关的文件包括（格式参考[这里](http://blog.csdn.net/pwlazy/article/details/8080626)）：

文件|作用
-|-
SNAPSHOT|内存数据的快照（FUZZY），当日志写到一定数量开始用异步线程执行
LOG|日志文件，类似MYSQL的BINLOG，记录每次写操作

在恢复数据的时候需要配合使用这两个文件！在LEADER发出提案以后可能面临的情况有：

1. 收集到过半的ACK：LEADER更新自己的数据以后发送COMMIT和INFORM来更新其他服务器的消息；
2. 没有收集到过半的ACK：一直等，等到成功或者新一轮的投票选举；

处理流程可以在[这里](http://blog.csdn.net/dengsilinming/article/details/18224925)看到（真正想完全了解还是得读源码）。

### 二、投票

当PING的时候发现FOLLOWER的“存活数”没有过半（或者其他异常）时，那么此时需要进行新的一轮选举，那么问题来了：

> 既然存活的FOLLOWER都没过半，再选也解决不了问题啊？

这就不对了，比如LEADER所在机房的网线被挖断了而已，其他机器互相之间连得好好的，那么此时仍然是可能选出一个新LEADER的。选举过程中节点有四种状态：

状态|含义
-|-
LOOKING|启动时，还没有找到LEADER
FOLLOWING|参与投票，但没有成为LEADER
LEADING|参与投票，并且成为了LEADER
OBSERVING|不参与投票

刚开始大家都处于LOOKING状态，通过互相之间发送消息来决定谁是LEADER，默认的**FastLeader**算法从单个机器的角度来看运行流程如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/ZOOKEEPER-2.png)

本地记录中保存了所有机器的投票，比如刚开始都投选自己，那么内容就是：

![](http://7xiz10.com1.z0.glb.clouddn.com/ZOOKEEPER-3.png)

收到别人的投票信息后，与自己的投票对象对比，如果别人的更优，那么自己重新投票并广播。经过几轮通信优秀的人获得的投票数会过半，此时LEADER就选出来了：

![](http://7xiz10.com1.z0.glb.clouddn.com/ZOOKEEPER-4.png)

详细过程可以看这几篇文章（[1](http://www.open-open.com/lib/view/open1413796647528.html)、[2](http://blog.csdn.net/xhh198781/article/details/6619203)、[3](http://www.cnblogs.com/yuyijq/p/4116365.html)）如果仅仅是从ID来判断谁优谁劣，那么C、D、E都有可能成为LEADER，那么：

> 有这么多可能性，ZK重启后集群上的最新数据能保证和之前是一样的吗？

从上面写入的过程发现：如果写入成功必然是有过半的机器保存来数据，而选举的时候同样需要过半达成一致，那么：**过半与过半之间必然有重叠的部分**。而在选举过程中根据数据新旧决定是否更优，那么有最新数据的机器必然会被选举出来。感觉**Paxos**算法要稍复杂一些：

![](http://7xiz10.com1.z0.glb.clouddn.com/ZOOKEEPER-5.png)

整个执行流程分成两个阶段：**准备**（绿色）和**批准**（黄色），详细的内容可以在[这里](http://blog.sina.com.cn/s/blog_3dbab28401014lt4.html)看到，不过[这里](http://www.open-open.com/lib/view/open1420635646984.html)的最后一张图还是给力啊（推荐）！通过这么纠结的过程做到了两个限制：

- **P2c**：如果一个编号为N的提案具有VALUE V，那么存在一个多数派：要么他们中所有人都没有接受编号小于N的任何提案，要么他们已经接受的所有编号小于N的提案中编号最大的那个提案具有VALUE V；
- **P1a**：当且仅当ACCEPTOR没有回应过编号大于N的PREPARE请求时，ACCEPTOR接受编号为N的提案；

有了这些限制集群就不会通过两个不一样的结果（不管消息的顺序是怎么样的）。

## 使用方法








## 总结

