let cnv;
let url;
let entity_system;
let assetman; //manages assets.
let global_vars; //global variables.
let player;
let renderOffset;
const entity_max_vel = 500;
const player_max_vel = 4;
const debug_render_col = 0;
let wintx; let winty;

function get_and_run(theURL){
	var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theURL, false ); //synchronous
		xmlHttp.send( null );
	let e = eval;
	e(xmlHttp.responseText);
}

function preload(){
	get_and_run('assets/preload_run.js');
}



function setup() {
  url = getURL();
  setup_hook();
}


function draw() {
	entity_system.integrate();
	game_logic();
	entity_system.render();
}







/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Engine code
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/


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
ESystem.prototype.render_background = function(){}
ESystem.prototype.render = function(){
	this.render_background();
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
