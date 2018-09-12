//index.js
//获取应用实例
let clickState = true;
import { confirm_test, ercode_request, cancel_ercodeRequest}from "../../utils/testCode.js";
const app = getApp();
let http = app.globalData.httpUrl;
Page({
  data: {
    getstate:app.globalData.getstate,
    // 优惠券状态控制
    couponstate:'',
    // 商户微信号,手机号
    wxNum:'',
    shopphone:'',
    // 输入框的值
    shopPhoneValue:'',
    // 优惠券面值和限制
    preferentialamount:'',
    consumptionamount:'',
    // 已领取优惠券数量
    couponReceivedCount:'',
    // 开始时间和结束时间
    startTime:'',
    endTime:'',
    couponReceivedCount:'0',
    ruleArr:[
      '1.通过活动门店指定聚合二维码（邮政）付款，单次消费金额满100元，方可享受优惠；',
      '2.同一用户每周限领一张优惠券，名额有限，先到先得，用完为止；',
      '3.每周三上午10点开始领优惠券，周五当天到活动门店消费使用，逾期作废；',
      '4.用户到店消费，活动门店核销优惠券二维码后方可享受满100元减50元优惠；',
      '5.用户所得优惠部分不开发票，不可折现；',
      '6.本次活动不允许拆单，不支持其它支付方式；',
      "7.对活动规则如有疑问可咨询活动门店收银员或致电赣州邮政8356292。"

    ],
    "bottomlist": [
      {
        pic: '../../images/index.png',
        picactive: '../../images/indexSelected.png',
        pagePath: '../index/index',
        text: '首页',
        selected: true

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
    tcshow:'none',
    tcmessage:'none',
    // 内测密码弹窗
    nctc:'block',
    // 选择身份弹窗控制
    chooseuserTc:'none',
    // 商家登录信息填写弹窗
    shopInfoinput:'none',
    // 用户手机号
    userPhone:'',
    // 控制首页
    controlindex: getApp().globalData.username,
    scan_confirm: "none",
    couponCode: null //商家端用的二维码信息
  },
  onShareAppMessage: function () {
    return {
      title: '自定义转发标题',
      path: '/index/index'
    }
  },
  onLoad:function(){
    wx.hideTabBar()
    console.log("onload 执行了")
    let that = this;
    // let data = wx.getStorageSync('data');
    // that.setData({
    //   ...data
    // })
    let logincode = wx.getStorageSync('logincode');
    if(logincode){
      that.setData({
        chooseuserTc: 'none'
      })
    }else{
      that.setData({
        chooseuserTc: 'block'
      })
    }

    wx.request({
      url: http + '/customer/activity',
      data: {
        loginCode: logincode
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: 'GET',
      dataType: 'application/json',
      responseType: 'text',
      success: function (res) {
        console.log(res.data)
        let a = JSON.parse(res.data)
        console.log(typeof(a))
        that.setData({
          ...a
        })
        // wx.setStorageSync(key, data)

      },
      fail: function (req) {

      }

    })
  },
  // 选择用户
  Touser: function (){
    let that = this;
    getApp().globalData.onSet = !getApp().globalData.onSet;
    wx.login({
      success: function (res) {
        if (res) {
          wx.getUserInfo({
            withCredentials: true,
            success: function (infores) {
              let data = JSON.parse(infores.rawData);
              wx.setStorageSync('useravatar', data.avatarUrl);
              wx.setStorageSync('usernickname',data.nickName);
              wx.request({
                url: http+'/customer/login',
                data: {
                  code: res.code,
                  rawData: infores.rawData,
                  signature: infores.signature,
                  encrypteData: infores.encryptedData,
                  iv: infores.iv
                },
                header: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: 'GET',
                dataType: 'application/json',
                responseType: 'text',
                success: function (userRes) {
                  let data = JSON.parse(userRes.data);
                  let couponstate = data.couponReceiveState;
                  if (couponstate == 2) {
                    getApp().globalData.getstate = '已领完'
                  } else if (couponstate == 3) {
                    getApp().globalData.getstate = '已领过'
                    
                    console.log(getApp().globalData.getstate)
                  } else if (couponstate == 4) {
                    getApp().globalData.getstate = '活动结束'
                  } else {
                    getApp().globalData.getstate = '立即领取'
                  }
                  wx.setStorageSync('logincode',data.loginCode)
                  let setData = {
                    consumptionamount: data.consumptionamount,
                    preferentialamount: data.preferentialamount,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    couponReceivedCount: data.couponReceivedCount,
                    getstate: getApp().globalData.getstate
                  }
                  that.setData({
                    ...setData
                  })
                },
                fail: function (userRes) {                
                  
                },
                complete: function (userRes) { 
                },
              })
            },
            fail: function () {
              
            },
            complete:function()
            {
              that.setData({
                chooseuserTc: 'none'
              })
            }          
          })
        }
      }
    })
  },
  Toshop:function(){
    this.setData({
      chooseuserTc: 'none',
      shopInfoinput: 'block',
    })
  },
  // 商户取消开放信息
  cancelInfo:function(){
    this.setData({
      chooseuserTc: 'block',
      shopInfoinput: 'none',
    })

  },
  // 商户确认开放信息
  getShopInfo: function (){
    let that = this;
    var reg = /^1(3|4|5|7|8|9)\d{9}$/;
    let wxnumber = that.data.wxNum;
    let shopPhone = that.data.shopphone;
    if (wxnumber.length == 0 || shopPhone.length == 0 ){
      wx.showToast({
        title: '*微信号和手机号都不能为空',
        icon:'none'
      })
    } 
    if(!reg.test(shopPhone)){
      wx.showToast({
        title: '手机号输入错误,请重新输入',
        icon: 'none',
        duration: 1500,
        mask: false
      })
    }else{
      wx.login({
        success: function (res) {
          getApp().globalData.username = 'shop'
            that.setData({
              "bottomlist": [
                {
                  pic: '../../images/index.png',
                  picactive: '../../images/indexSelected.png',
                  pagePath: '../index/index',
                  text: '首页',
                  selected: true

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
                  selected: false
                }
              ]
            })
          if(res){
            wx.getUserInfo({
              withCredentials: true,
              success: function (infores) {
                console.log('商家信息' + typeof (infores.rawData))
                let data = JSON.parse(infores.rawData);
                wx.setStorageSync('shopavatar', data.avatarUrl);
                wx.setStorageSync('shopnickname', data.nickName);
                // 请求服务器的登录接口
                wx.request({
                  url: http +'/vendor/login',
                  data: {
                  code: res.code,
                  rawData: infores.rawData,
                  signature: infores.signature,
                  encrypteData: infores.encryptedData,
                  iv: infores.iv,
                  wxno:wxnumber,
                  phone:shopPhone
                },
                header: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: 'GET',
                dataType: 'application/json',
                responseType: 'text',
                success: function (userRes) {
                  let a = JSON.parse(userRes.data)
                  console.log(a)
                  console.log(a.status);
                  if(a.status == '4'){
                    setTimeout(function(){
                      wx.showToast({
                        title: '用户不存在',
                        icon:'none',
                        success:function(){
                          that.setData({
                            chooseuserTc: 'blcok' ,
                            shopInfoinput: 'none'                             
                          })
                        }
                      })
                    })
                  }else if(a.status == '5'){
                    setTimeout(function () {
                      wx.showToast({
                        title: '用户已在别处登录',
                        icon: 'none',
                        success: function () {
                          that.setData({
                            chooseuserTc: 'blcok',
                            shopInfoinput: 'none'
                          })
                        }
                      })
                    })
                  }else if(a.status == '2'){
                    setTimeout(function () {
                      wx.showToast({
                        title: '用户已在别处登录',
                        icon: 'none',
                        success: function () {
                          that.setData({
                            chooseuserTc: 'blcok',
                            shopInfoinput: 'none'
                          })
                        }
                      })
                    })
                  }else{
                    wx.setStorageSync('logincode', a.loginCode);
                    getApp().globalData.getstate = '商家不能领取'
                    that.setData({
                      chooseuserTc: 'none',
                      shopInfoinput: 'none',
                      preferentialamount: a.preferentialamount,
                      consumptionamount: a.consumptionamount,
                      couponReceivedCount: a.couponReceivedCount,
                      startTime: a.startTime,
                      endTime: a.endTime,
                      couponReceivedCount: a.couponReceivedCount,
                      getstate: getApp().globalData.getstate
                    })
                  }
                  // 成功授权登陆后将用户唯一标识存进storage中
                },
                fail: function (userRes) {
                console.log('失败了呢')
                },
                complete: function (userRes) { },
                })
              },
              fail:function(){
                console.log('失败了呢')
              }
            })
          }
        },
        fail:function(){
          that.setData({
            shopInfoinput: 'none'
          })
        }
      })
    }
  },
  // 商户输入微信号
  wxcomplete:function(e){
    let that = this;
    let weixinNum = e.detail.value
    that.setData({
      wxNum: weixinNum,
      
    })
  },
  // 商户输入手机号
  phonecomplete:function(e){
    let that = this;
    let phone = e.detail.value
    that.setData({
      shopphone: phone
    })
  },
  none:function(){
    console.log('不能领取状态');
  },
  //  点击立即领取按钮
  getCouponNow:function(){
    this.setData({
      tcshow:'block'
    })
  },
  // 用户手机输入
  watchphone: function (e) {
    console.log(e.detail.value)
    let phone = e.detail.value;
    this.setData({
      userPhone: phone
    })
  },
  // 确定输入手机号并领取
  sure:function(){
    if(clickState){
      clickState = false;
      let logincode = wx.getStorageSync('logincode')
      let that = this;
      let phone = that.data.userPhone;
      let reg = /^1(3|4|5|7|8|9)\d{9}$/;
      if (phone.length == 0) {
        wx.showToast({
          title: '手机号不能为空!',
          icon: 'none'
        })
      } else if (!reg.test(phone)) {
        wx.showToast({
          title: '手机号输入错误!',
          icon: 'none'
        })
      } else {
        if (logincode) {

          // 客户领取优惠券
          
            wx.request({
              url: http + '/customer/receive',
              data: {
                "loginCode": logincode,
                "phone": phone
              },
              header: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: 'GET',
              dataType: 'application/json',
              responseType: 'text',
              success: function (res) {
                let data = JSON.parse(res.data)
                console.log(data.status)
                if (data.status == '2') {
                  getApp().globalData.getstate = '领取失败'
                  wx.showToast({
                    title: '领取失败',
                    icon: 'none'
                  })
                  getApp().globalData.getstate = '领取失败'
                } else if (data.status == '4') {
                  getApp().globalData.getstate = '已领完'
                  wx.showToast({
                    title: '优惠券已领完',
                    icon: 'none'
                  })
                  getApp().globalData.getstate = '已领完'
                } else if (data.status == '5') {
                  wx.showToast({
                    title: '已经领取过优惠券哦',
                    icon: 'none'
                  })
                  console.log(getApp().globalData.getstate)
                }else if(data.status == '6'){
                  wx.showToast({
                    title: '活动已结束',
                    icon: 'none'
                  })
                  console.log(getApp().globalData.getstate)
                }
                else {
                  let data = JSON.parse(res.data);
                  wx.setStorageSync("couponData", data)
                  let couponid = data.receivedCoupon.serialno;
                  that.setData({
                    tcshow: "none",
                    getstate: "已领过"
                  })
                  wx.showToast({
                    title: '领取成功',
                    icon: 'success'
                  })
                  wx.switchTab({
                    url: '../my/my',
                  })
                }
              },
              fail: function () { },
              complete: function () { 
                clickState = true
               }
            })
          

        } else {
          wx.login({
            success: function (res) {
              if (res) {
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (infores) {
                    let info = JSON.parse(infores.rawData);
                    wx.setStorageSync('useravatar', info.avatarUrl)
                    wx.setStorageSync('usernickname', info.nickName)
                    wx.setStorageSync("getstate", '立即领取')
                    // 请求服务器的登录接口,客户登录并领取优惠券
                    wx.request({
                      url: http + "/customer/loginandreceive",
                      data: {
                        code: res.code,
                        rawData: infores.rawData,
                        signature: infores.signature,
                        encrypteData: infores.encryptedData,
                        iv: infores.iv,
                        phone: phone
                      },
                      header: {
                        "content-type": "application/x-www-from-urlencoded"
                      },
                      method: 'GET',
                      dataType: 'application/json',
                      responseType: 'text',
                      success: function (res) {
                        console.log(typeof (res.data))
                        let data = JSON.parse(res.data)
                        console.log(data.loginCode)
                        wx.setStorageSync('logincode', data.loginCode)
                        console.log(data)
                        if (data.status == '2') {
                          wx.showToast({
                            title: '领取失败',
                            icon: 'none'
                          })
                        } else if (data.status == '4') {
                          wx.showToast({
                            title: '优惠券已领完',
                            icon: 'none'
                          })
                          that.setData({
                            getstate: '已领完'
                          })
                          wx.setStorageSync("getstate", '已领完')
                        } else if (data.status == '5') {
                          wx.showToast({
                            title: '已经领取过优惠券哦',
                            icon: 'none'
                          })
                          that.setData({
                            getstate: '已领过'
                          })
                          wx.setStorageSync("getstate", '已领过')
                        } else if (data.status == '3') {
                          wx.showToast({
                            title: '用户未登陆',
                            icon: 'none'
                          })
                        }
                        else {
                          let data = JSON.parse(res.data);
                          wx.setStorageSync("couponData", data)
                          let couponid = data.receivedCoupon.serialno
                          that.setData({
                            getstate: "已领取",
                            tcshow: 'none'
                          })
                          wx.showToast({
                            title: '领取成功',
                            icon: 'success'
                          })
                          wx.switchTab({
                            url: '../my/my'
                          })
                        }
                      },
                      fail: function (userRes) {
                        console.log('获取数据失败了')
                      },
                      complete: function (userRes) {
                        clickState = true;
                      },
                    })
                  },
                  fail: function () {
                    console.log('失败了呢')
                  }
                })
              }
            }
          })
        }

      }
      
    }
   
  },
  cancel:function(){
    this.setData({
      tcshow:'none'
    })
  },
  onPullDownRefresh() {
    let code = wx.getStorageSync('logincode');
    // let getstate = wx.getStorageSync('getstate');
    let that = this;
    // that.setData({
    //   getstate:getstate
    // })
    wx.request({
      url: http + '/customer/activity',
      data: {
        loginCode: code
      },
      header: {
        "content-type": "application/x-www-from-urlencoded"
      },
      method: 'GET',
      dataType: 'application/json',
      responseType: 'text',
      success(userRes) {
        let data = JSON.parse(userRes.data);
        let couponstate = data.couponReceiveState;
        console.log(couponstate)
        // if (couponstate == 2) {
        //   that.setData({
        //     couponstate: '已领完'
        //   })
        // } else if (couponstate == 3) {
        //   that.setData({
        //     couponstate: '已领过'
        //   })
        // } else 
        if (couponstate == 4) {
          that.setData({
            couponstate: '活动结束'
          })
         } 
        //else {
        //   that.setData({
        //     couponstate: '立即领取'
        //   })
        // }
        // wx.setStorageSync('logincode', data.loginCode)
        // console.log(data);
        
        that.setData({
          consumptionamount: data.consumptionamount,
          preferentialamount: data.preferentialamount,
          startTime: data.startTime,
          endTime: data.endTime,
          couponReceivedCount: data.couponReceivedCount
        })
        
      }
    })
    wx.stopPullDownRefresh();
  },
  //优惠券确认验证
  confirm_test,
  //核销优惠券请求
  ercode_request,
  //取消验证 
  cancel_ercodeRequest
   // 内测版，是否是内部人员
  // checknc:function(e){
  //   let that = this;
  //   console.log(e.detail.value);
  //   wx.setStorageSync('ncpw', e.detail.value);
  //   let ncpw = wx.getStorageSync('ncpw');
  //   if(ncpw === 'yz123'){
  //     that.setData({
  //       nctc:'none'
  //     })
  //   }else{
  //     wx.showToast({
  //       title: '密码输入错误',
  //       icon:'none'
  //     })
  //   }
  // },



})
