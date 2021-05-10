let img;
let world;
let body;




function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  img = loadImage('assets/aball.png');
  frameRate(60);
  world = new CANNON.World()
  {
  	let shape=
  	new 
  		CANNON.Box(new CANNON.Vec3(40, 40, 40))
  		body = new CANNON.Body({
  		  mass: 1,
  		})
  		body.addShape(shape)
  		body.velocity.set(0,10,0);
  		body.angularVelocity.set(20, 100, 0);
  		body.angularDamping = 0.5;
  		body.material = new CANNON.Material();
  		body.material.friction = 500;
  		world.addBody(body)
  	}
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	angleMode(RADIANS);
	world.step(1/60.0);
  background(0,0,60);
	let vec3;
  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  ambientLight(60, 60, 60);
  pointLight(255, 255, 255, locX, locY, 100);

  push();
	  vec3 = new CANNON.Vec3(0,0,0);
	  body.quaternion.toEuler(vec3);
	  translate(body.position.x, body.position.y, body.position.z);
	  rotateY(vec3.y);
	  rotateZ(vec3.z);
	  rotateX(vec3.x);
	  texture(img);
	  box(80);
  pop();

  push();
  translate(-width / 4, -height / 4, 0);
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  fill(250, 0, 0);
  torus(80, 20, 64, 64);
  pop();

  push();
  translate(width / 4, -height / 4, 0);
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  normalMaterial();
  torus(80, 20, 64, 64);
  pop();

  push();
  translate(-width / 4, height / 4, 0);
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  ambientMaterial(250);
  torus(80, 20, 64, 64);
  pop();

  push();
  translate(width / 4, height / 4, 0);
  rotateZ(frameCount * 0.01);
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  specularMaterial(250);
  torus(80, 20, 64, 64);
  pop();
}
