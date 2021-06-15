{
	global_vars = {}; renderOffset = createVector(0,0); 
	assetman = {}; //explicitly delete anything that existed before us.
	global_vars.player_max_vel = 4;
//SOUNDS
	global_vars.gamemode = 1; //load the BATTLE MENU!!!!!
	assetman.click_sound = loadSound('assets/click.wav');
	//IMAGES
	
	assetman.aball = loadImage('assets/aball.png');
	assetman.ahead1 = loadImage('assets/Army_Head_1.png');
	//ANIMATIONS
	assetman.player_anim_frames = [];
	assetman.player_anim_frames.push(
		loadImage('assets/player_move_1.png')
	);
	assetman.player_anim_frames.push(
		loadImage('assets/player_move_2.png')
	);
	assetman.player_anim_frames.push(
		loadImage('assets/player_move_3.png')
	);
	assetman.player_anim_frames.push(
		assetman.player_anim_frames[1]
	);
}


//This is provided by the engine.
function onclick_hook(){
	
}

//this is provided by the engine.
function setup_hook(){
	renderOffsetSaved_Editor = createVector(0,0);
	renderOffsetSaved_Gameplay = createVector(0,0);
	renderOffset = createVector(0,0);
	global_vars.can_continue = 0;
	assetman.backg = loadImage('assets/texture16.png', img=>
		{	assetman.backg = img;
			console.log("Preparing image...");
			let bffr = createGraphics(assetman.backg.width, assetman.backg.height);
				bffr.pixelDensity(1);
				bffr.image(assetman.backg, 0, 0);
				bffr.loadPixels();
				for(let i = 0; i < bffr.width * bffr.height * 4; i+=4){
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
	);
	
	entity_system = new ESystem();
	entity_system.render_background = function(){
		background(51);
		image(assetman.backg, 0, 0);
	}

}


//this is provided by the engine.
function game_logic(){
	if(global_vars.gamemode == 0)
		entity_system.integrate();
	if(global_vars.gamemode == 1){ //PREPPING TO GO INTO BATTLE MODE
		entity_system.addEntity(
			createVector(400,30),  //initial position
			10.0,  //mass
			30.0, 0.0, //radius1, radius2. if radius2 is zero, this is a sphere.
			0.94,  //friction- 1=no friction, 0=velocity immediately drops to zero.
			//assetman.ahead1, //sprite
			40,40, //spritew, spriteh
			0,-1 //render offsets
		);

		entity_system.addEntity(
			createVector(400,520),  //initial position
			10.0,  //mass
			30.0, 0.0, //radius1, radius2. if radius2 is zero, this is a sphere.
			0.94,  //friction- 1=no friction, 0=velocity immediately drops to zero.
			//assetman.ahead1, //sprite
			40,40, //spritew, spriteh
			0,-1 //render offsets
		);
		global_vars.gamemode = 2
		global_vars.hp_text_1 = createP('Player HP: ');
		global_vars.hp_text_2 = createP('Enemy HP: ');
		global_vars.hp_text_1.position(10,0);
		global_vars.hp_text_2.position(10,490);
		global_vars.hp_text_1.style('font-size','32px');
		global_vars.hp_text_2.style('font-size','32px');
		global_vars.hp_text_1.style('color','white');
		global_vars.hp_text_2.style('color','white');
	}
	if(global_vars.gamemode == 2){
		
	}
}

function playClick(){
	assetman.click_sound.play();
}








