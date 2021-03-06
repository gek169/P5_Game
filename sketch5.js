doCaustics=false;
let u = [];
let v = [];
let u_new = [];
let drop_amount = 10;




function get_and_run(theURL){
	var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", theURL, false ); //synchronous
		xmlHttp.send( null );
	let e = eval;
	e(xmlHttp.responseText);
}

function preload(){
	get_and_run('hdl.js');
}

//clamp to edges
function get_u( _x, _y) {
	let x = _x;
	let y = _y;
	if (x >= width) {
		x = width - 1;
	}
	if (x < 0) {
		x = 0;
	}
	if (y >= height) {
		y = height - 1;
	}
	if (y < 0) {
		y = 0;
	}
	return u[x][y];
}

function initFluid(){
	for(let i = 0; i < width; i++)
	for(let j = 0; j < height; j++)
	{
		u[i][j] = 0.0;
		u_new[i][j] = 0.0;
		v[i][j] = 0.0;
	}
}

$("#togglecaustics").click(function() {
	doCaustics = !doCaustics;
})

$("#dropAmount").oninput = function(){
	drop_amount = $("#dropAmount").value / 40.0;
	console.log("Detected Input!");
}


let toggle = false;
function droplet(){
	//return;
	let amount = drop_amount;
	toggle = !toggle;
	if(toggle) amount = -1 * drop_amount;

	u[
	Math.floor(
		Math.random() * (width-1)
	)
	][
	Math.floor(
		Math.random() * (height-1)
	)
	] += amount;
}

function float_to_char(f){
	if(f < 0.0) f = 0.0;
	if(f > 1.0) f = 1.0;
	f = Math.pow(f,0.2);
	return f * 255;
}

function vstep(){
	for(let i = 0; i < width; i++)
	for(let j = 0; j < height; j++)
	{
		v[i][j] += (get_u(i - 1, j) + 
				get_u(i + 1, j) + 
				get_u(i, j - 1) + 
				get_u(i, j + 1)) * 0.25 
				- get_u(i, j);
		v[i][j] *= 0.99;
		u_new[i][j] += v[i][j]
	
	}

	for(let i = 0; i < width; i++)
	for(let j = 0; j < height; j++){
		u[i][j] = u_new[i][j];
	}
}


function setup(){
	pixelDensity(1);
	createCanvas(600,600);

	for(let i = 0; i < width; i++){
		u[i] = new Array(height);
		v[i] = new Array(height);
		u_new[i] = new Array(height);
	}
	initFluid();
}

let counter = 15;
function draw(){
	clear();
	background(128);
	loadPixels();
		//TODO: render some shit
		counter--;
		
		vstep();
		//for(let i = 0; i < 10; i++) 
		if(counter == 0)
		{droplet();counter = 15;}
		if(!doCaustics)
		{
			for(let i = 0; i < width; i++)
				for(let j = 0; j < height; j++)
				{
					//For every pixel...
					pixels[i*4 + j*4*width + 0] = 128 + float_to_char((u_new[i][j]) * 10.0) / 2;;
					pixels[i*4 + j*4*width + 1] = 128 + float_to_char((u_new[i][j]) * 10.0) / 2;;
					pixels[i*4 + j*4*width + 2] = 255;
					pixels[i*4 + j*4*width + 3] = 255;
				}
		}
		else
		{
			for(let i = 0; i < width; i++)
			for(let j = 0; j < height; j++)
			{
				//Compute derivatives...
				let dx = get_u(i,j) - get_u(i+1,j);
				let dy = get_u(i,j) - get_u(i,j+1);

				//We are treating Z as height here...
				let xvec = createVector(1, 0, dx);
				let yvec = createVector(0, 1, dy);
				let vertvec = createVector(0,0,1);

				let deriv = xvec.cross(yvec);
				deriv.normalize();
				
				let val = deriv.dot(vertvec);
				val *= val;		//square for contrast
				val = 1 - val;  //invert it
				//val = Math.pow(val, 2)
				//val = 1 - val;
				//For every pixel...
				pixels[i*4 + j*4*width + 0] = float_to_char(val);
				pixels[i*4 + j*4*width + 1] = float_to_char(val);
				pixels[i*4 + j*4*width + 2] = float_to_char(val);
				pixels[i*4 + j*4*width + 3] = 255;
			}
		}
	updatePixels();
}
