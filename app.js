//app.js
App({

  onLaunch: function () {
    wx.hideTabBar()
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  onShow:function(){
    wx.hideTabBar()
  },
  onload(){
    wx.hideTabBar()
  },
  // 全局变量
  globalData: {
    userInfo: null,
    username:'user',
    httpUrl:'https://zmm.mynatapp.cc',
    onSet:false,
    // 用户领取状态
    getstate:'立即领取'
  }
})