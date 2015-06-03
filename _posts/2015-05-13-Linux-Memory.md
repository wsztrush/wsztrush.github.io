---
layout: post
title: Linux内存管理
date: 2015-05-13
categories: 编程技术

---

现在的服务器大部分都是运行在Linux上面的，所以，作为一个程序员有必要简单地了解一下系统是如何运行的。对于内存部分需要知道：

1. 地址映射
2. 内存管理的方式
3. 缺页异常
4. 文件映射

下面分别来看。

## 地址

在Linux内部的地址的映射过程为**逻辑地址**-->**线性地址**-->**物理地址**，物理地址最简单：地址总线中传输的数字信号，而线性地址和逻辑地址所表示的则是一种转换规则，线性地址规则如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-线性地址.png)

这部分由MMU完成，其中涉及到主要的寄存器有CR0、CR3。机器指令中出现的是逻辑地址，逻辑地址规则如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-逻辑地址.png)

在Linux中的逻辑地址等于线性地址，也就是说Inter为了兼容把事情搞得很复杂，Linux简化顺便偷个懒。

## 内存管理的方式

在系统boot的时候会去探测内存的大小和情况，在建立复杂的结构之前，需要用一个简单的方式来管理这些内存，这就是**bootmem**，简单来说就是位图，不过其中也有一些优化的思路。

bootmem再怎么优化，效率都不高，在要分配内存的时候毕竟是要去遍历，**buddy**系统刚好能解决这个问题：在内部保存一些2的幂次大小的空闲内存片段，如果要分配3page，去4page的列表里面取一个，分配3个之后将生效的1个放回去，内存释放的过程刚好是一个逆过程。用一个图来表示：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-伙伴系统.png)

可以看到0、4、5、6、7都是正在使用的，那么，1、2被释放的时候，他们会合并吗？

<pre class="prettyprint">
static inline unsigned long
__find_buddy_index(unsigned long page_idx, unsigned int order)
{
    return page_idx ^ (1 &lt;&lt; order);// 更新最高位，0～1互换
}
</pre>

从上面这段代码中可以看到，0、1是buddy，2、3是buddy，虽然1、2相邻，但他们不是。可能出现释放一个页面的时候合并很多次，分配的时候切割很多次，不过这个比较极端~~另外，我们可以通过cat /proc/buddyinfo获取到各order中的空闲的页面数。


![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-ALL.png)











