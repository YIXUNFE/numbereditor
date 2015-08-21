/**
 * 数字加减功能组件 2015/07/01 jianchen@yixun.com
 * @Class NumberEditor
 * @usage new NumberEditor($('input.numberEdit'), {...})
 */

"use strict"
;(function ($) {
  
  //兼容PC与移动端事件
  var _mobileCheck = 'ontouchend' in document,
    ev = {
      click: 'click',
      start: _mobileCheck ? 'touchstart' : 'mousedown',
      move: _mobileCheck ? 'touchmove' : 'mousemove',
      end: _mobileCheck ? 'touchend' : 'mouseup',
      cancel: _mobileCheck ? 'touchcancel' : 'mousecancel'
    }
  
  /**
   * 默认配置参数
   * @param {Number} max 最大值
   * @param {Number} min 最小值
   * @param {Number} step 增量值, default: 1
   * @param {Boolean} readonly 只读项, default: true
   * @param {Function} remote 异步请求配置项，函数作用域为实例对象本身，可以在函数中调用实例对象的内容；返回的配置内容和Zepto/jQuery的Ajax配置项一致
   *   eg: remote: function () {
   *         return {
   *           url: '/count',
   *           data: {num: this.value},
   *           type: 'POST'
   *         }
   *       }
   * @param {Function} beforeChange 数值变化之前触发，返回false可阻止后续行为
   * @param {Function} onChange 数值变化之后。注意: 在启用remote参数后，请求在数值变化之后发送
   * @param {Function} afterRender 组件DOM结构渲染完成后触发
   */
  var defaultCfg = {
    //max: 1000,
    //min: 1,
    step: 1,
    readonly: true,
    remote: null,
    beforeChange: function () {},
    onChange: function () {},
    afterRender: function () {}
  }
  
  /**
   * 获取元素值（可使用非input元素）
   * @type {Function}
   * @param {Object} Zepto/jQuery对象
   */
  function _getVal (jDom) {
    var result = '',
        dom = jDom[0],
        tagName = dom.tagName.toLowerCase()
    if (tagName === 'input' || tagName === 'textarea') {
      result = dom.value
    } else {
      result = jDom.text()
    }
    return result
  }
  
  /**
   * 设置元素值（可使用非input元素）
   * @type {Function}
   * @param {Object} Zepto/jQuery对象
   * @param {Number} 值
   */
  function _setVal (jDom, v) {
    var dom = jDom[0],
        tagName = dom.tagName.toLowerCase()
    if (tagName === 'input' || tagName === 'textarea') {
      dom.value = v
    } else {
      jDom.text(v)
    }
  }
  
  /**
   * 混合自定义参数
   * @type {Function}
   */
  function _extendCfg (cfg) {
    return $.extend({}, defaultCfg, cfg)
  }
  
  /**
   * 初始化方法
   * @type {Function}
   */
  function _init () {
    _create.apply(this)
    this.check()
    _bind.apply(this)
  }
  
  /**
   * 生成附件DOM
   * @type {Function}
   */
  function _create () {
    var html = 
      '<div id="J_numberEditor" class="number-control">' + 
        '<a class="number-subtract number-control-btn" href="javascript:">-</a>' + 
        '<a class="number-plus number-control-btn" href="javascript:">+</a>' + 
      '</div>',
      cfg = this.cfg,
      jIpt = this.jIpt,
      jDom = $(html),
      jSubtractBtn = jDom.find('.number-subtract'),
      jPlusBtn = jDom.find('.number-plus')
    
    ///////////////////////wrap不行 多点绕远路 看看后面能不能改进  
    jIpt.before(jDom)
    jPlusBtn.before(jIpt)
    
    //设置是否只读
    if (cfg.readonly) {
      jIpt.attr('readonly', 'readonly')
    } else {
      jIpt.removeAttr('readonly')
    }
    
    //添加loading元素
    if (cfg.remote) {
      this.jLoading = $('<span class="number-loading">loading...</span>')
      jPlusBtn.after(this.jLoading)
    }
    
    this.wrapper = jDom
    this.jSubtractBtn = jSubtractBtn
    this.jPlusBtn = jPlusBtn
    
    cfg.afterRender && cfg.afterRender.apply(this)
  }
  
  /**
   * 检查数字是否合理
   * @type {Function}
   * @param {Number}
   */
  function _check (v) {
    var jIpt = this.jIpt,
        cfg = this.cfg,
        cv = this.value,
        min = cfg.min,
        max = cfg.max,
        v = typeof v !== 'undefined' ? v : cv

    if (v.toString() === 'NaN') {_setVal(jIpt, cv); return}
    
    if (typeof min !== 'undefined') {
      if (v <= min) {
        v = min
        this.jSubtractBtn.addClass('disable')
      } else {
        this.jSubtractBtn.removeClass('disable')
      }
    }
    if (typeof max !== 'undefined') {
      if (v >= max) {
        v = max
        this.jPlusBtn.addClass('disable')
      } else {
        this.jPlusBtn.removeClass('disable')
      }
    }
    
    if (v === cv) {_setVal(jIpt, cv); return}
    
    //use return false to prevent request
    if (cfg.beforeChange && cfg.beforeChange.apply(this) === false) {return}
    
    //检查通过
    
    if (this.jIpt.prop('disabled')) {
      this.jSubtractBtn.addClass('disable')
      this.jPlusBtn.addClass('disable')
    }
    _setVal(jIpt, v)
    this.value = v
    
    //处理回调
    if (!cfg.remote) {
      cfg.onChange.apply(this)
    } else {
      _handleRemote.apply(this)
    }
  }
  
  /**
   * 绑定事件
   * @type {Function}
   */
  function _bind () {
    var that = this
    
    this.jSubtractBtn.on(ev.click, function () {
      if (!$(this).hasClass('disable') && !that.getPostStatus()) {
        _update.call(that, -that.cfg.step)
      }
    })
    
    this.jPlusBtn.on(ev.click, function () {
      if (!$(this).hasClass('disable') && !that.getPostStatus()) {
        _update.call(that, that.cfg.step)
      }
    })
    
    this.jIpt.on('focus', function (e) {
      if (that.getPostStatus()) {e.preventDefault(); return false}
    })
    
    this.jIpt.on('blur', function () {
      if (that.getPostStatus()) {return}
      that.check(parseInt(this.value, 10))
    })
  }
  
  /**
   * 更新数字
   * @param {Number} 增量值
   */
  function _update (step) {
    var v = this.value + step
    this.check(v)
  }
  
  /**
   * 处理异步请求
   * @type {Function} 
   */
  function _handleRemote () {
    var that = this,
        cfg = this.cfg,
        remote = cfg.remote.apply(this)
    
    this.setPostStatus(true)
    $.ajax(remote).then(function (d) {
      cfg.onChange.call(that, d)
      that.setPostStatus(false)
    }, function (d) {
      cfg.onChange.call(that, {errno: -10000, msg: 'request fail'})
      that.setPostStatus(false)
    })
    
  }
  
  /**
   * 关闭功能
   * @type {Function} 
   */
  function _disable () {
    this.jIpt.attr('disabled', 'disabled')
    this.jSubtractBtn.addClass('disable')
    this.jPlusBtn.addClass('disable')
  }
  
  /**
   * 启用功能
   * @type {Function} 
   */
  function _enable () {
    this.jIpt.removeAttr('disabled')
    this.jSubtractBtn.removeClass('disable')
    this.jPlusBtn.removeClass('disable')
    this.check()
  }
  
  /**
   * 设置POST状态
   * @param {Boolean}
   */
  function _setPostStatus (status) {
    if (status) {
      this.jLoading.addClass('loading')
    } else {
      this.jLoading.removeClass('loading')
    }
    this.isPosting = status
  }
  
  /**
   * 获取POST状态
   * @type {Function}
   * @return {Boolean}
   */
  function _getPostStatus () {
    return this.isPosting
  }
  
  /**
   * 回收实例对象
   * @type {Function} 
   */
  function _destroy () {
    var item = ''
    this.jSubtractBtn.off()
    this.jPlusBtn.off()
    this.jIpt.off()
    this.wrapper.remove()
    for (item in this) {
      delete this[item]
    }
    
    this.__proto__ = null
  }
  
  /**
   * NumberEditor组件构造函数
   * @type {Function}
   * @param {Object} ipt
   * @param {Object} cfg 
   */
  function NumberEditor (ipt, cfg) {
    var v = 0
    this.jIpt = $(ipt)
    this.cfg = _extendCfg(cfg)
    v = parseInt(_getVal(this.jIpt), 10)
    this.value = v.toString() === 'NaN' ? (typeof this.cfg.min !== 'undefined' ? this.cfg.min : 0) : v
    _init.apply(this)
  }
  
  NumberEditor.prototype = (function createPrototype () {
    return {
      constructor: NumberEditor,
      check: _check,
      disable: _disable,
      enable: _enable,
      setPostStatus: _setPostStatus,
      getPostStatus: _getPostStatus,
      destroy: _destroy
    }
  }())
  
  if(typeof define === 'function' && define.amd) {
		define([], function () {
			return NumberEditor
		})
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = NumberEditor
	} else {
		window.NumberEditor = NumberEditor
	}
  
}(window.jQuery || window.Zepto))