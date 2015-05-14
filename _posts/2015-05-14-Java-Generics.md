---
layout: post
title: Java中的泛型
date: 2015-05-14
categories: 编程技术

---

## 什么是泛型

泛型是JDK 1.5中引入的特性，允许在定义类、接口、方法的时候使用类型参数，声明的类型参数在使用时用具体的类型替换。从好的方面来看，泛型的引入可以在编译时刻就发现很多明显的错误。从不好的方面，为了保证与旧有版本的兼容性，Java泛型的实现上存在一些不优雅的地方。

## 使用方法

最常见的使用场景是泛型类或者接口：

<pre class="prettyprint">
interface TestInterface<T> {
}
class TestClass<T> {
    T data;
}
</pre>

看以看到泛型的好处能节省我们的代码量，当**data**的类型变化的时候，我们不需要去写不同的接口或者类。当然有时候你需要指定多个类型，那么可以：

<pre class="prettyprint">
class TestClass<K, V, OTHER> {
    K     key;
    V     value;
    OTHER other;
}
</pre>

有时候我们希望只支持Number类型，那么可以：

<pre class="prettyprint">
class TestClass<T extends Number> {
    T data;
}
</pre>

当然，泛型也可以用在方法上，举个例子：

<pre class="prettyprint">
public <T> T doSth(T a){
    return a;
}
</pre>

你可能会比较好奇如果同时在方法和类上面使用泛型的话会出现什么情况：

<pre class="prettyprint">
public class Test<T> {
    T data;
    @SuppressWarnings("hiding")
    public <T> T doSth(T a) {
        return a;
    }

    public static void main(String[] args) {
        Test<String> t = new Test<String>();
        System.out.println(t.doSth(123));
        t.data = "123";
    }
}
</pre>

结论是方法上的用方法的，其他的用类上的，如果方法上没有，方法用类上的。

## 多想一点

现在想一下泛型具体是如何实现的，用**javap Test**看doSth的方法声明如下：

<pre class="prettyprint">
public java.lang.Object doSth(java.lang.Object);
</pre>

如果是受限的泛型，比如：

<pre class="prettyprint">
public class Test<T extends Number> {
    public T doSth(T a) {
        return a;
    }
}
</pre>

那么得到的结果则是：

<pre class="prettyprint">
public java.lang.Number doSth(java.lang.Number);
</pre>

如果限制类型有两个（比如\<T extends Comparable & Serializable\>）则生成的字节码中选用第一个（Comparable）。Java中的泛型是伪泛型，在运行期间，所有的泛型信息都会被擦除。也就是说在生成的Java字节码中没有包含泛型中的类型信息。那么在重载的时候会有什么影响，举个例子：

<pre class="prettyprint">
public class Test {
    public void doSth(List<Integer> list) { }
    public void doSth(List<String> list) { }
}
</pre>

现在应该会猜到：**因为类型擦除，这个类是不能被编译通过的。**那么下面这段代码呢？

<pre class="prettyprint">
public class Test {
    public Integer doSth(List<Integer> list) { return null; }
    public String doSth(List<String> list) { return null; }
}
</pre>

编译通过了。这貌似与我们之前对重载的认识不相同：函数之间的区分是依据参数和方法名，返回值并不参与。上面这段代码中常在不是根据返回值来判断的，但是增加不同类型的返回值是的这两个方法能够共存在同一个Class文件中：
> 重载要求方法有不同的方法签名，而返回值并不在方法签名中。但是在Class文件格式中，只要描述符不是完全一致的方法就可以共存，也就是说：返回值也能影响方法能不能共存在同一个Class中。
可以通过javap -s Test看到方法签名。

## 获取泛型的类型

首先来看通过**ParameterizedType**获取类型的方法，如下：

<pre class="prettyprint">
public class Test {
    public List<String> list;

    public static void main(String[] args) throws Exception {
        ParameterizedType pt = (ParameterizedType) Test.class.getField("list").getGenericType();
        System.out.println(pt.getActualTypeArguments()[0]);
    }
}
</pre>

其中getGenericType方法返回一个Type对象，如果是一个参数化类型，那么返回的Type会反映源码中使用的实际参数类型，实际的参数类型通过getActualTypeArguments获取。