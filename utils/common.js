module.exports = {
  monitor: { timer: null, url: null, data: null },//ajax监听数据
  ajax: function (url, data, type, fn) { //ajax封装
    let that = this, app = getApp();
    if (that.monitor.timer != null && that.monitor.url == url && JSON.stringify(that.monitor.data) == JSON.stringify(data)) {
      clearTimeout(that.monitor.timer);
      that.monitor.timer = null;
    }
    that.monitor.url = url;
    that.monitor.data = data;
    var f = {};
    // console.log(data);
    typeof fn == 'function' ? f.success = fn : f = fn;
    type = type || 'POST';//请求类型
    that.monitor.timer = setTimeout(function () {
      wx.showNavigationBarLoading();
      //wx.showLoading({title:'加载中…',mask:true});
      wx.request({
        url: app.globalData.hosturl + url,
        method: type,
        data: data,
        dataType: 'json',
        header: that.phpsession(),
        complete: function () {
          that.monitor.timer = null;
          f.com && f.com();
          setTimeout(function () {
            wx.hideNavigationBarLoading(); //停止加载
            wx.stopPullDownRefresh(); //停止下拉刷新
          }, 500);
        },
        success: function (c_b) {
          wx.hideLoading();
          if (c_b.data.code == 1) {  //成功
            f.success && f.success(c_b);
          } else {   //异常
            f.warn && f.warn(c_b);
          }
        },
        fail: function (err) {      //请求失败
          wx.hideLoading();
          f.error && f.error();
          wx.showToast({
            title: "网络繁忙，请稍后再试",
            image: '../../images/error2.png',
            duration: 2000
          })
        }
      });
    }, 200)
  },
  timesToDate: function (times, type, s) {       //时间戳转换日期
    // 只接受js或php的时间戳
    // type说明   带中文为大写 不带中文小写
    //      bool为false的值/不传 返回yyyy-mm-dd
    //      type传'NYR' 返回yyyy年mm月dd日
    //      'ymdhm' ==>  yyyy-mm-dd hh：min
    //      'YR'   ==>  m月d日
    //      'NYRSF'   ==>   yyyy年m月d日 凌晨/上午/中午/下午/傍晚/晚上 h点
    s = s ? s : '-';
    var len = (times + '').length;
    if (typeof times == 'number' && (len == 13 || len == 10)) {
      if (len == 10) {            //php的时间戳
        times *= 1000;
      }
      var t = new Date(times);
      var now_t = new Date().getTime();
      var y = t.getFullYear();
      var _m = t.getMonth() + 1;
      var _d = t.getDate();
      var _h = t.getHours();
      var _min = t.getMinutes();
      var m = Fun.add_length(_m);
      var d = Fun.add_length(_d);
      var h = Fun.add_length(_h);
      var min = Fun.add_length(_min);
      switch (type) {
        case 'NYR': return y + '年' + m + '月' + d + '日';
        case 'YR': return parseInt(m) + '月' + parseInt(d) + '日';
        case 'ymdhm': return y + s + m + s + d + ' ' + h + ':' + min;
        case 'md': return m + s + d;
        case 'SJhm':
          var ts = now_t - times;
          if (ts <= 300000) {
            return '刚刚';
          } else if (ts >= 300000 && ts < 3600000) {
            return parseInt(ts / 60000) + '分钟前';
          } else if (ts >= 3600000 && ts < 86400000) {
            return parseInt(ts / 3600000) + '小时前';
          } else if (ts >= 86400000 && ts < 172800000) {
            return '昨天' + ' ' + _h + ':' + min;
          } else if (ts >= 172800000 && ts < 259200000) {
            return '前天' + ' ' + _h + ':' + min;
          } else if (ts >= 259200000) {
            if (y == new Date().getFullYear()) {
              return m + '.' + d + ' ' + _h + ':' + min;
            } else {
              return new Date().getFullYear() + m + '.' + d + ' ' + _h + ':' + min;
            }
          }
          break;
        case 'NYRSF':
          var dian = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
          var tt = _h > 12 ? _h - 12 : _h;
          var am = _h < 6 ? "凌晨" :
            _h < 9 ? "早上" :
              _h < 12 ? "上午" :
                _h < 15 ? "中午" :
                  _h < 18 ? "下午" :
                    _h < 20 ? "傍晚" :
                      "晚上";
          return y + "年" + _m + "月" + _d + "日 " + am + dian[tt] + "点";
        default: return y + s + m + s + d;
      }
    } else {
      return times;
    }
  }
}