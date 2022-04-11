import { wxLogin, appid, wxRequest, domain } from '../../utils/util.js';
Page({
  data: {
    domain
  },

  onLoad: function (options) {
    let pages = getCurrentPages();//当前页面栈
    let prevPage = pages[pages.length - 2];//上一页面
    const data = prevPage.data;
    this.setData({
      ...data
    })
  },

  changeAddress: function (e) {
    this.setData({
      delivery: e.detail.value
    })
  },

  createScore: function (e) {
    wxLogin().then(({ authorization, info }) => {
      const { address, site } = this.data.address;
      wxRequest({
        url: `${domain}/shop/scores`,
        header: { authorization, aid: info.aid },
        method: "POST",
        data: { ...e.detail.value, address, site, subAppId: appid },
      }).then((data) => {
        wx.requestPayment(
          {
            ...data.order, package: data.order.packageValue,
            'success': (res) => {
              setTimeout(() => {
                wx.reLaunch({
                  url: `/pages/score/detail?id=${data.score.id}`,
                })
              }, 300);
            },
            'fail': (res) => {
              wx.reLaunch({
                url: `/pages/score/detail?id=${data.score.id}`,
              })
            }
          })
      })
    })
  },
})
