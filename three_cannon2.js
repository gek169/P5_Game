

// three.js variables
let camera, scene, renderer
let mesh

// cannon.js variables
let world
let body
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

  // Box
  const geometry = new THREE.BoxBufferGeometry(2, 2, 2)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function initCannon() {
  world = new CANNON.World()

  // Box
  const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
  body = new CANNON.Body({
    mass: 1,
  })
  body.addShape(shape)
  body.angularVelocity.set(0, 10, 0)
  body.angularDamping = 0.5
  world.addBody(body)
}

function animate() {
  requestAnimationFrame(animate)

  // Step the physics world
  updatePhysics()

  // Copy coordinates from cannon.js to three.js
  mesh.position.copy(body.position)
  mesh.quaternion.copy(body.quaternion)

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

