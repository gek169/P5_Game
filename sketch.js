let system;
let click_sound;
let cnv;
let url;
let backg;
let aball;
let ahead1;
let player;
let player_anim_frames = [];
let entity_system;
let renderOffset;
const entity_max_vel = 500;
const player_max_vel = 4;
const debug_render_col = 0;
let wintx; let winty;


function preload(){
	click_sound = loadSound('assets/click.wav');
	backg = loadImage('assets/texture16.png');
	aball = loadImage('assets/aball.png');
	ahead1 = loadImage('assets/Army_Head_1.png');
	player_anim_frames.push(
		loadImage('assets/player_move_1.png')
	);
	player_anim_frames.push(
		loadImage('assets/player_move_2.png')
	);
	player_anim_frames.push(
		loadImage('assets/player_move_3.png')
	);
	player_anim_frames.push(
		loadImage('assets/player_move_2.png')
	);
}

function prepImage(){
	let bffr = createGraphics(backg.width, backg.height);
	//bffr.pixelDensity(1);
	bffr.background(101);
	bffr.image(backg, 0, 0);
	let d = bffr.pixelDensity();
	bffr.loadPixels();
	for(let i = 0; i < bffr.width * bffr.height * 4 * d  * d; i+=4){
		bffr.pixels[i+0] = bffr.pixels[i+0] * 0.5;
		bffr.pixels[i+1] = bffr.pixels[i+1] * 0.5;
		bffr.pixels[i+2] = bffr.pixels[i+2] * 1.0;
		bffr.pixels[i+3] = 255;
	}
	bffr.updatePixels();
	bffr.filter(DILATE);
	bffr.filter(POSTERIZE, 5);
	backg = bffr.get();
	bffr = 0; //explicit destruction.
}

function setup() {
  url = getURL();
  pixelDensity(1);
  //cnv = createCanvas(640, 480, WEBGL);
  cnv = createCanvas(640, 480);
  cnv.mousePressed(playClick);
  system = new ParticleSystem(createVector(width / 2, 50));
  renderOffset = createVector(0,0);
  frameRate(60);
  prepImage();
  entity_system = new ESystem();
  entity_system.addEntity(
  					createVector(100,100),  //initial position
  						10.0,  //mass
  						30.0, 0.0, //radius1, radius2. if radius2 is zero, this is a sphere.
  						0.94,  //friction- 1=no friction, 0=no sliding
  						ahead1, //sprite
  						40,40, //spritew, spriteh
  						0,-1, //render offsets
  						1//isPlayer
  						);
  setup_player(entity_system.entities[0]);

  entity_system.addEntity(createVector(200,100), 
      						10.0, 
      						40.0, 40.0, 
      						0.98, 
      						ahead1, 
      						40,40,
      						0,0,
      						0
      					);
  entity_system.entities[entity_system.entities.length-1].was_colliding_frames_ago = 0;
  entity_system.entities[entity_system.entities.length-1].oncollide = function(other, diff){
	if(diff > 3)
  	if(this.was_colliding_frames_ago <= 0){
  		playClick();
  		this.was_colliding_frames_ago = 30;
  	}
  };
  
  entity_system.entities[entity_system.entities.length-1].behavior = function(){
  	if(this.was_colliding_frames_ago>0)this.was_colliding_frames_ago--;
  };
	entity_system.addEntity(createVector(280,100), 
      						0.0, 100.0, 100.0, 0.94, ahead1, 100,100,0,0,0);
  entity_system.addEntity(createVector(200,200),
        						100.0, 80.0, 0.0, 0.94, aball, 80,80,0,0,0);
 for(let i = 0; i < 350; i++){
  entity_system.addParticle(createVector(random(10,width-10),random(10,height-10)),
    						random(0.1,0.8), 10.0, 0.0, random(0.99, 1.0), aball, 10,10,0,0,0);
  entity_system.particles[entity_system.particles.length-1].accel = createVector(0,
  	-random(0.001, 0.02));
 }
 //translate(-width/2, -height/2);
 //wintx = -width/2;
 //winty = -height/2;
}

