# NumberEditor
简单的数字控制插件

<br />

## 用法

```html
<input value="100" id="ipt" />
```

```javascript
new NumberEditor('#ipt')
```

带配置的用法:

```javascript
new NumberEditor('#ipt', {
  readonly: false,
  min: 0,
  max: 100,
  ...
})
```

<br />

## Config 

配置项 | 默认值 | 说明
---- | ---- | ----
min | - | 最小值
max | - | 最大值
readonly | true | 是否只读
step | 1 | 加减的最小单位
remote | null | 远程请求配置项
beforeChange | 空函数 | 改动值之前执行回调，回调方法返回`false`则阻止改动
onChange | 空函数 | 改动值之后执行回调
afterRender | 空函数 | 插件初始化完成后执行回调

<br />

## NumberEditor对象

属性与方法 | 参数 | 说明
---- | ---- | ----
cfg | - | 当前对象的配置
value | - | 对象当前值
jIpt | - | 对象的输入元素（不一定是input，插件可接受div、textarea等元素作初始化）
check() | value | 尝试设置对象的值为value
destroy() | - | 销毁对象
enable() | - | 启用插件
disable() | - | 禁用插件
getPostStatus() | - | 获取对象是否在异步请求中
setPostStatus() | - | 设置对象的异步请求状态

<br />

## remote配置详解

在数字加减的过程中，我们可能需要询问服务器修改是否成功（比如库存状态）。`remote`配置可以解决此类问题。

#### 配置项的值为`function`

为什么选用function类型作为配置项？这主要是为了方便获取NumberEditor对象的当前值，比如

```javascript
remote: function () {
  var v = this.value
  return {
    url: '/id/' + v
    ...
  }
}
```

this关键字在remote配置的`function`中指向NumberEditor对象自身。

#### 返回值为jQuery/Zepto的ajax配置

```javascript
remote: function () {
  return {
    url: '...',
    dataType: 'json',
    type: 'POST',
    data: ...
  }
}
```

返回的配置中不需要填写`success`和`error`，因为NumberEditor会使用promise方式处理异步请求，即在`onChange`配置中处理。

```javascript
remote: function () {
  return {
    ...
  }
},
onChange: function (data) {...}
```

请求结束后，会调用`onChange`的值，并将请求得到的数据作为参数传递给。

**Zepto的ajax默认没有promise方法，需要添加callback和deferred模块**

#### 其他

- 配置remote后，生成的DOM中会多一个loading元素；
- `setPostStatus`方法可以手动设置对象是否在异步请求状态；
- `onChange`配置可以理解为有`remote`配置则在请求完成后执行，没有则立即执行

-------------------

<br />