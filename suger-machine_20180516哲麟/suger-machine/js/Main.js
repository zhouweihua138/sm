var canvas;

var delta = [ 0, 0 ];
var stage = [ window.screenX, window.screenY, window.innerWidth, window.innerHeight ];

var centerX = window.innerWidth/2;
var centerY = window.innerHeight/2;
var radius = 140;

getBrowserDimensions();

var themes = [ [ "#10222B", "#95AB63", "#BDD684", "#E2F0D6", "#F6FFE0" ],
		[ "#362C2A", "#732420", "#BF734C", "#FAD9A0", "#736859" ],
		[ "#0D1114", "#102C2E", "#695F4C", "#EBBC5E", "#FFFBB8" ],
		[ "#2E2F38", "#FFD63E", "#FFB54B", "#E88638", "#8A221C" ],
		[ "#121212", "#E6F2DA", "#C9F24B", "#4D7B85", "#23383D" ],
		[ "#343F40", "#736751", "#F2D7B6", "#BFAC95", "#8C3F3F" ],
		[ "#000000", "#2D2B2A", "#561812", "#B81111", "#FFFFFF" ],
		[ "#333B3A", "#B4BD51", "#543B38", "#61594D", "#B8925A" ] ];
var theme;

var colors = ["red","green","blue","yellow"];

var worldAABB, world, iterations = 1, timeStep = 1 / 15;

var walls = [];
var bottomWall;
var wall_thickness = 1;
var wallsSetted = false;

var bodies, elements, text;

var createMode = true;
var destroyMode = false;

var isMouseDown = false;
var mouseJoint;
var mouse = { x: 0, y: 0 };
var gravity = { x: 0, y: 1 };

var PI2 = Math.PI * 2;

var timeOfLastTouch = 0;

init();
play();

function init() {

	canvas = document.getElementById( 'canvas' );

	// document.onmousedown = onDocumentMouseDown;
	// document.onmouseup = onDocumentMouseUp;
	// document.onmousemove = onDocumentMouseMove;
	// document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	// document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	// document.addEventListener( 'touchend', onDocumentTouchEnd, false );
	// window.addEventListener( 'deviceorientation', onWindowDeviceOrientation, true );

	worldAABB = new b2AABB();
	worldAABB.minVertex.Set( -200, -200 );
	worldAABB.maxVertex.Set( window.innerWidth + 200, window.innerHeight + 200 );

	world = new b2World( worldAABB, new b2Vec2( 0, 0 ), true );

	setWalls();
	reset();
}


function play() {

	setInterval( loop, 1000 / 40 );
}

function reset() {

	var i;

	if ( bodies ) {

		for ( i = 0; i < bodies.length; i++ ) {

			var body = bodies[ i ]
			canvas.removeChild( body.GetUserData().element );
			world.DestroyBody( body );
			body = null;
		}
	}

	// theme = themes[ Math.random() * themes.length >> 0 ];
	// document.body.style[ 'backgroundColor' ] = theme[ 0 ];
    // theme = [ "#E2F0D6", "#E2F0D6", "#E2F0D6", "#E2F0D6", "#E2F0D6" ];
    // document.body.style[ 'backgroundColor' ] = "#10222B";
	bodies = [];
	elements = [];

	// createInstructions();
}

function initBalls (number) {
    var i;
    for (i = 0; i < number; i++) {
        createBall(centerX-100, centerY-100,false);
    }
}

function collectBalls (number) {
    var interval2 = window.setInterval((function(){
            createBall(centerX+centerX, centerY-210,true);
    }),500);
    setTimeout(function() {window.clearInterval(interval2);},number*500);
}

function removeBottomWall() {
	destroyMode = true;
    world.DestroyBody(bottomWall);
    bottomWall = null;
}

function onDocumentMouseDown() {

	isMouseDown = true;
	return false;
}

function onDocumentMouseUp() {

	isMouseDown = false;
	return false;
}

function onDocumentMouseMove( event ) {

	mouse.x = event.clientX;
	mouse.y = event.clientY;
}

function onDocumentTouchStart( event ) {

	if( event.touches.length == 1 ) {

		event.preventDefault();

		// Faking double click for touch devices

		var now = new Date().getTime();

		if ( now - timeOfLastTouch  < 250 ) {

			// reset();
			return;
		}

		timeOfLastTouch = now;

		mouse.x = event.touches[ 0 ].pageX;
		mouse.y = event.touches[ 0 ].pageY;
		isMouseDown = true;
	}
}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouse.x = event.touches[ 0 ].pageX;
		mouse.y = event.touches[ 0 ].pageY;

	}

}

