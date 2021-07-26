import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
// gui.hide()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * utils funs
 */
const changeCursor = ()=>{
    let elementToChange = document.getElementsByTagName("body")[0];
    elementToChange.style.cursor = 'pointer'
}

const reChangeCursor = ()=>{
    let elementToChange = document.getElementsByTagName("body")[0];
    elementToChange.style.cursor = 'default'
}

debugObject.envMapIntensity = 5
let objectsToTest = []
let currentIntersect = null

const catchIfMouseClickOrHover = (intersects) => {
    if(intersects.length){
        currentIntersect = intersects[0]
        changeCursor()
    }
    else{
        currentIntersect = null
        reChangeCursor()
    }
}

const updateAllMaterials = ()=>{
    scene.traverse((child)=>{
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = envMap
            child.material.side = THREE.DoubleSide
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true

            child.castShadow = true
            child.receiveShadow = true

            objectsToTest.push(child)
        }
    })
}
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

/**
 * Mouse
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(2.25, 13.7, - 4.5)

//handling shadow
directionalLight.castShadow = true
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 25
directionalLight.shadow.mapSize.set(1024, 1024)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 50).max(50).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 50).max(50).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 50).max(50).step(0.001).name('lightZ')

/**
 * raycasters
 */
const raycaster = new THREE.Raycaster()

/**
 * loaders
 */
const envMapLoader = new THREE.CubeTextureLoader()
const envMap = envMapLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])
envMap.encoding = THREE.sRGBEncoding
scene.environment = envMap
scene.background = envMap

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let action = null

gltfLoader.load(
    '/models/worn_out_pokeball/scene.gltf',  ///models/FlightHelmet/glTF/FlightHelmet.gltf
    (gltf)=>{
        //pokeball
        gltf.scene.scale.set(3, 3, 3)
        gltf.scene.position.set(0, - 3, 0)
        gltf.scene.rotation.y = -0.7
        scene.add(gltf.scene)

        // gltf.scene.scale.set(3,3,3)
        // gltf.scene.position.set(0, -3, 0)
        // scene.add(gltf.scene)

        console.log(gltf);

        mixer = new THREE.AnimationMixer(gltf.scene)
        action = mixer.clipAction(gltf.animations[0])
        action.play()
        action.paused  = true

        updateAllMaterials()
        gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('rotation')
        gui.add(gltf.scene.rotation, 'z').min(- Math.PI).max(Math.PI).step(0.001).name('rotation')
        gui.add(gltf.scene.scale,'x').min(-50).max(50).step(0.001)
        gui.add(gltf.scene.scale,'y').min(-50).max(50).step(0.001)
        gui.add(gltf.scene.scale,'z').min(-50).max(50).step(0.001)
    }
)
//catch whether mouse click the ball or not
window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        if(action.isRunning()){
            action.paused = true
        }else{
            action.paused = false
            action.enabled = true
        }   
    }
})
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-13.3, 0.7,  7.24)
camera.rotation.set(0,0,0)
scene.add(camera)

gui.add(camera.position,'x').min(-50).max(50).step(0.001)
gui.add(camera.position,'y').min(-50).max(50).step(0.001)
gui.add(camera.position,'z').min(-50).max(50).step(0.001)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true //shadows true
//optimize to become realistic
renderer.physicallyCorrectLights = true //make lights colur to realistic light
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3

gui
    .add(renderer,'toneMapping',{
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(()=>{
        renderer.toneMapping = Number(renderer.toneMapping)
        updateAllMaterials()
    })

gui.add(renderer,'toneMappingExposure').min(0).max(10).step(0.001).name('ToneMapping Exposure')

const clock = new THREE.Clock()
let currentTime = 0

/**
 * Animate
 */
const tick = () =>
{ 
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - currentTime
    currentTime = elapsedTime

    // Update controls
    controls.update()

    //raycaster
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(objectsToTest)
    catchIfMouseClickOrHover(intersects)

    //gltf animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }



    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()