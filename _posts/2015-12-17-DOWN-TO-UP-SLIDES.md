---
layout: slides
title: 从下向上来开发(PPT)
date: 2015-12-17
categories: PPT

---

<!-- test -->

<!-- test end-->

<!-- (0) -->
<section><h1>EASY-DT</h1></section>
<!-- (1) -->
<section><h3>方便、快速地提供标准数据接口</h3></section>
<!-- (2) -->
<section>
<!-- (2.1) -->
<section data-markdown><script type="text/template">
### 老的配置方式

<div style="display:inline-block;">
![](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)
![](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)
</div>

- 理想：让不会写代码的人也能配置 <!-- .element: class="fragment" -->
- 现实：并没有多少人会用 <!-- .element: class="fragment" -->
</script></section>
<!-- (2.2) -->
<section>
<h3>实际中的数据</h3>
<pre><code>
[
    {
        "name": "拣选",
        "list": [
            0, 0, 0, 0, 0, 0, 0, 0, 256, 6049, 5684, 3008
        ],
        "latest_count": 4862
    },
    {}
]
</code></pre>
</section>
<!-- (2.3) -->
<section data-markdown><script type="text/template">
### 分析问题

- 功能作用单一
- 无法地将功能组件组合使用
- 扩展复杂
- 过多的功能容易导致混淆
</script></section>
<!-- (2.4) -->
<section data-markdown><script type="text/template">
### 使用GROOVY组合基础功能

- 调试
- 安全控制
- 版本控制
- 编辑保存
- 同步
- 扩展性<!-- .element: class="fragment highlight-red" -->
</script></section>
<!-- (2.5) -->
<section data-markdown><script type="text/template">
![现在的编辑页面](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)

- 对开发来说GROOVY的学习成本应该还是比较低的
</script></section>
<!-- (2.6) -->
<section data-markdown><script type="text/template">
### 小白用户更愿意看到的是

![现在的编辑页面](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)<!-- .element: class="fragment" -->
</script></section>
<!-- (2.7) -->
<section>
<h3>可能的一种扩展方法</h3>
<pre><code>
static Object execute(){
    def template_context = get("template_context");
    def sql = template_context.get("sql");
    def datasource = template_context.get("datasource");
    // 
}
static void mock(){
    // 
}
</code></pre>
</section>
<!-- (2.8) -->
<section data-markdown><script type="text/template">
### 整体结构
</script></section>
</section>
<!--(3)-->
<section><h3>更简单的前端页面开发</h3></section>
<!--(4)-->
<section>
<!--(4.1)-->
<section data-markdown><script type="text/template">
### 分析问题

- 后端开发不懂前端逻辑，前端很容易成为瓶颈<!-- .element: class="fragment" -->
- 逻辑复杂<!-- .element: class="fragment" -->
- 代码重复<!-- .element: class="fragment" -->
- 可读性和维护性不是很好<!-- .element: class="fragment" -->
</script></section>
<!--(4.2)-->
<section data-markdown><script type="text/template">
### 解决问题

- 灵活性：生成JavaScript代码
- 可读性：用简单的DSL来描述
- 易用性：在组件中封装JS、CSS的依赖
</script></section>
<!--(4.3)-->
<section>
<h3>使用组件</h3>
<br/>
<br/>
<div class="fragment">
<span style="color:red;">@input</span>
(
<span style="color:green;">label</span>="仓库" 
<span style="color:green;">name</span>="warehouse"
)
</div>
</section>
<!--(4.4)-->
<section>
<h3>组件关联</h3>
<br/>
<pre><code>
@input(name="warehouse")
@input(name="owner")
    @on(target="warehouse" type="change")
        // 1. 请求接口获取数据
        // 2. 更新组件自生的数据
        // 3. 刷新展示
</code></pre>
</section>
<!--(4.5)-->
<section>
<h3>定义组件</h3>
<br/>
<pre><code>
@import(
    'bootstrap.css' // 依赖的CSS文件（需要的时候也可以加JS）
)
@component
    this.width = '10px'; // 一些默认的数据

    @render  // 在render下定义渲染（有点像JSX吧）
        <ul>
            for(i in items){
                <li>${items[i]}</li>
            }
        </ul>
</code></pre>
</section>
<!-- (4.6) -->
<section>
<h3>生成的代码</h3>
<br/>
<pre><code>
	create("div");
	attr("class","control-group span8");
	push();
	create("label");
	attr("class","control-label");
	push();
	create(null, ("供应商编码："));
	pop();
	create("div");
	attr("id","s1"+this.name);
	attr("class","controls");
	push();
	pop();
	pop();
</code></pre>
</section>
<!--(4.7)-->
<section>
<h3>前端</h3>
<br/>
<pre><code>
<script type="text/engine">
@layout
    @input(label="xxx" name="xxx")
    @input(label="xxx" name="xxx")
    @input(label="xxx" name="xxx")
@layout
    @table
    @page
</script>
</code></pre>
</section>
<!--(4.8)-->
<section>
<h3>后端</h3>
<br/>
<pre><code>
<script type="text/engine">
<form>
    @input(label="xxx" name="xxx") // 使用组件
    @input(label="xxx" name="xxx") // 使用组件
    @input(label="xxx" name="xxx") // 使用组件
    <table></table>
</form>
</script>
</code></pre>
</section>
<!--(4.9)-->
<section data-markdown><script type="text/template">
### 整体结构
</script></section>
</section>