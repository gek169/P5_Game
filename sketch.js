/*
.▄▄ · ▄▄▌ ▐ ▄▌      ▄▄▄  ·▄▄▄▄  .▄▄ · ▄▄▌   ▄▄▄· .▄▄ ·  ▄ .▄
▐█ ▀. ██· █▌▐█▪     ▀▄ █·██▪ ██ ▐█ ▀. ██•  ▐█ ▀█ ▐█ ▀. ██▪▐█
▄▀▀▀█▄██▪▐█▐▐▌ ▄█▀▄ ▐▀▀▄ ▐█· ▐█▌▄▀▀▀█▄██▪  ▄█▀▀█ ▄▀▀▀█▄██▀▐█
▐█▄▪▐█▐█▌██▐█▌▐█▌.▐▌▐█•█▌██. ██ ▐█▄▪▐█▐█▌▐▌▐█ ▪▐▌▐█▄▪▐███▌▐▀
 ▀▀▀▀  ▀▀▀▀ ▀▪ ▀█▄▀▪.▀  ▀▀▀▀▀▀•  ▀▀▀▀ .▀▀▀  ▀  ▀  ▀▀▀▀ ▀▀▀ ·
*/


let cnv = 0;
let url;
let entity_system;
let dummy_img;
let assetman; //manages assets.
let global_vars; //global variables.
let selected_layer = 0; //Renderables.
let editor_tool = 0; //move, place, remove
let player;
let selectedEntity = 0;
let selected_i = -1;
let renderOffset;
let renderOffsetSaved_Gameplay; //when switch between modes, the render offset may be changed.
let renderOffsetSaved_Editor; //when switch between modes
let editor_is_active = false;
let js_file_stack = [];

function onclick_hook(){}
//function setup_hook(){}
//function game_logic(){}


function get_and_run(theURL){
	var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theURL, false ); //synchronous
		xmlHttp.send( null );
	let e = eval;
	e(xmlHttp.responseText);
	js_file_stack.push(theURL);
}

