// pages/shop/shop.js
const app = getApp();
let net = require('../../utils/network.js');
let http = app.globalData.httpUrl;
import lazyLoad from '../../utils/lazyload';
let lazyload;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // demo高度
    demoheight:'220',
    "bottomlist": [
      {
        pic: '../../images/index.png',
        picactive: '../../images/indexSelected.png',
        pagePath: '../index/index',
        text: '首页',
        selected: false

      }, {
        pic: '../../images/shop.png',
        picactive: '../../images/shopSelected.png',
        pagePath: '../shop/shop',
        text: '适用商家',
        selected: true

      }, {
        pic: '../../images/my.png',
        picactive: '../../images/mySelected.png',
        pagePath: '../my/my',
        text: '我的',
        selected: false
      }
    ],
    "shopList":[]
  },
  onPageScroll:function(res){
    console.log(res.scrollTop)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideTabBar()
    let logincode = wx.getStorageSync('logincode')
   
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log('小程序'+res.screenHeight)
      },
    })
    // 请求适用商家数据
    console.log('商家页面的logincode'+logincode)
    net.request({
      url: http+'/customer/vendor',
      data: {
        "loginCode":logincode
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: 'GET',
      dataType: 'application/json',
      responseType: 'text',
      success: function(res) { 
        console.log(typeof (res.data) )
        console.log(res.data.list)
        that.setData({
          shopList: res.data.list
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // onReady:function(){
  //   lazyload.observe();
  // },
  onPullDownRefresh: function () {
    let logincode = wx.getStorageSync('logincode')
    let that = this;
    wx.request({
      url: http+'/customer/vendor',
      data: {
        "loginCode": logincode
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: 'GET',
      dataType: 'application/json',
      responseType: 'text',
      success: function (res) {
        console.log('刷新');
        let data = JSON.parse(res.data)
        console.log(data.list)
        that.setData({
          shopList: data.list
        })
        wx.stopPullDownRefresh();
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})