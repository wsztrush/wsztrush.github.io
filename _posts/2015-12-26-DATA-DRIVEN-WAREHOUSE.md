---
layout: post
title: 用数据来驱动仓库
date: 2015-12-26
categories: 其他

---

双十一的时候去仓库驻仓，还是挺激动的，在十号的时候开始动员大会，由于双十一的量会比平时大很多，所以需要挺多的临时工帮忙：

<img src="http://7xiz10.com1.z0.glb.clouddn.com/DATA-DRIVEN-WAREHOUSE-2.jpg" height="300"/>

过了十一号的零点，本来大家以为会有很多的单子下来，但是并没有:(！大约过了半个小时才有第一单下来，然后陆陆续续地来了：

<img src="http://7xiz10.com1.z0.glb.clouddn.com/DATA-DRIVEN-WAREHOUSE-4.jpg" height="300"/>

双十一的单量不是盖的，大家也按照之前的准备开干，热火朝天：

<img src="http://7xiz10.com1.z0.glb.clouddn.com/DATA-DRIVEN-WAREHOUSE-3.jpg" width="300px"/>

当然，机器也很忙：

<img src="http://7xiz10.com1.z0.glb.clouddn.com/DATA-DRIVEN-WAREHOUSE-1.jpg" width="300px"/>

现在都在讲数据驱动，在仓库的时候也想了一下如何做，下面是一些简单的想法。

## 精确

和[友盟](http://www.umeng.com/)的场景有很大的不同，尤其是数据准确性上：

> PV/UV这些数据错一两个没关系，但是给生产用的报表不行！

如果有一个订单在数据上看到的是没有完成，那么仓库管理员就会去排查到底是卡在什么环节！还有，平时看到的大部分报表都是T-1（昨天）的，这种数据很难用来帮助生产，所以要做到数据驱动还是需要**实时**。

## 展示

数据可视化是非常有学问的一个东西，之前看别人的思考竟然都考虑到色盲，比较佩服！但是现在要讨论的并不是这个，在仓库中一个好的展示必须是：

1. 可查询/设置
2. 有明细
3. 汇总信息一目了然（尤其是大盘上）
4. 统计逻辑清晰、没有任何歧义

这些算是最起码的要求了!

## 报警