$("#exportLvlBtn").click(function(){
	let huge_thing = {};
	huge_thing.globals = JSON.stringify(global_vars);
	huge_thing.renderOffset_x = renderOffset.x;
	huge_thing.renderOffsetSaved_Gameplay_x = renderOffsetSaved_Gameplay.x;
	huge_thing.renderOffsetSaved_Editor_x = renderOffsetSaved_Editor.x;
	huge_thing.renderOffset_y = renderOffset.y;
	huge_thing.renderOffsetSaved_Gameplay_y = renderOffsetSaved_Gameplay.y;
	huge_thing.renderOffsetSaved_Editor_y = renderOffsetSaved_Editor.y;
	huge_thing.editor_is_active = editor_is_active;
	huge_thing.js_file_stack = JSON.stringify(js_file_stack);
	huge_thing.renderables = [];
	huge_thing.fgrenderables = [];
	huge_thing.entities = [];
	huge_thing.particles = [];
	for(let i = 0; i < entity_system.renderables.length; i++){
		huge_thing.renderables.push(entity_system.renderables[i].serialize())
	}
	for(let i = 0; i < entity_system.fgrenderables.length; i++){
		huge_thing.fgrenderables.push(entity_system.fgrenderables[i].serialize())
	}
	for(let i = 0; i < entity_system.entities.length; i++){
		huge_thing.entities.push(entity_system.entities[i].serialize())
	}
	for(let i = 0; i < entity_system.particles.length; i++){
		huge_thing.particles.push(entity_system.particles[i].serialize())
	}
	$("#exportLvlTxt").val(JSON.stringify(huge_thing));
});
$("#importLvlBtn").click(function(){
	noLoop(); selectedEntity = 0; selected_layer = 0; selected_i = -1;
	let huge_thing = {};
	huge_thing = JSON.parse($("#exportLvlTxt").val());
	let local_js_file_stack = JSON.parse(huge_thing.js_file_stack);
	for(let j = 0; j < local_js_file_stack.length; j++) {
		get_and_run(local_js_file_stack[j]);
		setup();//trigger setup.
	}
	
	js_file_stack = local_js_file_stack;
	

	global_vars = JSON.parse(huge_thing.globals);
	renderOffset = createVector(huge_thing.renderOffset_x, huge_thing.renderOffset_y);
	renderOffsetSaved_Gameplay = createVector(huge_thing.renderOffsetSaved_Gameplay_x, huge_thing.renderOffsetSaved_Gameplay_y);
	renderOffsetSaved_Editor = createVector(huge_thing.renderOffsetSaved_Editor_x, huge_thing.renderOffsetSaved_Editor_y);
	entity_system.renderables = [];
	entity_system.fgrenderables = [];
	entity_system.entities = [];
	entity_system.particles = [];
	//renderables
	for(let i = 0; i < huge_thing.renderables.length; i++){
		let active = JSON.parse(huge_thing.renderables[i]);
		
		entity_system.addRenderable(
			createVector(parseFloat(active.pos_x), parseFloat(active.pos_y)),
			parseFloat(active.mass),
			parseFloat(active.boxdims_x), parseFloat(active.boxdims_y),
			parseFloat(active.friction),
			parseFloat(active.spritew),
			parseFloat(active.spriteh),
			parseFloat(active.renderoffx),
			parseFloat(active.renderoffy)
		);
		if(active.ctor_name != "nil"){
			eval("setup_"+active.ctor_name)(entity_system.renderables[entity_system.renderables.length-1]);
		}
		entity_system.renderables[entity_system.renderables.length-1].get_extdata();
	}

	//entities
	for(let i = 0; i < huge_thing.entities.length; i++){
		let active = JSON.parse(huge_thing.entities[i]);
		entity_system.addEntity(
			createVector(parseFloat(active.pos_x), parseFloat(active.pos_y)),
			parseFloat(active.mass),
			parseFloat(active.boxdims_x), 
			parseFloat(active.boxdims_y),
			parseFloat(active.friction),
			parseFloat(active.spritew),
			parseFloat(active.spriteh),
			parseFloat(active.renderoffx),
			parseFloat(active.renderoffy)
		);
		if(active.ctor_name != "nil"){
			eval("setup_"+active.ctor_name)(entity_system.entities[entity_system.entities.length-1]);
		}
		entity_system.entities[entity_system.entities.length-1].get_extdata();
	}
	//entities
	for(let i = 0; i < huge_thing.particles.length; i++){
		let active = JSON.parse(huge_thing.particles[i]);
		entity_system.addParticle(
			createVector(parseFloat(active.pos_x), parseFloat(active.pos_y)),
			parseFloat(active.mass),
			parseFloat(active.boxdims_x), parseFloat(active.boxdims_y),
			parseFloat(active.friction),
			parseFloat(active.spritew),
			parseFloat(active.spriteh),
			parseFloat(active.renderoffx),
			parseFloat(active.renderoffy)
		);
		if(active.ctor_name != "nil"){
			eval("setup_"+active.ctor_name)(entity_system.particles[entity_system.particles.length-1]);
			
		}
		entity_system.particles[entity_system.particles.length-1].get_extdata();
	}
	//fgrenderables
		for(let i = 0; i < huge_thing.fgrenderables.length; i++){
			let active = JSON.parse(huge_thing.fgrenderables[i]);
			entity_system.addFgRenderable(
				createVector(parseFloat(active.pos_x), parseFloat(active.pos_y)),
				parseFloat(active.mass),
				parseFloat(active.boxdims_x), parseFloat(active.boxdims_y),
				parseFloat(active.friction),
				parseFloat(active.spritew),
				parseFloat(active.spriteh),
				parseFloat(active.renderoffx),
				parseFloat(active.renderoffy)
			);
			if(active.ctor_name != "nil"){
				eval("setup_"+active.ctor_name)(entity_system.fgrenderables[entity_system.fgrenderables.length-1]);
			}
			entity_system.fgrenderables[entity_system.fgrenderables.length-1].get_extdata();
		}
	loop();
});
/*
$("#changeToolBtn").click(function(){
	if(!editor_is_active) return;
	editor_tool++; editor_tool %= 3;
	if(editor_tool == 0)
		$("#toolname").text("Move");
	else if(editor_tool == 1)
		$("#toolname").text("Place");
	else if(editor_tool == 2)
		$("#toolname").text("Remove");
	else
		$("#toolname").text("Invalid");
});
*/

