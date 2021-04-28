let system;
let soundeffect;
let cnv;
let url;
let backg;
let aball;
let player;
let entity_system;
let renderOffset;
const entity_max_vel = 500;
const player_max_vel = 4;

function preload(){
	soundeffect = loadSound('assets/click.wav');
	backg = loadImage('assets/texture16.png');
	aball = loadImage('assets/aball.png');
}

function prepImage(){
	background(51);
	image(backg, 0, 0);
	let d = pixelDensity();
	loadPixels();
	for(let i = 0; i < width * height * 4 * d  * d; i+=4){
		pixels[i+0] = pixels[i+0] * 0.5;
		pixels[i+1] = pixels[i+1] * 0.5;
		pixels[i+2] = pixels[i+2] * 1.0;
		pixels[i+3] = 255;
	}
	
	updatePixels();
	filter(DILATE);
	filter(POSTERIZE, 5);
	backg = get();
}

function setup() {
  url = getURL();
  pixelDensity(1);
  cnv = createCanvas(640, 480);
  cnv.mousePressed(playSound);
  system = new ParticleSystem(createVector(width / 2, 50));
  renderOffset = createVector(0,0);
  frameRate(60);
  prepImage();
  player = new Game_Entity(createVector(100,100), 
  						10.0, 40.0, aball, 40, 40);
  player.isPlayer = 1;
}

function playSound(){
	soundeffect.play();
}
function draw() {
/*
Game Logic
*/
player.integrate();

/*
Rendering
*/

  background(51);
  image(backg, 0, 0);
  system.addParticle();
  system.run();
  
  color(255,255,255,255);
  stroke(255,255,255);
  text(url, 100, 100);
  player.render();
}


//Entity class
let Game_Entity = function(position, mass, radius, sprite, spritew, spriteh){
	this.position = position.copy();
	this.sprite = sprite;
	this.velocity = createVector(0,0);
	this.accel = createVector(0,0);
	this.mass = mass;
	this.radius = radius;
	this.spritew = spritew;
	this.spriteh = spriteh;
	this.isPlayer = 0;
};

Game_Entity.prototype.integrate = function(){
	if(this.isPlayer){
		this.velocity = createVector(0,0);
		let have_pressed = 1;
		if(keyIsDown(UP_ARROW)) this.velocity.y -= 1;
		if(keyIsDown(DOWN_ARROW)) this.velocity.y += 1;
		if(keyIsDown(RIGHT_ARROW)) this.velocity.x += 1;
		if(keyIsDown(LEFT_ARROW)) this.velocity.x -= 1;
		this.velocity.normalize(); this.velocity.mult(player_max_vel);
	} else {
		this.velocity.add(this.accel);
		if(this.velocity.magSq() > entity_max_vel){
			this.velocity.normalize(); this.velocity.mult(entity_max_vel);
		}
	}
	this.position.add(this.velocity);
};

Game_Entity.prototype.render = function(){
	let rpos = this.position.copy();
	rpos.sub(renderOffset);
	
	image(this.sprite, rpos.x - this.spritew/2, rpos.y - this.spriteh/2, this.spritew, this.spriteh);
	noStroke();
	fill(255,255,0,100);
	ellipse(rpos.x, rpos.y, this.radius/2.0, this.radius/2.0);
};

Game_Entity.prototype.collide = function(other){
	if(this.mass <= 0 && other.mass <= 0) return 0; //Static objects do not need to be processed together.
	let vec = this.position;
	vec.sub(other.position);
	let sqmag = vec.magSq();
	if(sqmag < (other.radius + this.radius) * (other.radius + this.radius)){
		//TODO: push on each of them.
	}
};




/**
	Extremely basic example of a particle system.
**/



// A simple Particle class
let Particle = function(position) {
  this.color = createVector(random(0,255),
  							random(0,255),
  							random(0,255));
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
  noStroke();
  fill(this.color.x, this.color.y, this.color.z, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  return this.lifespan < 0;
};

let ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (let i = this.particles.length-1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};
