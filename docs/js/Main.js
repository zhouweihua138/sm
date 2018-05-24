
var ctx;
var delta = [0, 0];
var stage = [window.screenX, window.screenY, window.innerWidth, window.innerHeight];

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
var scale = stage[2] / 750; // 屏幕宽度和设计稿的宽度比例，比如高度700，则对应 stage[2] / 750 * 700;  * 设计稿底部挡板的位置
var radius = scale * 130; // 圆形容器半径

var colors = ["./images/ball_blue.png", "./images/ball_green.png", "./images/ball_red.png", "./images/ball_yellow.png"];
var ownerColors = [];  // 记录已有球的颜色

getBrowserDimensions();

var worldAABB, world;
var worldAABB1, world1; //喷球物理世界
var walls = [];
var bottomWall;
var wall_thickness = 0.1;
var wallsSetted = false;
var bodies, elements, text;
var bodies1, elements1; //存储喷球
var createMode = true;
var destroyMode = false;
var isMouseDown = false;
var mouseJoint;
var mouse = {
  x: 0,
  y: 0
};
var gravity = {
  x: 0,
  y: 1
};
var gravity1 = {
  x: 0,
  y: 1
};
var linearVelocity = -300; // 小球水平速度
var PI2 = Math.PI * 2;
var timeOfLastTouch = 0;
var tempCallBack;
var canFall = false;
var animateCount = 0; // 动画完成次数，判断回调的参数
var ballIndex = 0;    // 点击收集，当前掉落小球索引

init();
step();

function init() {
  worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-200, -200);
  worldAABB.maxVertex.Set(window.innerWidth + 200, window.innerHeight + 200);
  world = new b2World(worldAABB, new b2Vec2(0, 0), true);

  worldAABB1 = new b2AABB();
  worldAABB1.minVertex.Set(-200, -200);
  worldAABB1.maxVertex.Set(window.innerWidth + 200, window.innerHeight + 200);
  world1 = new b2World(worldAABB1, new b2Vec2(0, 0), true);

  setWalls();
  reset();
}

function reset() {
  var i;
  if (bodies) {
    for (i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      world.DestroyBody(body);
      body = null;
    }
  }

  bodies = [];
  elements = [];

  if (bodies1) {
    for (i = 0; i < bodies1.length; i++) {
      var body = bodies1[i];
      world1.DestroyBody(body);
      body = null;
    }
  }

  bodies1 = [];
  elements1 = [];
}

function initBalls(balls, callBack) {
  var i;
  for (i = 0; i < balls; i++) {
    createBall(scale * (375 - 100), scale * (510 - 100), false);
  }
  canFall = true;
  tempCallBack = callBack;
}

function collectBalls(balls) {
  var number = balls.length;
  var interval2 = window.setInterval((function() {
    createBall(stage[2] - 20, scale * 238, true); // scale
    // var totalAmount = $('.money').text() * 1;
    // $('.money').text(totalAmount + balls[ballIndex].value);
    var totalAmount = initData.totalAmount * 1;
    initData.totalAmount = totalAmount + balls[ballIndex].value;
    $('.money').text(initData.totalAmount);
    ballIndex++
    $('.money').each(function(){
      $('.money').prop('Counter', totalAmount).animate({
        Counter: $('.money').text()
      },{
        duration: 400,
        easing: 'swing',
        step: function (now){
          $('.money').text(Math.ceil(now));
        }
      });
    });
    
  }), 500);
  setTimeout(function() {
    window.clearInterval(interval2);
    ballIndex = 0;
  }, number * 500 + 100);  // +100是因为苹果上的interval和setTimeout同时执行了，导致比电脑端少一个球掉落
}

function removeBottomWall() {
  destroyMode = true;
  // 需要先判断是否还有 bottomWall
  world.DestroyBody(bottomWall);
  bottomWall = null;
  // gravity.y = 1;  // 让小球下落的快一点
  flyball(tempCallBack)
}

