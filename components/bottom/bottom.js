// components/bottom/bottom.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "bList":Object
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  methods:{
    Togo: function (item) {
      let that = this;
      let path = item.currentTarget.dataset.name.pagePath;
      if (path == '') {
        wx.scanCode({
          fail: function () {
            console.log('失败了')
          },
          success: (res) => {
            console.log('扫好了啊')
            console.log(res)
          },
          complete(res) {
            // console.log(res);
            that.triggerEvent("confirm_test", res);
          }
        })
      } else {
        console.log(item.currentTarget.dataset.name.pagePath)
        wx: wx.switchTab({
          url: path,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    }
  }
})
