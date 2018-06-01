// Zepto和FastClick的解决方案
// Zepto(function($){
//   FastClick.attach(document.body);
// });

var initData = {
  status: 200,  // 接口状态  500系统错误
  sugers: [{id: 1,value: 50}, {id: 2,value: 50}, {id: 3,value: 50}, {id: 4,value: 50}],  // 待收集糖果
  amount: '200',  // 本次收集的免息额度
  bFirstVisit: false,        // 是否首次进入页面
  bCantJoin: false,        // 是否*不能*参与本活动
  bExpire: false,          // 是否活动已过期
  activityStartDate: '2018-05-21',  // 活动开始时间
  activityEndDate: '2018-06-21',  // 活动结束时间
  bFreeLimitTaken: false,  // 是否已成功提取免息分期额度
  bFreeLimitUsed: false,   // 是否已成功使用免息分期额度
  bMaxAward: false,         // 额度已达上限
  collectedAmount: 500.00,  // 已提取免息分期额度
  collectedDesc1: '分期返还上述额度的3期手续费',  // 已提取免息分期额度描述1
  collectedDesc2: '任意期数500元以上分期自动使用',   // 已提取免息分期额度描述2
  collectedDesc3: '有效期至2018.6.15',   // 已提取免息分期额度描述3
  collectedLink: '/fenqi/',  // 已提取免息分期额度"去分期"链接
  usedAmount: 500.00,  // 已使用免息分期额度
  usedDesc1: '为您返还上述额度的3期手续费 12.6元',  // 已使用免息分期额度描述1
  usedDesc2: ' 将在2018.6.22前以刷卡金形式到账',   // 已使用免息分期额度描述2
  usedLink: '/record/',  // 已使用免息分期额度"分期记录"链接
  totalAmount: '300',  // 免息额度，不为0则有球
  awardUserList: [{  // 提取成功记录
    name: '陈奕迅',
    amount: '3000'
  },
  {
    name: '谢安琪',
    amount: '2000'
  },
  {
    name: '杨千嬅',
    amount: '2000'
  },
  {
    name: '古巨基',
    amount: '2000'
  },
  {
    name: '陈小春',
    amount: '2000'
  },
  {
    name: '刘德华',
    amount: '2000'
  }],
}

function checkDebugger(){  
  const d=new Date();  
  debugger;  
  const dur=Date.now()-d;  
  if(dur<5){  
      return false;  
  }else{  
      return true;  
  }  
}  
function breakDebugger(){  
    if(checkDebugger()){  
        breakDebugger();  
    }  
}
// breakDebugger();  // 阻止别人调试js

// 禁用代码中的所有 console.log 语句
var DEBUG = false;
if(!DEBUG){
 if(!window.console) window.console = {};
 var methods = ["log","debug","warn","info"];
 for(var i=0;i<methods.length;i++){
 console[methods[i]] = function(){};
 }
}      