function flyball(cb) {
  var ctn = 0;
  var number = bodies.length;
  var inter = 150;
  var interval2 = window.setInterval((function() {
    var random = Math.random() * 14;
    var speedx = 7 - random * 70 * (ctn % 2 == 0 ? 1 : -1);
    var speedy = -300;
    if (random < 5) {  // 靠中间的球设置向上的速度大一点
      speedy = -900;
    }
    createBall(centerX + parseInt(Math.random() * 10), scale * 824, speedx, speedy, 1, ctn); // scale
    ctn += 1
  }), inter);
  setTimeout(function() {
    window.clearInterval(interval2);
    animateCount++
    if(animateCount == 2) { // 执行了2次动画，也就是掉落和喷出都完成
      cb && typeof(cb) == 'function' && cb();
    }
  }, number * inter);
}

/**
 * @param  {[int]} x      [description]
 * @param  {[int]} y      [description]
 * @param  {[int/bool]} speed  [当不是喷出时是bool表示有没速度，喷出时为 x轴方向的速度]
 * @param  {[int]} speedy [y轴方向速度]
 * @param  {[int]} which  [为1时表示是喷出的球]
 * @param  {[int]} sort   [喷出时的球用已有球的颜色]
 */
function createBall(x, y, speed, speedy, which, sort) {
  var size = scale * 50 * 2;

  var img = document.createElement('img');
  if (which != 1) {
    ownerColors.push(Math.random() * colors.length >> 0);
    img.src = colors[Math.random() * colors.length >> 0];
  } else {
    img.src = colors[ownerColors[sort]];
  }
  img.style.width = size + 'px';
  img.style.height = size + 'px';
  img.style.position = 'absolute';
  img.style.left = x + 'px';
  img.style.top = y + 'px';
  img.style.cursor = "default";

  var b2body = new b2BodyDef();
  b2body.type = b2Body.b2_dynamicBody;
  var circle = new b2CircleDef();
  circle.radius = size >> 1;
  circle.density = 1;
  circle.friction = 0.3;
  circle.restitution = 0.3;
  b2body.AddShape(circle);
  if (which == 1) {
    canvas1.appendChild(img);
    elements1.push(img);
  } else {
    canvas.appendChild(img);
    elements.push(img);
  }
  b2body.userData = {
    element: img
  };

  b2body.position.Set(x, y);
  if (which == 1) {
    b2body.linearVelocity.Set(speed, speedy);
    bodies1.push(world1.CreateBody(b2body));
  } else {
    if (speed) {
      b2body.linearVelocity.Set(linearVelocity, 0);
    }
    bodies.push(world.CreateBody(b2body));
  }
}

function step(cnt) {
  var stepping = false;
  var timeStep = 1.0 / 60;
  var iteration = 1;
  world.Step(timeStep, iteration);
  world1.Step(timeStep, iteration);

  if (getBrowserDimensions()) {
    setWalls();
  }

  delta[0] += (0 - delta[0]) * .5;
  delta[1] += (0 - delta[1]) * .5;
  // console.log(delta)

  world.m_gravity.x = gravity.x * 350 + delta[0];
  world.m_gravity.y = gravity.y * 350 + delta[1];

  world1.m_gravity.x = gravity1.x * 350 + delta[0];
  world1.m_gravity.y = gravity1.y * 350 + delta[1];

  setTimeout('step(' + (cnt || 0) + ')', 10);

  for (i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var element = elements[i];
    element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
    if ((body.m_position0.y - (element.height >> 1)) < stage[2] / 750 * 712) {
      element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';
    } else {
      element.style.display = 'none';
    }
  }

  for (i = 0; i < bodies1.length; i++) {
    var body = bodies1[i];
    var element = elements1[i];
    element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
    element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';
  }
  if (elements.length > 0 && canFall) {
    var hasCallBack = true;
    for (var j = 0; j < elements.length; j++) {
      var element = elements[j];
      if (element.style.display != 'none') {
        hasCallBack = false;
      }
    }
    if (hasCallBack) {
      canFall = false;
      animateCount++
      if(animateCount == 2) { // 执行了2次动画，也就是掉落和喷出都完成
        typeof(tempCallBack) == 'function' && tempCallBack();
      }
    }
  }
}