function setup_player(obj){
  player = obj;
  player.currentAnimFrame = 0;
  player.isPlayingAnim = 0;
  player.render = player_render;
  player.behavior = player_behavior;
  player.framesOnCurrentAnim = 6;
}
function player_behavior(){
	let ppos = this.position.copy();
	ppos.sub(renderOffset);
	if(ppos.x + this.boxdims.x > width-70) renderOffset.x += constrain(1.04*this.velocity.x,1,player_max_vel);
	if(ppos.x - this.boxdims.x < 70) renderOffset.x += constrain(1.04*this.velocity.x,-player_max_vel,-1);
	if(ppos.y + this.boxdims.y > height-70) renderOffset.y += constrain(1.04*this.velocity.y,1,player_max_vel);
	if(ppos.y - this.boxdims.y < 70) renderOffset.y += constrain(1.04*this.velocity.y,-player_max_vel,-1);
}

function player_render(){
	if(this.velocity.magSq() > (player_max_vel * player_max_vel)/4.0){
		if(!this.isPlayingAnim){this.isPlayingAnim = 1; this.currentAnimFrame = 0;}
		else{
			this.framesOnCurrentAnim += 1;
			if(this.framesOnCurrentAnim > 6)
				{this.currentAnimFrame++;this.framesOnCurrentAnim = 0;}
			this.currentAnimFrame %= player_anim_frames.length;
			this.sprite = player_anim_frames[this.currentAnimFrame];
		}
	} else {
		this.sprite = player_anim_frames[0];
		this.currentAnimFrame = 0;
		this.framesOnCurrentAnim = 6;
	}
	this.render_internal();
}

function playClick(){click_sound.play();}
function draw() {
/*
Game Logic
*/
entity_system.integrate();
for(let i = 0; i < entity_system.particles.length; i++){
	let ent = entity_system.particles[i];
	if(ent.position.y - renderOffset.y < 0 || !((ent.position.x-renderOffset.x) < width+20 && (ent.position.x-renderOffset.x) > -20)){
		ent.position.x = random(10 + renderOffset.x,    width-10+ renderOffset.x);
		ent.position.y = height + 20.0+ renderOffset.y;
		ent.friction = random(0.99, 1.0);
		ent.accel = createVector(0,
		  	-random(0.001, 0.02));
	}
}

/*
Rendering
*/
//translate(wintx, winty);
  background(51);
  image(backg, 0, 0);
  /*
  system.origin = player.position.copy();
  system.origin.sub(renderOffset);
  system.addParticle();
  system.run();
  */
  //color(255,255,255,255);
  //stroke(255,255,255);
  //text(url, 100, 100);
  entity_system.render();
}






//Entity class
let Game_Entity = function(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy){
	this.position = position.copy();
	this.sprite = sprite;
	this.velocity = createVector(0,0);
	this.accel = createVector(0,0);
	this.mass = mass;
	this.boxdims = createVector(radius/2, radius2/2);
	this.spritew = spritew;
	this.spriteh = spriteh;
	this.renderoffx = renderoffx;
	this.renderoffy = renderoffy;
	this.friction = friction;
	this.isPlayer = 0;
};

Game_Entity.prototype.integrate = function(){
	if(this.isPlayer){
		let adder = createVector(0,0);
		this.velocity.mult(0.8); //simulate a LOT of friction.
		let have_pressed = 0;
		if(keyIsDown(UP_ARROW)) {adder.y -= 0.9;have_pressed = 1;}
		if(keyIsDown(DOWN_ARROW)) {adder.y += 0.9;have_pressed = 1;}
		if(keyIsDown(RIGHT_ARROW)) {adder.x += 0.9;have_pressed = 1;}
		if(keyIsDown(LEFT_ARROW)) {adder.x -= 0.9;have_pressed = 1;}
		if(have_pressed)
			this.velocity.add(adder);
		if(this.velocity.magSq() > player_max_vel * player_max_vel){
			this.velocity.normalize(); this.velocity.mult(player_max_vel);
		}
	} else {
		this.velocity.add(this.accel);
		if(this.velocity.magSq() > entity_max_vel * entity_max_vel){
			//this.velocity.normalize(); this.velocity.mult(entity_max_vel);
			this.velocity.mult(0.99);
		}
	}
	this.position.add(this.velocity);
	this.velocity.mult(this.friction);
};