$("#changeInteractTypeBtn").click(function(){
	if(!editor_is_active) return;
	selected_layer++; selected_layer%=4; //renderables, entities, particles, fgrenderables.
	selectedEntity = 0;
	if(selected_layer == 0)
		$("#interact_type").text("Renderables");
	else if(selected_layer == 1)
		$("#interact_type").text("Entities");
	else if(selected_layer == 2)
		$("#interact_type").text("Particles");
	else if(selected_layer == 3)
		$("#interact_type").text("Foreground Renderables");
});

$("#toggleEditorBtn").click(function(){
	editor_is_active = !editor_is_active;
	if(editor_is_active){
		$("#modename").text("Editing");
		$("#devdetails").show();
		
		//Save the position of the screen.
		renderOffsetSaved_Gameplay = renderOffset;
		renderOffset = renderOffsetSaved_Editor;
		selectedEntity = 0;

	if(editor_tool == 0)
		$("#toolname").text("Move");
	else if(editor_tool == 1)
		$("#toolname").text("Place");
	else if(editor_tool == 2)
		$("#toolname").text("Remove");
	else
		$("#toolname").text("Invalid");

	if(selected_layer == 0)
		$("#interact_type").text("Renderables");
	else if(selected_layer == 1)
		$("#interact_type").text("Entities");
	else if(selected_layer == 2)
		$("#interact_type").text("Particles");
	else if(selected_layer == 3)
		$("#interact_type").text("Foreground Renderables");
	} else {
		$("#devdetails").hide();
		$("#modename").text("Gameplay");
		renderOffsetSaved_Editor = renderOffset;
		renderOffset = renderOffsetSaved_Gameplay;
		selectedEntity = 0;
	}
});

function preload(){
	dummy_img = loadImage('assets/aball.png');
	get_and_run('assets/preload_run.js');
}



function setup() {
	url = getURL();
	selectedEntity = 0;
	renderOffsetSaved_Editor = createVector(0,0);
	renderOffsetSaved_Gameplay = createVector(0,0);
	setup_hook();
	cnv.mousePressed(engine_onclick);
}

function engine_onclick(){
	if(!editor_is_active)
	{
		onclick_hook();
	}
	else {
		let active_array;
		if(selected_layer == 0)
			active_array = entity_system.renderables;
		else if(selected_layer == 1)
			active_array = entity_system.entities;
		else if(selected_layer == 2)
			active_array = entity_system.particles;
		else if(selected_layer == 3)
			active_array = entity_system.fgrenderables;
		for(let i = active_array.length-1; i > -1 ; i--){
			let active_elem = active_array[i];
			let screen_pos = active_elem.position.copy();
			screen_pos.sub(renderOffset);
			if(active_elem.boxdims.y > 0){
				if(
					mouseX < screen_pos.x + active_elem.boxdims.x &&
					mouseX > screen_pos.x - active_elem.boxdims.x &&
					mouseY < screen_pos.y + active_elem.boxdims.y &&
					mouseY > screen_pos.y - active_elem.boxdims.y
				){
					selectedEntity = active_elem;
					selected_i = i;
				}
			} else {
				if(
					mouseX < screen_pos.x + active_elem.boxdims.x &&
					mouseX > screen_pos.x - active_elem.boxdims.x &&
					mouseY < screen_pos.y + active_elem.boxdims.x &&
					mouseY > screen_pos.y - active_elem.boxdims.x
				){
					selectedEntity = active_elem;
					selected_i = i;
				}
			}
		}
	}
}

let engine_toggle_create = 0;

