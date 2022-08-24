import {
  getUUID,
  defaultTodos,
  defaultColors
} from "../../utils/util.js"

const STORAGE_TODOS = "todos_key"
const STORAGE_IS_SHOW_DONES = "show_dones"

Page({
  onShareAppMessage() {
    return {
      title: '极简的待办小程序',
    }
  },
  onShareTimeline() {
    return {
      title: '极简的待办小程序',
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    inputValue: "",
    isShowDoneList: true,
    todos: [],
    defaultColors,
    currentCheckedColor: 0,
    currentDialogCheckedColor: 0,
    dialogShow: false,
    currentTapTodo: {},
  },
  onLoad: function () {
    this.initLocalIsShowDones()
    this.initLocalTodos()
  },
  onShow: function () {},
  //初始化是否显示已完成待办
  initLocalIsShowDones: function () {
    wx.getStorage({
      key: STORAGE_IS_SHOW_DONES,
      success: (res) => {
        this.setData({
          isShowDoneList: res.data
        })
      },
      fail: (e) => {
        console.log(e)
        //失败 应该是第一次进来 设为可见
        this.setData({
          todos: true
        })
      }
    })
  },
  //初始化本地待办列表
  initLocalTodos: function () {
    wx.getStorage({
      key: STORAGE_TODOS,
      success: (res) => {
        console.log(res.data)
        //设为本地待办列表
        this.setData({
          todos: JSON.parse(res.data)
        })
      },
      fail: (e) => {
        console.log(e)
        //失败 应该是第一次进来 设为默认待办列表
        this.setData({
          todos: this.getDefaultTodos()
        })
      }
    })
  },
  //默认待办列表
  getDefaultTodos: function () {
    return defaultTodos
  },
  //每次改变待办列表 更新本地待办列表
  updateLocalTodos: function () {
    wx.setStorage({
      key: STORAGE_TODOS,
      data: JSON.stringify(this.data.todos)
    })
  },
  //输入监听 手动设置输入值 
  onInput: function (event) {
    if (!event) return
    this.setData({
      inputValue: event.detail.value
    })
  },
  //点击输入框下的颜色
  tapColor: function (event) {
    let currentCheckedColor = event.currentTarget.dataset.index
    this.setData({
      currentCheckedColor
    })
  },
  //点击添加待办、待办输入框按回车键
  tapGo: function (event) {
    if (!this.data.inputValue.trim()) {
      return;
    }
    let content = this.data.inputValue;
    let todos = this.data.todos
    todos.unshift({
      id: getUUID(),
      content,
      isDone: false,
      color: this.data.defaultColors[this.data.currentCheckedColor]
    })
    this.setData({
      todos,
      inputValue: ""
    })
    this.updateLocalTodos()
  },
  //点击完成图标，把待办状态改为完成；点击已完成图标，把待办状态改为未完成
  tapRadio: function (event) {
    let done = event.currentTarget.dataset.done //状态
    let id = event.currentTarget.dataset.id
    let todos = this.data.todos
    let tempTodo //缓存 用于排序（更新状态后排到第一个）
    for (let [index, todo] of todos.entries()) {
      if (id == todo.id) {
        todo.isDone = done
        tempTodo = todo
        todos.splice(index, 1)
        break;
      }
    }
    todos.unshift(tempTodo)
    this.setData({
      todos
    })
    this.updateLocalTodos()
  },
  //切换已完成待办的显示状态
  tapSwitchDoneList: function () {
    this.setData({
      isShowDoneList: !this.data.isShowDoneList
    })

    wx.setStorage({
      key: STORAGE_IS_SHOW_DONES,
      data: this.data.isShowDoneList
    })
  },
  //点击待办条目
  tapTodoItem: function (event) {
    let currentTapTodo = event.currentTarget.dataset.item
    let currentDialogCheckedColor = 0
    for (let [index, color] of this.data.defaultColors.entries()) {
      if (color == currentTapTodo.color) currentDialogCheckedColor = index
    }

    this.setData({
      dialogShow: true,
      currentTapTodo,
      currentDialogCheckedColor,
    })
  },
  //防止点击弹窗主体关闭弹窗
  catchtap: function () {},
  //输入监听 手动设置输入值 
  onDialogInput: function (event) {
    if (!event) return
    let currentTapTodo = this.data.currentTapTodo
    currentTapTodo.content = event.detail.value
    this.setData({
      currentTapTodo
    })
  },
  //关闭弹窗
  onDialogClose: function () {
    this.setData({
      dialogShow: false
    })
  },
  //点击弹窗的颜色
  tapDialogColor: function (event) {
    let currentDialogCheckedColor = event.currentTarget.dataset.index
    let currentTapTodo = this.data.currentTapTodo
    currentTapTodo.color = this.data.defaultColors[currentDialogCheckedColor]
    this.setData({
      currentDialogCheckedColor,
      currentTapTodo
    })
  },
  //弹窗的删除按钮
  tapDialogDelete: function () {
    let todos = this.data.todos
    for (let [index, todo] of todos.entries()) {
      if (this.data.currentTapTodo.id == todo.id) {
        todos.splice(index, 1);
        break;
      }
    }
    this.setData({
      todos,
      dialogShow: false
    })
    this.updateLocalTodos()
  },
  //弹窗的保存按钮
  tapDialogSave: function () {
    let todos = this.data.todos
    for (let todo of todos) {
      if (this.data.currentTapTodo.id == todo.id) {
        todo.content = this.data.currentTapTodo.content;
        todo.color = this.data.currentTapTodo.color;
        break;
      }
    }
    this.setData({
      todos,
      dialogShow: false
    })
    this.updateLocalTodos()
  },
})