Game_Entity.prototype.render_internal = function(){
	let rpos = this.position.copy();
	rpos.sub(renderOffset);
	image(this.sprite, rpos.x + this.renderoffx - this.spritew/2, rpos.y  + this.renderoffy - this.spriteh/2, this.spritew, this.spriteh);
	noStroke();
	fill(255,255,0,100);
}

Game_Entity.prototype.render = Game_Entity.prototype.render_internal;
//
Game_Entity.prototype.behavior = function(){};
Game_Entity.prototype.oncollide = function(other, diff){};

Game_Entity.prototype.collide = function(other){
	if(this.mass <= 0 && other.mass <= 0) return 0; //Static objects do not need to be processed together.
	/*if(this.boxdims.x <= 0 || other.boxdims.x <= 0) return 0;*/ //Object with no collision.
	let vec = createVector(0,0); let diff = 0; //penetration vector, penetration depth.
	let isBoxVCirc = 0; 
	let box; let circ;
	if(this.boxdims.y == 0 && other.boxdims.y == 0){ //CircVCirc
		vec = other.position.copy();
		vec.sub(this.position);
		let sqmag = vec.mag();
		diff = (other.boxdims.x + this.boxdims.x) - sqmag;
		vec.mult(diff/sqmag); //Get penetration vector.
	} else if(this.boxdims.y > 0 && other.boxdims.y > 0){ //BoxvBox
		let sumextents = this.boxdims.copy();
		sumextents.add(other.boxdims);
		let b1c = this.position;
		let b2c = other.position;
		let b1min = b1c.copy();
			b1min.sub(this.boxdims);
		let b1max = b1c.copy();
			b1max.add(this.boxdims);
		let b2min = b2c.copy();
			b2min.sub(other.boxdims);
		let b2max = b2c.copy();
			b2max.add(other.boxdims);
		if(
			!(
				(Math.abs(b1c.x - b2c.x) <= sumextents.x) &&
				(Math.abs(b1c.y - b2c.y) <= sumextents.y)
			)	
		) {diff = 0;} else {
			let axispen = []; let bruh;
			axispen.push(b1max.copy());
			axispen[0].sub(b2min);
			axispen.push(b1min.copy());
			axispen[1].sub(b2max);
			/*Find the minimum separating access. Let's assume it's the first one...*/
			vec.x = axispen[0].x;  vec.y = 0;
			diff = Math.abs(axispen[0].x);
			bruh = Math.abs(axispen[0].y);
			if(bruh < diff){
				vec.x = 0;
				vec.y = axispen[0].y;
				diff = bruh;
			}
			bruh = Math.abs(axispen[1].y);
			if(bruh < diff){
				vec.x = 0;
				vec.y = axispen[1].y;
				diff = bruh;
			}
			bruh = Math.abs(axispen[1].x);
			if(bruh < diff){
				vec.y = 0;
				vec.x = axispen[1].x;
				diff = bruh;
			}
		}
	} else if(this.boxdims.y > 0 && other.boxdims.y <= 0){ //We are a box, they are a circle.
		box = this;
		circ = other;
		isBoxVCirc = 1;
	} else {
		box = other;
		circ = this;
		isBoxVCirc = 2;
	}
	if(isBoxVCirc){//collision between box and circle
		let p = circ.position.copy(); //
		{ //function: closest point AABB
			let b1c = box.position.copy();
			let b1min = b1c.copy();
				b1min.sub(box.boxdims);
			let b1max = b1c.copy();
				b1max.add(box.boxdims);
			p.x = constrain(p.x, b1min.x, b1max.x);
			p.y = constrain(p.y, b1min.y, b1max.y);
		}
		let v = p.copy(); v.sub(circ.position);
		let d2 = v.magSq();
		if(d2 <= circ.boxdims.x * circ.boxdims.x){
			let len = v.mag();
			let local_diff = circ.boxdims.x - len;
			if(len > 0){
				diff = local_diff;
				vec = v.copy(); vec.mult(diff/len);
				if(isBoxVCirc != 2)
					vec.mult(-1);
			} else { //boxvbox subcase
				let sumextents = this.boxdims.copy();
				sumextents.add(other.boxdims);
				let b1c = this.position;
				let b2c = other.position;
				let b1min = b1c.copy();
					b1min.sub(this.boxdims);
				let b1max = b1c.copy();
					b1max.add(this.boxdims);
				let b2min = b2c.copy();
					b2min.sub(other.boxdims);
				let b2max = b2c.copy();
					b2max.add(other.boxdims);
				if(
					!(
						(Math.abs(b1c.x - b2c.x) <= sumextents.x) &&
						(Math.abs(b1c.y - b2c.y) <= sumextents.y)
					)	
				) {diff = 0;} else {
					let axispen = []; let bruh;
					axispen.push(b1max.copy());
					axispen[0].sub(b2min);
					axispen.push(b1min.copy());
					axispen[1].sub(b2max);
					/*Find the minimum separating access. Let's assume it's the first one...*/
					vec.x = axispen[0].x;  vec.y = 0;
					diff = Math.abs(axispen[0].x);
					bruh = Math.abs(axispen[0].y);
					if(bruh < diff){
						vec.x = 0;
						vec.y = axispen[0].y;
						diff = bruh;
					}
					bruh = Math.abs(axispen[1].y);
					if(bruh < diff){
						vec.x = 0;
						vec.y = axispen[1].y;
						diff = bruh;
					}
					bruh = Math.abs(axispen[1].x);
					if(bruh < diff){
						vec.y = 0;
						vec.x = axispen[1].x;
						diff = bruh;
					}
				}
			}//EOF boxvbox subcase
		}//if(d2 <= circ.boxdims.x * circ.boxdims.x){}
	} //if(isBoxVCirc){}
	if(diff  > 0){
		let mass_total = this.mass + other.mass;
		let mass_ratio_me = this.mass / mass_total;
		let mass_ratio_them = other.mass / mass_total;
		this.oncollide(other, diff);
		other.oncollide(this, diff);
		if(this.mass > 0){
			let vec2 = vec.copy();
			vec2.mult(-1);
			if(other.mass != 0)
				vec2.mult(mass_ratio_them);
			this.position.add(vec2);
			vec2.mult(0.5);
			vec2.mult(other.friction * this.friction);
			this.velocity.add(vec2);
		}
		if(other.mass > 0){
			//let vec2 = vec.copy();
			if(this.mass != 0)
				vec.mult(mass_ratio_me);
			other.position.add(vec);
			vec.mult(0.5);
			vec.mult(other.friction * this.friction);
			other.velocity.add(vec);
		}
	}
};


