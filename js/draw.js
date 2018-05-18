(function(window){
  /**
   * [Point Class]
   * @param {[type]} x [x坐标]
   * @param {[type]} y [y坐标]
   */
  var Point = function (x, y) {
    this.x = x;
    this.y = y;
  }
  var canvas = null;
  var ctx = null;
  var oldWidth = 0;
  var oldHeight = 0;
  var canvasWidth = 0;
  var canvasHeight = 0;
  var ratio = 1;
  var gravity = {
    x: 0,
    y: 10
  };
  var linearVelocity = -6.6;  // 小球水平速度   
  var O1 = new Point(220, 120);

  var _ = function (options) {
    var options = options || {};
    this.version = '0.0.1';
    this.name = 'draw';
    this.el = options.canvasId || 'canvas-main';
    this.radius = options.radius || 25;
  }
  _.prototype.init = function () {
    var devicePixelRatio = window.devicePixelRatio || 1;
    canvas = document.getElementById(this.el);
    ctx = canvas.getContext('2d');
    var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;
    ratio = devicePixelRatio / backingStoreRatio;
    oldWidth = parseInt(window.getComputedStyle(canvas).width);
    oldHeight = parseInt(window.getComputedStyle(canvas).height);
    canvas.width = canvasWidth = oldWidth * ratio;
    canvas.height = canvasHeight = oldHeight * ratio;
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';

    O1 = new Point(oldWidth, O1.y);

    this.step();
  }
  _.prototype.step = function (cnt) {
    var timeStep = 1.0 / 60;
    var iteration = 1;
    // world.Step(timeStep, iteration);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.update();
    setTimeout('this.draw.step(' + (cnt || 0) + ')', 10);
  }

  var time = 0;
  _.prototype.update = function () {
    time += 10/1000;
    ctx.fillStyle = '#fe5251';
    ctx.beginPath();
    var x = O1.x;
    var y = O1.y;
    x = x + linearVelocity * time;
    if (y < canvasHeight) {
      y = y + 1/2* gravity.y * time * time;
    } else {
      x = oldWidth
      y = 120;
      time = 0;
    }
    // console.log(y)
    O1 = new Point(x, y);
    // context.arc(x,y,r,sAngle,eAngle,counterclockwise);
    // 中心，半径，起始角，结束角，是否逆时针绘图
    ctx.arc(O1.x * ratio, O1.y * ratio, this.radius * ratio, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();

  }

  window.draw = _;
})(window)

draw = new draw()
draw.init();
