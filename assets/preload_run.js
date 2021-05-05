{
	global_vars = {}; cnv = {}; player = {}; renderOffset = {}; assetman = {}; //explicitly delete anything that existed before us.
//SOUNDS
	assetman.click_sound = loadSound('assets/click.wav');
	//IMAGES
	assetman.backg = fetchImage('assets/texture16.png');
	assetman.aball = fetchImage('assets/aball.png');
	assetman.ahead1 = fetchImage('assets/Army_Head_1.png');
	//ANIMATIONS
	assetman.player_anim_frames = [];
	assetman.player_anim_frames.push(
		fetchImage('assets/player_move_1.png')
	);
	assetman.player_anim_frames.push(
		fetchImage('assets/player_move_2.png')
	);
	assetman.player_anim_frames.push(
		fetchImage('assets/player_move_3.png')
	);
	assetman.player_anim_frames.push(
		assetman.player_anim_frames[1]
	);
}

function prepImage(obj){
	let bffr = createGraphics(assetman.backg.width, assetman.backg.height);
	//bffr.pixelDensity(1);
	bffr.background(101);
	bffr.image(assetman.backg, 0, 0);
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
	assetman.backg = bffr.get();
	bffr = 0; //explicit destruction.
}



function onclick_hook(){
	
}



function setup_hook(){
  pixelDensity(1);
  cnv = createCanvas(1000, 550);
  //cnv.mousePressed(playClick);
  //system = new ParticleSystem(createVector(width / 2, 50));
  renderOffset = createVector(0,0);
  frameRate(60);
  prepImage();
  entity_system = new ESystem();
  global_vars.backg = assetman.backg; assetman.backg=0;
  entity_system.render_background = function(){
  	  	background(51);
  		image(global_vars.backg, 0, 0);
  }
  entity_system.addEntity(
  					createVector(100,100),  //initial position
  						10.0,  //mass
  						30.0, 0.0, //radius1, radius2. if radius2 is zero, this is a sphere.
  						0.94,  //friction- 1=no friction, 0=velocity immediately drops to zero.
  						assetman.ahead1, //sprite
  						40,40, //spritew, spriteh
  						0,-1, //render offsets
  						1//isPlayer
  						);
  setup_player(entity_system.entities[0]);

  entity_system.addEntity(createVector(200,100), 
      						10.0, 
      						40.0, 40.0, 
      						0.98, 
      						assetman.ahead1, 
      						40,40,
      						0,0,
      						0
      					);
  setup_collideable_test(entity_system.entities[entity_system.entities.length-1]);
  
  entity_system.entities[entity_system.entities.length-1].behavior = function(){
  	if(this.was_colliding_frames_ago>0)this.was_colliding_frames_ago--;
  };
	entity_system.addEntity(createVector(280,100), 
      						0.0, 100.0, 100.0, 0.94, assetman.ahead1, 100,100,0,0,0);
  entity_system.addEntity(createVector(200,200),
        						100.0, 80.0, 0.0, 0.94, assetman.aball, 80,80,0,0,0);
 for(let i = 0; i < 2000; i++){
  entity_system.addParticle(createVector(random(10,width-10),random(10,height-10)),
    						random(0.1,0.8), 10.0, 0.0, random(0.99, 1.0), assetman.aball, 10,10,0,0,0);
  entity_system.particles[entity_system.particles.length-1].accel = createVector(0,
  	-random(0.001, 0.02));
  	entity_system.particles[entity_system.particles.length-1].ctor_name = "aball_particle";
 }

}

function game_logic(){
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
}

function playClick(){assetman.click_sound.play();}








function setup_player(obj){
  obj.ctor_name = "player"
  player = obj;
  player.currentAnimFrame = 0;
  player.isPlayingAnim = 0;
  player.render = player_render;
  player.behavior = player_behavior;
  player.framesOnCurrentAnim = 6;
  player.movement_anim_frames = assetman.player_anim_frames; assetman.player_anim_frames = 0;
}
function player_behavior(){
	let ppos = this.position.copy();
	ppos.sub(renderOffset);
	if(ppos.x + this.boxdims.x > width-70) renderOffset.x += constrain(1.04*this.velocity.x,1,player_max_vel);
	if(ppos.x - this.boxdims.x < 70) renderOffset.x += constrain(1.04*this.velocity.x,-player_max_vel,-1);
	if(ppos.y + this.boxdims.y > height-70) renderOffset.y += constrain(1.04*this.velocity.y,1,player_max_vel);
	if(ppos.y - this.boxdims.y < 70) renderOffset.y += constrain(1.04*this.velocity.y,-player_max_vel,-1);

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
}

function player_render(){
	if(this.velocity.magSq() > (player_max_vel * player_max_vel)/4.0){
		if(!this.isPlayingAnim){this.isPlayingAnim = 1; this.currentAnimFrame = 0;}
		else{
			this.framesOnCurrentAnim += 1;
			if(this.framesOnCurrentAnim > 6)
				{this.currentAnimFrame++;this.framesOnCurrentAnim = 0;}
			this.currentAnimFrame %= this.movement_anim_frames.length;
			this.sprite = this.movement_anim_frames[this.currentAnimFrame];
		}
	} else {
		this.sprite = this.movement_anim_frames[0];
		this.currentAnimFrame = 0;
		this.framesOnCurrentAnim = 6;
	}
	this.render_internal();
}


function setup_collideable_test(obj){
	obj.was_colliding_frames_ago = 0;
	obj.oncollide = function(other, diff){
		if(diff > 3)
	  	if(this.was_colliding_frames_ago <= 0){
	  		playClick();
	  		this.was_colliding_frames_ago = 30;
	  	}
	  };
   obj.behavior = function(){
     	if(this.was_colliding_frames_ago>0)this.was_colliding_frames_ago--;
     };
     obj.ctor_name = "collideable_test";
}