// .. BOX2D UTILS
function createBox(world, x, y, width, height, fixed) {
  if (typeof(fixed) == 'undefined') {
    fixed = true;
  }

  var boxSd = new b2BoxDef();

  if (!fixed) {
    boxSd.density = 1.0;
  }

  boxSd.extents.Set(width, height);
  var boxBd = new b2BodyDef();
  boxBd.AddShape(boxSd);
  boxBd.position.Set(x, y);
  return world.CreateBody(boxBd);
}

function setWalls() {
  if (wallsSetted) {
    world.DestroyBody(bottomWall);
    bottomWall = null;
    for (var i = 0; i < walls.length; i++) {
      world.DestroyBody(walls[i]);
      walls[i] = null;
    }
  }

  if (!destroyMode) {
    // 底部挡板的位置
    var bottomWallY = stage[2] / 750 * 700; // 屏幕宽度和设计稿的宽度比例 * 设计稿底部挡板的位置
    bottomWall = createBox(world, stage[2] / 2, bottomWallY, stage[2], wall_thickness);
  }
  walls[0] = createBox(world, stage[2], stage[3] / 2, wall_thickness, stage[3]);
  createCountPoint(360);
  createPipeline(360, 200 * scale * 2);
  createPipeline2(360, 138 * scale * 2);
  wallsSetted = true;
}

function createCountPoint(count) {
  var a = 360 / count;
  var n = 0;
  for (n; n < count; n++) {
    var hudu = (2 * Math.PI / 360) * a * n;
    var radius;
    if ((n < 60 && n >= 30) || (n < 330 && n >= 300)) {
      radius = scale * 120 * 2; //scale * 
    } else {
      radius = scale * 130 * 2;
    }
    var X = centerX + Math.sin(hudu) * radius;
    // 球形容器中心点
    var bottomWallY = stage[2] / 750 * 600; // 屏幕宽度和设计稿的宽度比例 * 设计稿球形容器中心点的位置
    var Y = bottomWallY + Math.cos(hudu) * radius - 20;
    if ((n > 30 && n < 140) || (n < 330 && n > 170)) {
      createPoint(X, Y);
    }
  }
}

function createPipeline(count, radius) {
  var a = 360 / count;
  var n = 0;
  for (n; n < count; n++) {
    var hudu = (2 * Math.PI / 360) * a * n;
    var X = stage[2] + Math.sin(hudu) * radius - 18;
    var bottomWallY = stage[2] / 750 * 600;
    var Y = bottomWallY + Math.cos(hudu) * radius - 12;
    if (n < 230 && n > 180) {
      createPoint(X, Y);
    }
  }
}

function createPipeline2(count, radius) {
  var a = 360 / count;
  var n = 0;
  for (n; n < count; n++) {
    var hudu = (2 * Math.PI / 360) * a * n;
    var X = stage[2] + Math.sin(hudu) * radius - scale * 12 * 2;
    var bottomWallY = stage[2] / 750 * 600;
    var Y = bottomWallY + Math.cos(hudu) * radius - scale * 16 * 2;
    if (n < 223 && n > 180) {
      createPoint(X, Y);
    }
  }
}

function createPoint(x, y) {
  walls[walls.length + 1] = createBox(world, x, y, 1, 1);
}

// BROWSER DIMENSIONS
function getBrowserDimensions() {
  var changed = false;
  if (stage[0] != window.screenX) {
    delta[0] = (window.screenX - stage[0]) * 50;
    stage[0] = window.screenX;
    changed = true;
  }

  if (stage[1] != window.screenY) {
    delta[1] = (window.screenY - stage[1]) * 50;
    stage[1] = window.screenY;
    changed = true;
  }

  if (stage[2] != window.innerWidth) {
    stage[2] = window.innerWidth;
    changed = true;
  }

  if (stage[3] != window.innerHeight) {
    stage[3] = window.innerHeight;
    changed = true;
  }

  return changed;
}