let ESystem = function(){
	this.entities = [];
	this.renderables = [];
	this.particles = [];
};

ESystem.prototype.addEntity = function(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.entities.push(new Game_Entity(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy))
	this.entities[this.entities.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.addRenderable = function(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.renderables.push(new Game_Entity(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy))
	this.renderables[this.renderables.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.addParticle = function(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.particles.push(new Game_Entity(position, mass, radius, radius2, friction, sprite, spritew, spriteh, renderoffx, renderoffy))
	this.particles[this.particles.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.removeEntity = function(i){
	this.entities.splice(i, 1);
};
ESystem.prototype.removeRenderable = function(i){
	this.renderables.splice(i, 1);
};
ESystem.prototype.removeParticle = function(i){
	this.particles.splice(i, 1);
};

ESystem.prototype.integrate = function(){
	let i; let j;
	for(i = this.entities.length - 1; i>-1; i--){
		this.entities[i].integrate();
		this.entities[i].behavior();
	}
	for(i = this.particles.length - 1; i>-1; i--){
		this.particles[i].integrate();
		this.particles[i].behavior();
	}
	for(i = this.entities.length - 1; i>0; i--){
		for(j = i-1; j>-1; j--){
			let a = this.entities[i];
			let b = this.entities[j];
			a.collide(b);
		}
	}
}

ESystem.prototype.render = function(){
	for(let i = this.renderables.length - 1; i>=0; i--){
		this.renderables[i].render();
	}
	for(let i = this.entities.length - 1; i>=0; i--){
		this.entities[i].render();
	}
	for(let i = this.particles.length - 1; i>=0; i--){
		this.particles[i].render();
	}
}



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
  this.position.add(renderOffset);
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
  ellipse(this.position.x -renderOffset.x, this.position.y -renderOffset.y, 12, 12);
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