$(function(){
  var ajaxStatus = true;//启用ajax请求

  var state = {
    canCollect: true,  // 收集按钮是否可点击，防止多次点击
    canTake: true,      // 提取按钮是否可点击
    gotAwardRecord: false,  // 是否已访问提取记录接口
  }

  init();

  // 点击有什么用？ 弹出使用教程
  $('#linkToGuide2').on('click', function(){
    $('.popup5').removeClass('show');
    $('.mask,.popup1').addClass('show');
  })

  // 弹出使用教程
  $('#linkToGuide').on('click', function(){
    $('.mask,.popup1').addClass('show');
  })

  // 弹出历史记录
  $('#linkToHistory').on('click', function(){
    $('.mask,.popup2').addClass('show');
    http({
      url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
      data: {
        ids: [1, 2, 3, 4]
      },
      data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
      success: function (data) {
        data = {
          status: 200,  // 接口状态  500系统错误
          list: [{
            date: '2018.3.8',
            amount: '300.00'
          },
          {
            date: '2018.3.8',
            amount: '300.00'
          }]
        };
        if(data.status == 200) {
          var s = '<li><span>日期</span><span>糖果额度</span></li>';
          for (var i=0; i< data.list.length; i++) {
            s += '<li><span>' + data.list[i].date + '</span><span>' + data.list[i].amount + '元</span></li>';
          }
          $('#candy-record').html(s);
          // $('.mask,.popup2').addClass('show');
        }
      }
    })
  })

  // 关闭弹窗
  $('.mask,.popup,.btn-close').on('click', function(e){
    $('.mask,.popup').removeClass('show');
    // 点击穿透的解决办法
    $('#app').css('pointer-events', 'none');
    setTimeout(function(){
        $('#app').css('pointer-events', 'auto');
    }, 400);
  })

  // 点击弹窗不关闭弹窗
  $('.popup .container').on('click', function(e){
    e.stopPropagation();  // 停止事件的传播,阻止事件冒泡到父元素,阻止任何父事件处理程序被执行
  })

  // 切换记录tab
  $('.tab-nav a').on('click', function (e) {
    if ($(this).hasClass('active')) {
      return;
    }
    if (!state.gotAwardRecord && $(this).data('cate') === 'award') {
      http({
        url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
        data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
        success: function (data) {
          data = {
            status: 200,  // 接口状态  500系统错误
            data: {
              date: '2018.3.8',
              amount: '300.00'
            }
          }
          if(data.status == 200) {
            state.gotAwardRecord = true;
            data = data.data
            var s = '<li><span>日期</span><span>糖果额度</span></li>';
            s += '<li><span>' + data.date + '</span><span>' + data.amount + '元</span></li>';
            $('#award-record').html(s);
          }
        }
      })

    }

    $('.tab-nav a').removeClass('active');
    $(this).addClass('active');
    var index = $(this).index();
    $('.tab-content .tab').removeClass('active').eq(index).addClass('active');
  })

  // 点击收集按钮
  $('.collect-box a').on('click', function(){
    if (!state.canCollect) {
      return;
    }
    if (initData.sugers.length <= 0) {
      showNotSuger();
      return;
    }
    state.canCollect = false;
    http({
      url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
      data: {
        ids: [1, 2, 3, 4]
      },
      data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
      success: function (data) {
        data = {
          status: 200,  // 接口状态, 500系统错误
          amount: '200'  // 本次收集的免息额度
        };
        if(data.status == 200) {
          var sugersCount = initData.sugers.length;
          $('.collect-box').addClass('disabled')
          state.canCollect = true;
          collectBalls(initData.sugers);
          initData.sugers = []; // 糖果数置0
          $('.quantity').text('0');
          setTimeout(function(){
            $('#collect-success-value').text('获得' + data.amount + '元免息额度');
            showCollectSuccess();
          }, (sugersCount + 1) * 500);
        }
      }
    })
  })

  // 点击提取按钮
  $('.btn-extract-balance').on('click', function(){
    if (!state.canTake) {
      return;
    }
    if (initData.bFreeLimitTaken) {
      showFreeLimitTaken();
      return;
    }
    if (initData.bFreeLimitUsed) {
      showFreeLimitUsed();
      return;
    }
    if (initData.totalAmount < 500) {
      showNotEnoughAward();
      return;
    }
    showConfirmTake();
  })

  // 确认提取按钮
  $('.linkToTake').on('click', function(){
    state.canTake = false;
    $('.mask,.popup5').removeClass('show');
    http({
      url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
      data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
      success: function (data) {
        data = {
          status: 200,  // 接口状态, 201：金额小于500，  500系统错误
          data: {
            amount: 500.00,  // 已提取免息分期额度
            desc1: '分期返还上述额度的3期手续费',  // 已提取免息分期额度描述1
            desc2: '任意期数500元以上分期自动使用',   // 已提取免息分期额度描述2
            desc3: '有效期至2018.6.15',   // 已提取免息分期额度描述3
            installmentLink: '/fenqi/',  // 已提取免息分期额度"去分期"链接
          }
        }
        resolveGetAward(data);
      }
    })
  })

  // 历史记录查看详情按钮
  $('.showFreeLimitTaken').on('click', function(){
    $('.mask,.popup2').removeClass('show');
    showFreeLimitTaken();
  })

  function getQueryString (name) {
   var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
   // /path?param1=123&param2=456 或 /path#hash?param1=123&param2=456
   var s = window.location.search || window.location.hash;
   s = s.substr(s.indexOf('?'));
   var r = s.substr(1).match(reg);
   if (r!=null) {
    return unescape(r[2]);
    }
    return null;
  }

  function getToken () {
    var s = window.location.search || window.location.hash;
    if (s !== '') {
      var bankCode = getQueryString('bankCode');
      var data = getQueryString('data');
      var sign = getQueryString('sign');
      var amount = getQueryString('amount');

      console.log('bankCode', bankCode);
      console.log('data', data);
      console.log('sign', sign);
      console.log('amount', amount);

      http({
        url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
        data: {
          bankCode: bankCode,
          data: data,
          sign: sign,
          amount: amount
        },
        data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
        success: function (data) {
          data = {
            status: 200,  // 接口状态  500系统错误
            token: 'fsdfsdfsdrewrdffdgfdgVJJHJHJGGjJGHFGfsd56f5d4=='
          };
          if(data.status == 200) {
            sessionStorage['act_token'] = data.token;
            
            replaceUrl();
          }
        }
      })
    }
  }

  function replaceUrl () {
    var indexOfSharp = window.location.href.indexOf('#');
    if (indexOfSharp > -1) {
      var replaceUrl = window.location.href.substr(0, indexOfSharp);
      console.log(replaceUrl);
      window.location.replace(replaceUrl);
    }
  }

  function init () {
    if (!sessionStorage['act_token']) {
      getToken();
    } else {
      replaceUrl();  // 有token，刷新为无参数页面
    }

    http({
      url: 'https://api3.biyabi.com/api/Page/App/HomePageShowV3',
      data: JSON.stringify({"pageIndex":1,"apiVersion":1,"app":{"appName":"比呀比H5","appId":26,"appVersion":"2.0.0","appVersionCode":1},"user":{"userId":"0","appPwd":""}}),
      success: function (data) {
        data = initData;  // 本地测试数据，调试删
        initData = data;
        resolveCandyInitParam(data);
      }
    })
  }

  function resolveCandyInitParam (data) {
    if(data.status == 200) {
      var balls = data.totalAmount == 0 ? 0 : 10;
      initBalls(balls, BallsFalledCallBack);
      $('.quantity').text(data.sugers.length);
      $('.money').text(data.totalAmount);

      var startDate = data.activityStartDate.split('-');  // '2018-05-21',  // 活动开始时间
      startDate.shift();
      startDate = startDate.join('.');
      var endDate = data.activityEndDate.split('-');  // '2018-06-21',  // 活动结束时间
      endDate.shift();
      endDate = endDate.join('.');
      $('#activity-date').text(startDate + '-' + endDate);
      // 免息额度滚动
      $('.money').each(function(){
        $('.money').prop('Counter',0).animate({
          Counter: $('.money').text()
        },{
          duration: 1500,
          easing: 'swing',
          step: function (now){
            $('.money').text(Math.ceil(now));
          }
        });
      });
      // 收集面板升起，按钮跳动
      setTimeout(function(){
        $('.collect-box').addClass('active');
      },300);
      // 待收集糖果=0，收集按钮升起后，按钮不跳动且置灰
      if (data.sugers.length == 0) {
        $('.collect-box').addClass('disabled')
      }
      // 待收集糖果=5，已达上限
      if (data.sugers.length >= 5) {
        showLimit();
      }
      if (data.bMaxAward) {
        showMaxAward();
      }
      if (data.bFirstVisit) {
        showFirstVisit();
      }
      if (data.bFreeLimitTaken) {
        $('.btn-extract-balance').addClass('taken');
        $('#collectedAmount').text(data.collectedAmount + '元');
        $('#collectedDesc1').text(data.collectedDesc1);
        $('#collectedDesc2').text(data.collectedDesc2);
        $('#collectedDesc3').text(data.collectedDesc3);
        $('#collectedLink').attr('href', data.collectedLink);
        showFreeLimitTaken();
      }
      if (data.bFreeLimitUsed) {
        $('.btn-extract-balance').addClass('used');
        $('#usedAmount').text(data.usedAmount + '元');
        $('#usedDesc1').text(data.usedDesc1);
        $('#usedDesc2').text(data.usedDesc2);
        $('#usedLink').attr('href', data.usedLink);
        showFreeLimitUsed();
      }
      if (data.bCantJoin) {
        showCantJoin();
      }
      if (data.bExpire) {
        showExpire();
      }
      var sal = '';
      var al = initData.awardUserList;
      for (var i=0; i< al.length; i++) {
        sal += '<li>恭喜 ' + al[i].name + ' 成功提取价值 ' + al[i].amount + '元 糖果</li>'
      }
      $('#scroll-begin').html(sal);
      ScrollImgLeft();
    }
  }

  function resolveGetAward (data) {
    if(data.status == 200) {
      data = data.data;
      state.canTake = true;
      $('.hole,.wall').addClass('show');
      $('#collectedAmount').text(data.amount + '元');
      $('#collectedDesc1').text(data.desc1);
      $('#collectedDesc2').text(data.desc2);
      $('#collectedDesc3').text(data.desc3);
      $('#collectedLink').attr('href', data.installmentLink);
      removeBottomWall();
      // 球落完的回调函数 BallsFalledCallBack
    }
  }

  function showPopup (removeActiveClassSelector, addActiveClassSelector, addShowClassSelector) {
    $(removeActiveClassSelector).removeClass('active');
    $(addActiveClassSelector).addClass('active');
    $(addShowClassSelector).addClass('show');
  }

  function showFirstVisit () {
    showPopup ('.popup5 .guide-content', '.popup5 .content1', '.mask,.popup5');
  }

  function showLimit () {
    showPopup ('.popup4 .guide-content', '.popup4 .content6', '.mask,.popup4');
  }

  function showConfirmTake () {
    showPopup ('.popup5 .guide-content', '.popup5 .content2', '.mask,.popup5');
  }

  function showMaxAward () {
    showPopup ('.popup5 .guide-content', '.popup5 .content3', '.mask,.popup5');
  }

  function showFreeLimitUsed () {
    showPopup ('.popup3 .guide-content', '.popup3 .content1', '.mask,.popup3');
  }

  function showFreeLimitTaken () {
    showPopup ('.popup3 .guide-content', '.popup3 .content2', '.mask,.popup3');
  }

  function showCantJoin () {
    showPopup ('.popup4 .guide-content', '.popup4 .content1', '.mask,.popup4');
  }

  function showExpire () {
    showPopup ('.popup4 .guide-content', '.popup4 .content2', '.mask,.popup4');
  }

  function showCollectSuccess () {
    showPopup ('.popup4 .guide-content', '.popup4 .content3', '.mask,.popup4');
  }

  function showNotSuger () {
    showPopup ('.popup4 .guide-content', '.popup4 .content4', '.mask,.popup4');
  }

  function showNotEnoughAward () {
    showPopup ('.popup4 .guide-content', '.popup4 .content5', '.mask,.popup4');
  }

  // 提取小球掉落动画完成回调
  function BallsFalledCallBack () {
    initData.bFreeLimitTaken = true;
    $('.btn-extract-balance').addClass('taken');
    $('.hole,.wall').removeClass('show');
    showFreeLimitTaken();
  }

  function http (options) {
    var url = options.url;//请求地址
    var data = options.data || {}; // 请求数据
    var type = options.type || 'post';//请求类型
    var dataType = options.dataType || 'json';//接收数据类型
    var async = options.async || true;//异步请求
    var alone = options.alone || false;//独立提交（一次有效的提交）
    var cache = options.cache || false;//浏览器历史缓存
    var success = options.success || function (data) {
      /*console.log('请求成功');*/
      setTimeout(function () {
        // layer.msg(data.msg);//通过layer插件来进行提示信息
      },500);
      if(data.code){//服务器处理成功
        // setTimeout(function () {
        //   if(data.url){
        //     // location.replace(data.url);
        //   }else{
        //     // location.reload(true);
        //   }
        // },1500);
      }else{//服务器处理失败
        if(alone){//改变ajax提交状态
          ajaxStatus = true;
        }
      }
    };

    var error = options.error || function (data) {
      /*console.error('请求成功失败');*/
      /*data.code;//错误状态吗*/
      // layer.closeAll('loading');
      setTimeout(function () {
        if(data.code == 404){
          // layer.msg('请求失败，请求未找到');
        }else if(data.code == 503){
          // layer.msg('请求失败，服务器内部错误');
        }else {
          // layer.msg('请求失败,网络连接超时');
        }
        ajaxStatus = true;
      },500);
    };
    /*判断是否可以发送请求*/
    if(!ajaxStatus){
        return false;
    }
    ajaxStatus = false;//禁用ajax请求
    /*正常情况下1秒后可以再次多个异步请求，为true时只可以有一次有效请求（例如添加数据）*/
    if(!alone){
      setTimeout(function () {
        ajaxStatus = true;
      },1000);
    }
    $.ajax({
      'url': url,
      'data': data,
      'type': type,
      'dataType': dataType,
      'contentType': 'application/json',
      'async': async,
      'success': success,
      'error': error,
      'jsonpCallback': 'jsonp' + (new Date()).valueOf().toString().substr(-4),
      'beforeSend': function () {
        // layer.msg('加载中', {通过layer插件来进行提示正在加载
        //     icon: 16,
        //     shade: 0.01
        // });
      },
    });
  }

})

!(function (w) {
  //文字横向滚动
  function ScrollImgLeft () {
    var speed=50
      ,int = null
      ,scroll_begin = document.getElementById("scroll-begin")
      ,scroll_end = document.getElementById("scroll-end")
      ,scroll_box = document.getElementById("scroll-box");
    scroll_end.innerHTML = scroll_begin.innerHTML;
    function Marquee () {
      if(scroll_end.offsetWidth - scroll_box.scrollLeft <= 0) {
        scroll_box.scrollLeft -= scroll_begin.offsetWidth;
      }
      else {
        scroll_box.scrollLeft++;
      }
    }
    int = setInterval(Marquee,speed);
  }
  w.ScrollImgLeft = ScrollImgLeft;
})(window)
