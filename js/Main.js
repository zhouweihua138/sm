// var canvas;
var ctx;
var delta = [0, 0];
var stage = [window.screenX, window.screenY, window.innerWidth, window.innerHeight];

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
var scale = stage[2] / 750; // 屏幕宽度和设计稿的宽度比例，比如高度700，则对应 stage[2] / 750 * 700;  * 设计稿底部挡板的位置
var radius = 130;

getBrowserDimensions();

var colors = ["#62cef8", "#fe5251", "#3ccd40", "#ffb517"];
var worldAABB, world;
var walls = [];
var bottomWall;
var wall_thickness = 1;
var wallsSetted = false;
var bodies, elements, text;
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
var linearVelocity = -300;  // 小球水平速度
var PI2 = Math.PI * 2;
var timeOfLastTouch = 0;

init();
step();

function init() {
  // canvas = document.getElementById('canvas');

  var canvasElm = document.getElementById('canvas-main');
  ctx = canvasElm.getContext('2d');
  canvasWidth = parseInt(canvasElm.width);
  canvasHeight = parseInt(canvasElm.height);
  canvasTop = parseInt(canvasElm.style.top);
  canvasLeft = parseInt(canvasElm.style.left);

  worldAABB = new b2AABB();
  worldAABB.minVertex.Set(-200, -200);
  worldAABB.maxVertex.Set(window.innerWidth + 200, window.innerHeight + 200);

  world = new b2World(worldAABB, new b2Vec2(0, 0), true);

  setWalls();
  reset();
}

function reset() {
  var i;
  if (bodies) {
    for (i = 0; i < bodies.length; i++) {
      var body = bodies[i]
      // canvas.removeChild(body.GetUserData().element);
      world.DestroyBody(body);
      body = null;
    }
  }

  bodies = [];
  elements = [];
}

function initBalls(number) {
  var i;
  for (i = 0; i < number; i++) {
    createBall(centerX - 100, centerY - 100, false);
  }
}

function collectBalls(balls) {
  var number = balls.length;
  var interval2 = window.setInterval((function() {
    // createBall(stage[2], centerY - 210, true);  // scale
    createBall(stage[2], scale * 238, true);  // scale
  }), 500);
  setTimeout(function() {
    window.clearInterval(interval2);
  }, number * 500);
}

function removeBottomWall() {
  destroyMode = true;
  // 需要先判断是否还有 bottomWall
  world.DestroyBody(bottomWall);
  bottomWall = null;
}

function createBall(x, y, speed) {
  var size = 50;
  var b2body = new b2BodyDef();
  var circle = new b2CircleDef();
  circle.radius = size >> 1;
  circle.density = 1;
  circle.friction = 0.3;
  circle.restitution = 0.3;
  b2body.AddShape(circle);
  // b2body.userData = {element: element};

  b2body.userData = {
    // element: img
  };

  b2body.position.Set(x, y);
  if (speed) {
    b2body.linearVelocity.Set(linearVelocity, 0);
  }
  bodies.push(world.CreateBody(b2body));
}

function step(cnt) {
  var stepping = false;
  var timeStep = 1.0 / 60;
  var iteration = 1;
  world.Step(timeStep, iteration);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (getBrowserDimensions()) {
    setWalls();
  }

  delta[0] += (0 - delta[0]) * .5;
  delta[1] += (0 - delta[1]) * .5;

  world.m_gravity.x = gravity.x * 350 + delta[0];
  world.m_gravity.y = gravity.y * 350 + delta[1];

  drawWorld(world, ctx);
  setTimeout('step(' + (cnt || 0) + ')', 10);
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
  createCountPoint(360);
  wallsSetted = true;
}

function createCountPoint__0(count) {
  var a = 360 / count;
  var n = 0;
  for (n; n < count; n++) {
    var hudu = (2 * Math.PI / 360) * a * n;
    var X = centerX + Math.sin(hudu) * radius;    
    // 球形容器中心点
    var bottomWallY = stage[2] / 750 * 600; // 屏幕宽度和设计稿的宽度比例 * 设计稿球形容器中心点的位置
    var Y = bottomWallY + Math.cos(hudu) * radius - 20;
    if ((n > 60 && n < 140) || (n < 300 && n > 170)) {
      createPoint(X, Y);
    }
  }
}

function createCountPoint(count) {
  var a = 360 / count;
  var n = 0;
  for (n; n < count; n++) {
    var hudu = (2 * Math.PI / 360) * a * n;
    var radius;
    if ((n<60&&n>=30)||(n<330&&n>=300))
      radius = 120;
    else
      radius = 130;
    var X = centerX + Math.sin(hudu) * radius;    
    // 球形容器中心点
    var bottomWallY = stage[2] / 750 * 600; // 屏幕宽度和设计稿的宽度比例 * 设计稿球形容器中心点的位置
    var Y = bottomWallY + Math.cos(hudu) * radius - 20;
    if ((n > 30 && n < 140) || (n < 330 && n > 170)) {
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

function drawWorld(world, context) {
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
      drawShape(s, context);
    }
  }
}

function drawShape(shape, context) {
  context.strokeStyle = '#ffffff';
  context.beginPath();
  switch (shape.m_type) {
  case b2Shape.e_circleShape:
    {
      var circle = shape;
      var pos = circle.m_position;
      var r = circle.m_radius;
      // var segments = 16.0;
      var segments = 20.0;
      var theta = 0.0;
      var dtheta = 2.0 * Math.PI / segments;
      // draw circle
      context.moveTo(pos.x + r, pos.y);
      for (var i = 0; i < segments; i++) {
        var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
        var v = b2Math.AddVV(pos, d);
        context.lineTo(v.x, v.y);
        theta += dtheta;
      }
      context.lineTo(pos.x + r, pos.y);
  
      // draw radius
      context.moveTo(pos.x, pos.y);
      var ax = circle.m_R.col1;
      var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
      // context.lineTo(pos2.x, pos2.y);
      // context.fillStyle = colors[Math.random() * colors.length >> 0];
      // context.fill();
    }
    break;
  case b2Shape.e_polyShape:
    {
      var poly = shape;
      var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
      context.moveTo(tV.x, tV.y);
      for (var i = 0; i < poly.m_vertexCount; i++) {
        var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
        context.lineTo(v.x, v.y);
      }
      context.lineTo(tV.x, tV.y);
    }
    break;
  }
  // context.stroke();
  context.fill();
}