function draw() {
	if(!editor_is_active){
		entity_system.integrate();
		game_logic();
	} else {
		//editor logic goes here. TODO.
		if(editor_tool == 0)
			$("#toolname").text("Move");
		else if(editor_tool == 1)
			$("#toolname").text("Place");
		else if(editor_tool == 2)
			$("#toolname").text("Remove");
		if(!keyIsDown(SHIFT)){
			if(keyIsDown(UP_ARROW))	renderOffset.y -= 2.0;
			if(keyIsDown(RIGHT_ARROW))	renderOffset.x += 2.0;
			if(keyIsDown(DOWN_ARROW))	renderOffset.y += 2.0;
			if(keyIsDown(LEFT_ARROW))	renderOffset.x -= 2.0;
		} else {
			if(keyIsDown(UP_ARROW))	renderOffset.y -= 10.0;
			if(keyIsDown(RIGHT_ARROW))	renderOffset.x += 10.0;
			if(keyIsDown(DOWN_ARROW))	renderOffset.y += 10.0;
			if(keyIsDown(LEFT_ARROW))	renderOffset.x -= 10.0;
		}
		if(!keyIsDown(67)) {engine_toggle_create = 0;}
		if(keyIsDown(68)){selectedEntity = 0;}
		if(!engine_toggle_create && keyIsDown(67) && !selectedEntity){ //Immediately create an entity.
			engine_toggle_create = 1;
			let setup_func_name = "setup_" + $("#tileToPlace").val();
			let mass = parseFloat($("#mass").val());
			let r1 = parseFloat($("#radius1").val());
			let r2 = parseFloat($("#radius2").val());
			let frict = parseFloat($("#friction").val());
			let SpriteW = parseFloat($("#SpriteW").val());
			let SpriteH = parseFloat($("#SpriteH").val());
			let renderOffsetX = parseFloat($("#renderOffsetX").val());
			let renderOffsetY = parseFloat($("#renderOffsetY").val());
			let isPlayer = parseFloat($("#isPlayer").val());
			let vec = createVector(mouseX + renderOffset.x, 
									mouseY + renderOffset.y);
			let active_array;
			if(selected_layer == 0)
				{
					entity_system.addRenderable(
						vec,
						mass, r1, r2, frict, 
						SpriteW, SpriteH, renderOffsetX, renderOffsetY, isPlayer
					);
					//entity_system.renderables[entity_system.renderables.length - 1].sprite = eval(spritename);
					active_array = entity_system.renderables;
				}
			else if(selected_layer == 1)
				{
					entity_system.addEntity(
						vec,
						mass, r1, r2, frict, 
						SpriteW, SpriteH, renderOffsetX, renderOffsetY, isPlayer
					);
					//entity_system.entities[entity_system.entities.length - 1].sprite = eval(spritename);
					active_array = entity_system.entities;
				}
			else if(selected_layer == 2)
				{
					entity_system.addParticle(
											vec,
											mass, r1, r2, frict, 
											SpriteW, SpriteH, renderOffsetX, renderOffsetY, isPlayer
										);
					//entity_system.particles[entity_system.particles.length - 1].sprite = eval(spritename);
					active_array = entity_system.particles;
				}
			else if(selected_layer == 3){
				entity_system.addFgRenderable(
										vec,
										mass, r1, r2, frict, 
										SpriteW, SpriteH, renderOffsetX, renderOffsetY, isPlayer
									);
				//entity_system.fgrenderables[entity_system.fgrenderables.length - 1].sprite = eval(spritename);
				active_array = entity_system.fgrenderables;
			} else {
				console.log("INTERNAL ERROR!!!! Invalid selected layer.");
				return;
			}
			if(setup_func_name != "setup_nil"){
				eval(setup_func_name)(active_array[active_array.length - 1]);
			}
			editor_tool = 1;
		}
		if(selectedEntity && keyIsDown(77)){
			editor_tool = 0;
			selectedEntity.position.x = mouseX + renderOffset.x;
			selectedEntity.position.y = mouseY + renderOffset.y;
			let pf = parseFloat($("#PlaceFactor").val());
			//console.log(pf);
			if(pf > 0 && pf <= 10000){
				selectedEntity.position.x = pf * Math.floor(selectedEntity.position.x / pf);
				selectedEntity.position.y = pf * Math.floor(selectedEntity.position.y / pf);
			}
		}
		if(selectedEntity && keyIsDown(46) ){
			editor_tool = 2;
			if(selected_layer == 0){
				entity_system.removeRenderable(selected_i);
				selectedEntity = 0; selected_i = -1;
			}
			if(selected_layer == 1){
				entity_system.removeEntity(selected_i);
				selectedEntity = 0; selected_i = -1;
			}
			if(selected_layer == 2){
				entity_system.removeParticle(selected_i);
				selectedEntity = 0; selected_i = -1;
			}
			if(selected_layer == 3){
				entity_system.removeFgRenderable(selected_i);
				selectedEntity = 0; selected_i = -1;
			}
		}
	}
	entity_system.render();
}







/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			Engine code
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

<NOTE: this code can be re-used for other projects. Especially the collision detection code.>
*/


