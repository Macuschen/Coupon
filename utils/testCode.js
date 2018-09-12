let http = getApp().globalData.httpUrl;
// 确认验证
 console.log(wx.getStorageSync("logincode"))
  export function confirm_test(data){
  console.log(data);
  if (data.detail.errMsg === "scanCode:ok") {
    this.setData({
      scan_confirm: "block",
      couponCode: data.detail.result
    })
  } else {
    wx.showToast({
      title: '扫码失败',
      icon: "none"
    })
  }
}
//核销优惠券请求
export function ercode_request(){
  let that = this;
  let Code = null;
  console.log(that.data.couponCode);
  Code =  wx.getStorageSync("logincode");
  wx.request({
    url: http + '/vendor/consume',
    header: {
      // "content-type": "application/x-www-from-urlencoded"
    },
    data: {
      loginCode: Code,
      couponCode: that.data.couponCode
    },
    method: 'GET',
    dataType: 'application/text',
    responseType: 'text',
    success: function (res) {
      console.log(res)
      res.data = JSON.parse(res.data);
      console.log(res.data.status)
      switch (res.data.status) {
        case 1:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '验证成功！',
            icon: "none"
          })
          wx.switchTab({
            url: '../my/my',
          })
          break;
        case 2:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '操作失败！',
            icon: "none"
          })
          break;
        case 3:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '用户未登录！',
            icon: "none"
          })
          break;
        case 4:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '无效优惠券！',
            icon: "none"
          })
          break;
        case 5:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '优惠券已使用！',
            icon: "none"
          })
          break;
        case 6:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '优惠券已过期！',
            icon: "none"
          })
          break;
        case 7:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '活动未开始！',
            icon: "none"
          })
          break;
        default:
          that.setData({
            scan_confirm: 'none'
          })
          wx.showToast({
            title: '无效操作！请重新扫码！',
            icon: "none"
          })
      }
    }
  })
}
// 取消验证
export function cancel_ercodeRequest(){
  console.log('取消验证')
  this.setData({
    scan_confirm: 'none'
  })
}