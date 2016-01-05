---
layout: post
title: NETTY基础知识
date: 2015-12-29
categories: 编程技术

---

网络IO总体上分为（[这里](http://www.cnblogs.com/Anker/p/3254269.html)的比喻不错）：

1. 阻塞
2. 非阻塞

阻塞的方式写起来很简单：当链接可读的时候就读一些，不可读的时候就等待：

<pre class="prettyprint">
ServerSocket serverSocket = new ServerSocket(8787);
while (true) {
    Socket socket = serverSocket.accept();
    // TODO 交给线程池进行处理。
}
</pre>

网络情况不好时阻塞的方式用起来有点蠢，用NIO（有点像SELECT/EPOLL）会靠谱些，当有链接可读时让工作线程来拿数据：

<pre class="prettyprint">
Selector selector = Selector.open();

ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
serverSocketChannel.socket().bind(new InetSocketAddress("127.0.0.1", 8787));
serverSocketChannel.configureBlocking(false);
serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();
    Set&lt;SelectionKey&gt; selectionKeySet = selector.selectedKeys();
    Iterator&lt;SelectionKey&gt; iterator = selectionKeySet.iterator();
    while (iterator.hasNext()) {
        SelectionKey selectionKey = iterator.next();
        if (selectionKey.isAcceptable()) {
            ServerSocketChannel channel = (ServerSocketChannel) selectionKey.channel();
            SocketChannel socketChannel = channel.accept();
            socketChannel.configureBlocking(false);
            socketChannel.register(selector, SelectionKey.OP_READ);
        }
        if (selectionKey.isReadable()) {
            SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
            ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
            int size = socketChannel.read(byteBuffer);
            if (size &lt; 0) {
                selectionKey.cancel();
                socketChannel.close();
            }
            for (int i = 0; i &lt; size; i++) {
                System.out.print((char) byteBuffer.get(i));
            }
        }
        iterator.remove();
    }
}
</pre>

写最简单的功能都要这么多代码，维护起来也比较痛苦，下面来看如何用NETTY简化开发！

## 用法

下面的代码用来实现上面的功能：

<pre class="prettyprint">
EventLoopGroup bossGroup = new NioEventLoopGroup();
EventLoopGroup workerGroup = new NioEventLoopGroup();
ServerBootstrap bootstrap = new ServerBootstrap();
bootstrap.group(bossGroup, workerGroup)
        .channel(NioServerSocketChannel.class)
        .option(ChannelOption.SO_BACKLOG, 1024)
        .childHandler(new ChannelInitializer&lt;SocketChannel&gt;() {
            protected void initChannel(SocketChannel ch) throws Exception {
                ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
                        ByteBuf buffer = (ByteBuf) msg;
                        int size = buffer.readableBytes();
                        for (int i = 0; i &lt; size; i++) {
                            System.out.print((char) buffer.getByte(i));
                        }
                    }
                });
            }
        });
ChannelFuture future = bootstrap.bind(8787).sync();
future.channel().closeFuture().sync();
</pre>

看起来也不怎么直观，不要急，先来了解一些NETTY中的概念：

概念|含义
-|-
Bootstrap/ServerBootstrap|配置netty（添加组件、设置参数）
Channel|定义I/O操作
ChannelHandlerContext|
ChannelHandler|处理感兴趣的事件（read、readomplete、bind、flush等）
ChannelPipeline|ChannelHandler的容器
EventLoop/EventLoopGroup|








Future/Promise|
Unsafe|
ByteBuf|处理缓存的工具，比byte[]或者java.nio.ByteBuffer好用一些








