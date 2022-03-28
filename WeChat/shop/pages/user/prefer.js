import { domain, wxLogin, wxRequest, size } from '../../utils/util.js';
Page({

  data: {
    domain
  },

  onLoad: function (options) {
    wxLogin().then(({ authorization, info }) => {
      wxRequest({
        url: `${domain}/shop/prefers?page=0&size=${size}`,
        header: { authorization, aid: info.aid },
      }).then(({ content, last, number }) => {
        this.setData({
          prefers: content, last, number
        });
      });
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wxLogin().then(({ authorization, info }) => {
      wxRequest({
        url: `${domain}/shop/prefers?page=0&size=${size}`,
        header: { authorization, aid: info.aid },
      }).then(({ content, last, number }) => {
        this.setData({
          prefers: content, last, number
        });
        wx.stopPullDownRefresh()
      })
    })
  },

  addCount: function (e) {
    const id = e.currentTarget.id;
    this.updateCart(id, 1);
  },

  subtractCount: function (e) {
    const id = e.currentTarget.id;
    this.updateCart(id, -1);
  },

  updateCart: function (index, count) {
    wxLogin().then(({ authorization, info }) => {
      let product = this.data.prefers[index];
      if (product.cartId) {
        wxRequest({
          url: `${domain}/shop/carts`,
          method: 'POST',
          header: { authorization, aid: info.aid },
          data: { id: product.cartId, storeId: product.storeId, productId: product.id, num: product.num + count },
        }).then((data) => {
          this.setData({
            [`prefers[${index}].num`]: data.num,
          });
        });
      } else {
        wxRequest({
          url: `${domain}/shop/carts`,
          method: 'POST',
          header: { authorization, aid: info.aid },
          data: { storeId: product.storeId, productId: product.id, num: 1 },
        }).then((data) => {
          this.setData({
            [`prefers[${index}].num`]: data.num,
            [`prefers[${index}].cartId`]: data.id,
          });
        });
      }
    })
  },

})
