// pages/my/my.js
import { formatTime} from "../../utils/formatTime.js"
import { confirm_test, ercode_request, cancel_ercodeRequest } from "../../utils/testCode.js";
const app = getApp();
let net = require('../../utils/network.js');
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
        selected: true
      }
    ],
    // 销售记录
    saleList:[],
    //头部显示是否是商家，是shop否''
    shop:'shop',
    // 内容显示，显示商家销售记录或优惠券
    shopor:false,
    coupon:'block',
    havecoupon:'block',
    nonecoupon:'none',
    havesale:'block',
    nonesale:'none',
    currentTab:0,
    // 优惠券的数组列表
    allCoupon:[],
    notuseCoupon:[],
    usedCoupon:[],
    overdueCoupon:[],
    avatar:'',
    nickname:'',
    scan_confirm: "none",
    // 商家的销售数量
    saleNum:'',
    // 我的优惠券数量
    couponNum:'',
    couponCode: null //商家端用的二维码信息
  },
  // 加载完成,


  onShow: function (options) {
    wx.hideTabBar()
    let that = this;
    let logincode = wx.getStorageSync('logincode');
    if(!logincode){
      // 没有登录
      that.setData({
        shopor:true,
        nonecoupon:'block',
        havesale:'none',
        shop:'',
        havecoupon:'none',
        avatar:'https://gzpost.gcgn11525.com/dcoupon-v1/static/images/defaultAvatar.png',
        nickname:'未授权登录',
        shopstate:'nologin'
      })
    }else{      
      // 登录后
      //商家销售界面
      if (app.globalData.username == 'shop') {
        console.log('商家页面onload')
        let avatar = wx.getStorageSync('shopavatar');
        let nickname = wx.getStorageSync('shopnickname');
        that.setData({
          "bottomlist": [
            {
              pic: '../../images/index.png',
              picactive: '../../images/indexSelected.png',
              pagePath: '../index/index',
              text: '首页',
              selected: false

            }, {
              pic: '../../images/sao.png',
              text: '扫码结算',
              pagePath: '',
              selected: false
            }, {
              pic: '../../images/my.png',
              picactive: '../../images/mySelected.png',
              pagePath: '../my/my',
              text: '我的',
              selected: true
            }
          ],
          avatar: avatar,
          nickname: nickname
        })
        // 请求销售记录
        net.request({
          url: http + '/vendor/coupon',
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
            console.log(typeof (res.data));
            console.log(res.data.list)
            let list = res.data.list;
            for (let i = 0; i < list.length; i++) {
              list[i].consumetime = list[i].consumetime.substring(0, 10)
            }
            // 判断是否有销售记录进行显示
            if (list.length == 0) {
              that.setData({
                havesale: 'none',
                nonesale: 'block',
                saleNum: list.length
              })
            } else {
              that.setData({
                havesale: 'block',
                nonesale: 'none',
                saleList: list,
                saleNum: list.length
              })
            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      } // 用户界面
      else {
        let avatar = wx.getStorageSync('useravatar');
        let nickname = wx.getStorageSync('usernickname');
        // shopor为true显示用户优惠券
        that.setData({
          shopor: true,
          shop: '',
          avatar: avatar,
          nickname: nickname
        })
        console.log(logincode)
        // 请求客户的优惠券信息    全部，未使用，已使用，已过期

        net.request({
          url: http + '/customer/coupon',
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
            console.log(res)
            console.log(res.data.list)
            let data = res.data.list
            if (data.length == 0) {
              console.log('没有数据')
              that.setData({
                coupon: 'none',
                havecoupon: 'none',
                nonecoupon: 'block'
              })
            } else {
              console.log('有数据')
              for (let i = 0; i < data.length; i++) {
                console.log(data[i].starttime + '时间' + data[i].endtime + '消费时间' + data[i].consumetime)
                data[i].starttime = data[i].starttime.substring(0, 10)
                data[i].endtime = data[i].endtime.substring(0, 10)
                if (data[i].consumetime) {
                  data[i].consumetime = data[i].consumetime.substring(0, 10)
                }
              }
              let overdue = new Array();
              let used = new Array();
              let notuse = new Array();
              for (let i = 0; i < data.length; i++) {
                if (data[i].state == 3) {
                  overdue.push(data[i])
                }
                else if (data[i].state == 2) {
                  used.push(data[i])
                }
                else {
                  notuse.push(data[i])
                }
              }
              that.setData({
                coupon: 'block',
                havecoupon: 'block',
                nonecoupon: 'none',
                allCoupon: data,
                notuseCoupon: notuse,
                overdueCoupon: overdue,
                usedCoupon: used,
                couponNum: data.length
              })
            }
          },
          fail: function (res) { },
          complete: function (res) { },
        })

      }
    }
   
  },
  // 跳转到优惠券详情
  Tocoupondetail:function(e){
    // 输入点击的优惠券的唯一标识
    console.log('传入的参数'+e.currentTarget.dataset.id);
    console.log(e.currentTarget.dataset.state);
    let couponid = e.currentTarget.dataset.id;
    let state = e.currentTarget.dataset.state;
    let starttime = e.currentTarget.dataset.starttime;
    let endtime = e.currentTarget.dataset.endtime;
    let preferentialamount = e.currentTarget.dataset.preferentialamount;
    let consumptionamount = e.currentTarget.dataset.consumptionamount;
    // state为4已领取活动未开始，不能跳转，进行提示
    if(state == 1){
      wx.navigateTo({
        url: '../menu/menu?couponid=' + couponid
      })
    }else if(state == 4){
      wx.showToast({
        title: '活动未开始',
        icon:'none'
      })

    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 加载商家销售记录
    let that = this;
    let logincode = wx.getStorageSync('logincode')
    that.setData({
      allCoupon: [],
      notuseCoupon: [],
      usedCoupon: [],
      overdueCoupon: []
    })
    if (app.globalData.username == 'shop') {
      wx.request({
        url: http + '/vendor/coupon',
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
          console.log('销售记录刷新');
          console.log(typeof(res.data))
          let data = JSON.parse(res.data);
          let list = data.list
          console.log(list)
          console.log(res.data)
          for (let i = 0; i < list.length; i++) {
            list[i].consumetime = list[i].consumetime.substring(0, 10)
          }
          // 判断是否有销售记录进行显示
          if (list.length == 0) {
            that.setData({
              havesale: 'none',
              nonesale: 'block',
              saleNum: list.length
            })
          } else {
            that.setData({
              havesale: 'block',
              nonesale: 'none',
              saleList: list,
              saleNum: list.length
            })
          }
          that.setData({
            saleList: list
          })
          wx.stopPullDownRefresh()
        }
      })
    }else{
      if (!logincode) {
        console.log('用户未登录');
        that.setData({
          nickname: '未授权登录',
          avatar: 'https://gzpost.gcgn11525.com/dcoupon-v1/static/images/defaultAvatar.png'
        })
      }else{
        console.log(logincode)
        let avatar = wx.getStorageSync('useravatar');
        let nickname = wx.getStorageSync('usernickname');
        that.setData({
          avatar: avatar,
          nickname: nickname
        })
        wx.request({
          url: http + '/customer/coupon',
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
            let data = JSON.parse(res.data)
            let list = data.list;
            if (list == null) {
            } 
            else {
              for (let i = 0; i < list.length; i++) {
                list[i].starttime = list[i].starttime.substring(0, 10)
                list[i].endtime = list[i].endtime.substring(0, 10)
              }
              // 判断是否有优惠券进行显示
              if (data.list.length == 0) {
                that.setData({
                  coupon: 'none',
                  havecoupon: 'none',
                  nonecoupon: 'block',
                })
              } else {
                that.setData({
                  coupon: 'block',
                  havecoupon: 'block',
                  nonecoupon: 'none',
                })
              }
              let overdue = new Array();
              let used = new Array();
              let notuse = new Array();
              for (let j = 0; j < list.length; j++) {
                if (list[j].state == 3) {
                  overdue.push(list[j])
                }
                else if (list[j].state == 2) {
                  used.push(list[j])
                }
                else {
                  notuse.push(list[j])
                }
              }
              that.setData({
                allCoupon: data.list,
                notuseCoupon: notuse,
                overdueCoupon: overdue,
                usedCoupon: used
              })
            }
          }
        })
        
      }
     
    }
    wx.stopPullDownRefresh()
  },
  //滑动切换
  swiperTab: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },
  //点击切换
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  Tomenu: function (e) {
    wx.navigateTo({
      url: '../menu/menu',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //优惠券确认验证
  confirm_test,
  //核销优惠券请求
  ercode_request,
  //取消验证 
  cancel_ercodeRequest
})