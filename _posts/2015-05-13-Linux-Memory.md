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

先来看一些基本的知识，在进程看来，内存分为内核态和用户态两部分，经典比例如下：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-虚拟地址.png)

从用户态到内核态一般通过系统调用、中断来实现。用户态的内存被划分为不同的区域用于不同的目的：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-用户区分段.png)

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

从上面这段代码中可以看到，0、1是buddy，2、3是buddy，虽然1、2相邻，但他们不是。内存碎片是系统运行的大敌，伙伴系统机制可以在一定程度上防止碎片~~另外，我们可以通过cat /proc/buddyinfo获取到各order中的空闲的页面数。

伙伴系统每次分配内存都是以页（4KB）为单位的，但系统运行的时候使用的绝大部分的数据结构都是很小的，为一个小对象分配4KB显然是不划算了。Linux中使用**slab**来解决小对象的分配：

![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-SLAB.png)

在运行时，salb向buddy“批发”一些内存，加工切块以后“散卖。随着大规模多处理器系统和NUMA系统的广泛应用，slab终于暴露出不足：

1. 复杂的队列管理
2. 管理数据和队列存储开销较大
3. 长时间运行partial队列可能会非常长
4. 对NUMA支持非常复杂

为了解决这些高手们开发了**slub**：改造page结构来削减slab管理结构的开销、每个CPU都有一个本地活动的slab(kmem_cache_cpu)等。对于小型的嵌入式系统存在一个slab模拟层**slob**，在这种系统中它更有优势。




![](http://7xiz10.com1.z0.glb.clouddn.com/Linux内存-ALL.png)











