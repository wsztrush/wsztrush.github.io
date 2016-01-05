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
<section><h3>方便、快速地提供数据</h3></section>
<!-- (2) -->
<section>
<!-- (2 类型比较多) -->
<section data-markdown><script type="text/template">
![需要选择很多类型](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-SLIDES-1.png)
</script></section>
<!-- (2 不知道每种类型应该怎么用) -->
<section data-markdown><script type="text/template">
![每种类型都有自己的学习成本](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-SLIDES-2.png)
</script></section>
<!-- (2 结果数据比较灵活，可能遇到的时候就需要写代码或者增加新的组件) -->
<section>
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
<!-- (2 分析问题到底出在哪里) -->
<section data-markdown><script type="text/template">
### 分析问题

<br/>

- 组件生成的数据结构固定，无法灵活适应业务
- 很难组合使用多个组件
- 扩展较复杂
- 上手、维护成本高
</script></section>
<!-- (2 最底层用GROOVY来写的好处) -->
<section data-markdown><script type="text/template">
### 将GROOVY作为基础

<br/>

- 查看
- 编辑
- 保存
- 调试
- 提交/发布
- 权限、开关、限流
- 同步
- 扩展性<!-- .element: class="fragment highlight-red" -->
</script></section>
<!-- (2 脚本编辑页面) -->
<section data-markdown><script type="text/template">
![脚本编辑页面](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-SLIDES-3.png)
</script></section>
<!-- (2 小白用户更愿意看到的配置页面) -->
<section data-markdown><script type="text/template">
![小白用户想看到的配置方式](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)
</script></section>
<!-- (2 实现小白配置页面的方法) -->
<section>
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
<!-- (2 整体架构) -->
<section data-markdown><script type="text/template">
![整体结构](http://7xiz10.com1.z0.glb.clouddn.com/DOWN-TO-UP-1.png)
</script></section>
</section>
<!--(3)-->
<section><h3>配置报表页面</h3></section>
<!--(4)-->
<section>
<!--(4 老的开发模式的问题)-->
<section data-markdown><script type="text/template">
### 分析问题

<br/>

- 后端开发不懂前端逻辑，前端很容易成为瓶颈<!-- .element: class="fragment" -->
- 逻辑复杂<!-- .element: class="fragment" -->
- 代码重复<!-- .element: class="fragment" -->
- 可读性和维护性不是很好<!-- .element: class="fragment" -->
</script></section>
<!--(4 解决问题的方式)-->
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
<form>
    @input(label="xxx" name="xxx") // 使用组件
    @input(label="xxx" name="xxx") // 使用组件
    @input(label="xxx" name="xxx") // 使用组件
    <table></table>
</form>
</code></pre>
</section>
<!--(4.9)-->
<section data-markdown><script type="text/template">
### 整体结构
</script></section>
</section>
<!--(5)-->
<section><h3>精确的数据计算</h3></section>
<!--(6)-->
<section>
<!--(6 可能导致错误的原因)-->
<section>
</section>
<!--(6 解决办法)-->
<section>
</section>
</section>