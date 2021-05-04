

// three.js variables
let camera, scene, renderer
let meshBox
let meshSphere
let meshPlane

// cannon.js variables
let world
let body
let body2
let plane_body
const timeStep = 1 / 60
let lastCallTime

initThree()
initCannon()
animate()

function initThree() {
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100)
  camera.position.z = 5

  // Scene
  scene = new THREE.Scene()

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize)
	{
		const skyColor = 0xB1E1FF;  // light blue
		const groundColor = 0xB97A20;  // brownish orange
		const intensity = 1;
		const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		scene.add(light);
 	}
	// Box
	{
		const geometry = new THREE.SphereGeometry(2, 20, 20);
		//const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
		const material = new THREE.MeshPhongMaterial({
		 color: 0xFFFFFF,    // red (can also use a CSS color string here)
		 flatShading: false,
		});
		meshSphere = new THREE.Mesh(geometry, material);
		scene.add(meshSphere);
	}
	{
		const geometry = new THREE.BoxGeometry(2, 2, 2);
		//const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
		const material = new THREE.MeshPhongMaterial({
		 color: 0xFFFFFF,    // red (can also use a CSS color string here)
		 flatShading: false,
		});
		meshBox = new THREE.Mesh(geometry, material);
		scene.add(meshBox);
	}
	{
		const geometry = new THREE.BoxGeometry(200, 1, 200);
		//const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
		const material = new THREE.MeshPhongMaterial({
		 color: 0xaaFFaa,    // red (can also use a CSS color string here)
		 flatShading: true,
		});
		meshPlane = new THREE.Mesh(geometry, material);
		scene.add(meshPlane);
	}
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function initCannon() {
	world = new CANNON.World()
	//world.gravity = 

	// Box
	{
	let shape=
	new 
		CANNON.Box(new CANNON.Vec3(1, 1, 1))
		body = new CANNON.Body({
		  mass: 1,
		})
		body.addShape(shape)
		body.angularVelocity.set(0, 100, 0)
		body.angularDamping = 0.5
		body.material = new CANNON.Material();
		body.material.friction = 500;
		world.addBody(body)
	}
	{
		const shape = new CANNON.Sphere(2)
		body2 = new CANNON.Body({
		  mass: 1000,
		})
		body2.addShape(shape)
		body2.angularVelocity.set(0, 100, 0)
		body2.angularDamping = 0.5
		body2.position.y = 2.5
		body2.friction = 0.95
		world.addBody(body2)
	}
	{
		const shape = new CANNON.Box(new CANNON.Vec3(200, 1, 200))
		plane_body = new CANNON.Body({
		  mass: 000,
		})
		plane_body.addShape(shape)
		plane_body.angularVelocity.set(0, 100, 0)
		plane_body.angularDamping = 0.5
		plane_body.position.y = -8
		plane_body.friction = 0.95
		world.addBody(plane_body)
	}
}

function animate() {
  requestAnimationFrame(animate)

  // Step the physics world
  updatePhysics()

  // Copy coordinates from cannon.js to three.js
  meshBox.position.copy(body.position)
  meshBox.quaternion.copy(body.quaternion)
  meshSphere.position.copy(body2.position)
  meshSphere.quaternion.copy(body2.quaternion)
  meshPlane.position.copy(plane_body.position)
  meshPlane.quaternion.copy(plane_body.quaternion)
  render()
}

function updatePhysics() {
  const time = performance.now() / 1000
  if (!lastCallTime) {
    world.step(timeStep)
  } else {
    const dt = time - lastCallTime
    world.step(timeStep, dt)
  }
  lastCallTime = time
}

function render() {
  renderer.render(scene, camera)
}

