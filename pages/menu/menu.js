// pages/menu/menu.js
const app = getApp();
let wxqrcode = require('../../utils/code/index.js');
let http = app.globalData.httpUrl;
Page({
  data: {
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
        selected: false

      }, {
        pic: '../../images/my.png',
        picactive: '../../images/mySelected.png',
        pagePath: '../my/my',
        text: '我的',
        selected: false
      }
    ],
    timer: null
  },
  // 跳转到我的页面执行停止定时器
  onUnload:function(){
    console.log('卸载页面')
    clearTimeout(this.data.timer)
  },
  onLoad: function (code) {
    let that = this;
    console.log('code' + code)
    let couponSerialNo = code.couponid
    let loginCode = wx.getStorageSync('logincode')
    that.setData({
      timer:null
    })
    // 验证状态请求
    let i = 0;
    function reqState(){
      clearTimeout(that.data.timer)
      wx.request({
        url: http + '/customer/confirmconsume',
        data: {
          loginCode: loginCode,
          couponSerialNo: couponSerialNo
        },
        header: {
          "content-type": "application/x-www-from-urlencoded"
        },
        method: 'GET',
        dataType: 'application/json',
        responseType: 'text',
        success: function (res) {
          console.log(res.data)
          wx.setStorageSync("couponConsumeData", res.data)
          let list = JSON.parse(res.data)
          let status = list.status;
          let consumeStatus = list.consumeCouponStatus;
          if (status == 2) {
            console.log('操作失败')
          } else if (status == 3) {
            cosole.log('用户未登录')
          } else if (status == 1) {
            console.log('操作成功');
            if (consumeStatus == 1) {
              setTimeout(function () {
                wx.showToast({
                  title: '验证成功！',
                  icon: 'success'
                })
              }, 10000)
              wx.switchTab({
                url: '../my/my',
              })
            } else {
              console.log('消费未成功')
               ++i
               if(i <= 12){
                 that.setData({
                   timer: setTimeout(function () {
                     console.log('定时器');
                     reqState();
                   }, 1000)
                 })
               }
            }
          }
        },
        fail: function () {
        },
        complete: function () {
          console.log(i)
        }
      })
    }
    // 控制每10s获取一次
    that.setData({
      timer: setTimeout(function () {
        console.log('定时器');
        reqState();
      }, 10000)
    }) 
    
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    // 第二个参数我们根据后台给的唯一标识进行改变
    console.log(code)
    wxqrcode.qrcode('qrcode', code.couponid, 450, 450);
  }
 
})