function onDocumentTouchEnd( event ) {

	if ( event.touches.length == 0 ) {

		event.preventDefault();
		isMouseDown = false;

	}

}

function onWindowDeviceOrientation( event ) {

	if ( event.beta ) {
	}

}

function createBall( x, y ,speed) {

	// var x = x || Math.random() * stage[2];
	// var y = y || Math.random() * -200;
	// var size = (Math.random() * 100 >> 0) + 20;
    var size = 50;

    var img = document.createElement( 'img' );
    img.src = "images/about.png";
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.style.position = 'absolute';
    img.style.left =  '0px';
    img.style.top =   '0px';
    img.style.cursor = "default";

	var element = document.createElement("canvas");
	element.width = size;
	element.height = size;
	element.style.position = 'absolute';
	element.style.left = -200 + 'px';
	element.style.top = -200 + 'px';
	element.style.WebkitTransform = 'translateZ(0)';
	element.style.MozTransform = 'translateZ(0)';
	element.style.OTransform = 'translateZ(0)';
	element.style.msTransform = 'translateZ(0)';
	element.style.transform = 'translateZ(0)';

	var graphics = element.getContext("2d");
	graphics.fillStyle = colors[Math.random() * colors.length >> 0];
	graphics.beginPath();
	graphics.arc(size * .5, size * .5, size * .5, 0, PI2, true);
	graphics.closePath();
	graphics.fill();

	// canvas.appendChild(img);
	canvas.appendChild(element);

	// elements.push(img);
	elements.push( element );

	var b2body = new b2BodyDef();

	var circle = new b2CircleDef();
	circle.radius = size >> 1;
	circle.density = 1;
	circle.friction = 0.3;
	circle.restitution = 0.3;
	b2body.AddShape(circle);
	// b2body.userData = {element: element};

    b2body.userData = {element:img};

	b2body.position.Set( x, y );
	if (speed) {
        b2body.linearVelocity.Set(-300, 0);
    }
	bodies.push( world.CreateBody(b2body) );
}

//

function loop() {

	if (getBrowserDimensions()) {
		setWalls();
	}

	delta[0] += (0 - delta[0]) * .5;
	delta[1] += (0 - delta[1]) * .5;

	world.m_gravity.x = gravity.x * 350 + delta[0];
	world.m_gravity.y = gravity.y * 350 + delta[1];

	// mouseDrag();
	world.Step(timeStep, iterations);

	for (i = 0; i < bodies.length; i++) {

		var body = bodies[i];
		var element = elements[i];

		element.style.left = (body.m_position0.x - (element.width >> 1)) + 'px';
		element.style.top = (body.m_position0.y - (element.height >> 1)) + 'px';

		//旋转
		// 	var style = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg) translateZ(0)';
         //    element.style.WebkitTransform = style;
         //    element.style.MozTransform = style;
         //    element.style.OTransform = style;
         //    element.style.msTransform = style;
         //    element.style.transform = style;
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
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd);
}

function mouseDrag()
{
    if (isMouseDown) {
    	if (createMode){
            createBall( mouse.x, mouse.y ,true);
            createMode = false;
		}
	}

    if (!isMouseDown) {
        createMode = true;
    }
}

function setWalls() {

	if (wallsSetted) {
		world.DestroyBody(bottomWall);
		bottomWall = null;
		for(var i = 0; i < walls.length;i++)
		{
            world.DestroyBody(walls[i]);
            walls[i] = null;
		}
	}

	if (!destroyMode) {
        bottomWall = createBox(world, stage[2] / 2, centerY + 80, stage[2], wall_thickness);
    }
	createCountPoint(360);
	wallsSetted = true;
}

function createCountPoint(count) {
	var a = 360/count;
    var n = 0;
    for (n;n<count;n++)
	{
        var hudu = (2*Math.PI / 360) * a * n;
		var X = centerX + Math.sin(hudu) * radius;
        var Y = centerY + Math.cos(hudu) * radius-20;
        if ((n>30&&n<140)||(n<330&&n>170))
		createPoint(X,Y);
	}
}

function createPoint(x,y) {
    walls[walls.length+1] = createBox(world, x, y, 2, 2);
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
