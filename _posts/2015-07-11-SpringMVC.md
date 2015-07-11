---
layout: post
title: SpringMVC
date: 2015-07-11
categories: 编程技术

---

## 概念

在MVC中最基本的概念就是：

- Model
- View
- Controller

在SpringMVC中对这些结构进行了封装：

名称|含义
-|-
ModelAndView|在同一个地方可以同时操作Model和View
ModelMap|数据承载对象，用于到后面渲染View，在RequestMapping的时候很有用

当然对处理流程也进行了封装：

名称|含义
-|-
DispatcherServlet|前置分发控制器，请求统一交给它处理
VelocityViewResolver|通过name查找View
HandlerInterceptor|拦截器
DefaultAnnotationHandlerMapping|类级别的@RequestMapping
AnnotationMethodHandlerAdapter|方法级别的@RequestMapping
HandlerMethodArgumentResolver|参数解析器
@RequestMapping|映射规则
@Controller|注入
@ModelAttribute|被注释的方法在Controller中处理请求的方法之前执行
@PathVariable|获取路径上的变量

## 处理请求

用的最多的情况就是用户输入URL你给他返回一个**页面**：

<pre class="prettyprint">
@RequestMapping(value = "/abc")
public ModelAndView handle() throws Exception {
    ModelAndView mv = new ModelAndView("abc");
    mv.addObject("key", "abc");
    return mv;
}
</pre>

在很多请求的时候需要返回**JSON**数据，只需要将字符串写出即可：

<pre class="prettyprint">
@RequestMapping(value = "/abc")
public void handle(HttpServletResponse response) throws Exception {
    Map map = Maps.newHashMap();
    map.put("123", 123);
    response.getOutputStream().write(JSON.toJSONString(map).getBytes());
    response.getOutputStream().flush();
}
</pre>

对于**文件下载**的场景也是类似的，不同之处是要指定文件名等：

<pre class="prettyprint">
@RequestMapping(value = "/abc")
public void handle(HttpServletResponse response) throws Exception {
    OutputStream os = response.getOutputStream();
    response.reset();
    response.setHeader("Content-Disposition", "attachment; filename=file.txt");
    response.setContentType("application/octet-stream; charset=utf-8");
    os.write("hello".getBytes());
    os.flush();
    os.close();
}
</pre>

从上面可以看到拿到**HttpServletResponse**之后就可以完全控制住返回值了，在SpringMVC中最简单、直接的获取方式是入参，**HandlerMethodArgumentResolver**会在解析参数的时候进行处理。在网上有看到用**ModelAttribute**的方式，这样貌似不是线程安全的吧~

对于**HttpServletRequest**更简单一些，可以使用RequestContextListener或者RequestContextFilter来做，另外更简单的可以直接注入：

<pre class="prettyprint">
@Resource
HttpServletRequest  request;
</pre>

看起来很诡异，这个是如何注入的？其实这里的request只是一个代理，真正的处理过程可以看：

1. ObjectFactoryDelegatingInvocationHandler
2. RequestObjectFactory

但是找了一圈没找到Response有类似的方法，所以，这种方式对Response可能行不通。其实我们自己也可以实现类似的功能，比如用**HandlerInterceptor**来搞：

<pre class="prettyprint">
public interface HandlerInterceptor {
    // 在方法之前执行
    boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception;
    // 在方法之后执行
    void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception;
    // 在请求处理完成的时候执行
    void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception;
</pre>

我们在preHandle的时候将Request、Response写入ThreadLocal，用FactoryBean来在注入的时候生成代理对象，在调用代理对象的时候先从ThreadLocal中获取对象，再反射调用对象的方法。

从URL到Controller中的方法的映射也是一个需要注意的地方：

设置|匹配
-|-
@RequestMapping(value = "/abc")|/abc、/abc.*、/abc/
@RequestParam("id")|限制参数中必须有id，并将其放到入参中
@RequestMapping(value = "/abc/{id}")|REST风格，用@PathVariable("id")放到入参
@RequestMapping(value = "/{path:[0-9a-z-]+}")|支持正则表达式
@RequestMapping(method = RequestMethod.GET)|方法过滤
@RequestMapping(params = "123")|参数过滤
@RequestMapping(headers = "abc")|头信息过滤
@RequestMapping(consumes = "application/json")|处理请求的提交内容类型过滤
@RequestMapping(produces = "application/json")|返回的内容类型过滤

在SpringMVC中整体的处理逻辑都在**DispatcherServlet**中完成，处理逻辑如下：

1. 处理multipart类型的请求
2. 获取处理链HandlerExecutionChain，其中封装了拦截器和处理器
3. 执行拦截器的preHandle方法
4. 执行处理器
5. 设置View
6. 执行拦截器的postHandle方法
7. 渲染
8. 执行拦截器的afterCompletion方法

## 总结

总体看下来比webx简单、好用一些。