//Entity class
let Game_Entity = function(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy){
	this.position = position.copy();
	this.sprite = dummy_img;
	this.velocity = createVector(0,0);
	this.accel = createVector(0,0);
	this.mass = mass;
	this.boxdims = createVector(radius/2, radius2/2);
	this.spritew = spritew;
	this.spriteh = spriteh;
	this.renderoffx = renderoffx;
	this.renderoffy = renderoffy;
	this.friction = friction;
	//this.isPlayer = 0;
	this.ctor_name = "nil";
	this.extdata = {};
	this.set_extdata = function(){return;} //generate extdata from our members.
	this.get_extdata = function(obj){return;} //generate members from our extdata.
};

Game_Entity.prototype.serialize = function(){
	this.set_extdata();
	var export_data = {};
	export_data.pos_x = this.position.x.toString();
	export_data.pos_y = this.position.y.toString();
	export_data.boxdims_x = (this.boxdims.x*2).toString();
	export_data.boxdims_y = (this.boxdims.y*2).toString();
	export_data.mass = this.mass.toString();
	export_data.spritew = this.spritew.toString();
	export_data.spriteh = this.spriteh.toString();
	export_data.renderoffx = this.renderoffx.toString();
	export_data.renderoffy = this.renderoffy.toString();
	export_data.friction = this.friction.toString();
	//export_data.isPlayer = this.isPlayer.toString();
	export_data.ctor_name = this.ctor_name.toString();
	export_data.extdata = JSON.stringify(this.extdata);
	return JSON.stringify(export_data);
};

Game_Entity.prototype.integrate = function(){
	const entity_max_vel = 500; //CHANGE THIS
	this.velocity.add(this.accel);
	if(this.velocity.magSq() > entity_max_vel * entity_max_vel){
		//this.velocity.normalize(); this.velocity.mult(entity_max_vel);
		this.velocity.mult(0.99);
	}
	this.position.add(this.velocity);
	this.velocity.mult(this.friction);
};

Game_Entity.prototype.debug_render = function(){
	noStroke();
	if(selectedEntity == this)
		fill(0,255,0,100);
	else
		fill(255,255,0,100);
	{rectMode(CENTER);
		if(this.boxdims.y <= 0)
			ellipse(this.position.x - renderOffset.x, this.position.y - renderOffset.y, this.boxdims.x*2, this.boxdims.x*2);
		else
			rect(this.position.x - renderOffset.x, this.position.y - renderOffset.y, this.boxdims.x*2, this.boxdims.y*2);
	}
}

Game_Entity.prototype.render_internal = function(){
	let rpos = this.position.copy();
	rpos.sub(renderOffset);
	if(this.sprite)
		image(this.sprite, rpos.x + this.renderoffx - this.spritew/2, rpos.y  + this.renderoffy - this.spriteh/2, this.spritew, this.spriteh);
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
	this.fgrenderables = [];
};

ESystem.prototype.addEntity = function(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.entities.push(new Game_Entity(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy));
	this.entities[this.entities.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.addRenderable = function(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.renderables.push(new Game_Entity(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy));
	this.renderables[this.renderables.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.addFgRenderable = function(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.fgrenderables.push(new Game_Entity(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy));
	this.fgrenderables[this.renderables.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.addParticle = function(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy, isPlayer){
	this.particles.push(new Game_Entity(position, mass, radius, radius2, friction, spritew, spriteh, renderoffx, renderoffy))
	this.particles[this.particles.length - 1].isPlayer = isPlayer;
};

ESystem.prototype.removeEntity = function(i){
	this.entities.splice(i, 1);
};
ESystem.prototype.removeRenderable = function(i){
	this.renderables.splice(i, 1);
};
ESystem.prototype.removeFgRenderable = function(i){
	this.fgrenderables.splice(i, 1);
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
		if((selected_layer == 0) && editor_is_active){
			this.renderables[i].debug_render();
		}
	}
	for(let i = this.entities.length - 1; i>=0; i--){
		this.entities[i].render();
		if((selected_layer == 1) && editor_is_active){
			this.entities[i].debug_render();
		}
	}
	for(let i = this.particles.length - 1; i>=0; i--){
		this.particles[i].render();
		if((selected_layer == 2) && editor_is_active){
			this.particles[i].debug_render();
		}
	}
	for(let i = this.fgrenderables.length - 1; i>=0; i--){
		this.fgrenderables[i].render();
		if((selected_layer == 3) && editor_is_active){
			this.fgrenderables[i].debug_render();
		}
	}
}
