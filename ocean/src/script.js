import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

import shadingVertexShader from './shaders/test/vertex.glsl'
import shadingFragmentShader from './shaders/test/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()
const worldValues = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
// const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 7
camera.position.y = 7
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
// renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.toneMappingExposure = 3
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)


// #region waves
//wave shader
worldValues.waveAngle1=0.279
worldValues.waveAngle2=1.238
worldValues.waveAngle3=0
worldValues.waveAngle4=0
const setAngle=(value)=>
    {
        return (new THREE.Vector2(Math.cos(value*Math.PI),Math.sin(value*Math.PI)))
    }
gui.add(worldValues,'waveAngle1').min(0).max(2).step(0.001).onChange(e=>
    {
        const angles= setAngle(worldValues.waveAngle1)
        waterMaterial.uniforms.uWaveAngle1.value=angles
    }
    )
gui.add(worldValues,'waveAngle2').min(0).max(2).step(0.001).onChange(e=>
    {
        const angles= setAngle(worldValues.waveAngle2)
        waterMaterial.uniforms.uWaveAngle2.value=angles
    }
    )
gui.add(worldValues,'waveAngle3').min(0).max(2).step(0.001).onChange(e=>
    {
        const angles= setAngle(worldValues.waveAngle3)
        waterMaterial.uniforms.uWaveAngle3.value=angles
    }
    )
gui.add(worldValues,'waveAngle4').min(0).max(2).step(0.001).onChange(e=>
    {
        const angles= setAngle(worldValues.waveAngle4)
        waterMaterial.uniforms.uWaveAngle4.value=angles
    }
    )


const waterGeometry = new THREE.PlaneGeometry(8, 8, 512, 512)


// Material


const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    // wireframe:true,
    uniforms:
    {
        uTime: { value: 0 },
        uWaveAngle1:{value: setAngle(0)},
        uWaveAngle2:{value: setAngle(0)},
        uWaveAngle3:{value: setAngle(0)},
        uWaveAngle4:{value: setAngle(0)}
        
    }
}) 


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

//#endregion

/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ffffff'

const material = new THREE.ShaderMaterial({
    vertexShader: shadingVertexShader,
    fragmentShader: shadingFragmentShader,
    // uniforms:
    // {
    //     uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
    // }
})

gui
    .addColor(materialParameters, 'color')
    .onChange(() =>
    {
        material.uniforms.uColor.value.set(materialParameters.color)
    })

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
    material
)
torusKnot.position.x = 3
torusKnot.position.y = 3
// scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
sphere.position.y =  3
// scene.add(sphere)

const docehedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(),
    material
)
// sphere.position.x = - 3
docehedron.position.y =  3
// scene.add(docehedron)


/**
 * light helpers
 */
// const directionalLightHelper= new THREE.Mesh(
//     new THREE.PlaneGeometry(),
//     new THREE.MeshBasicMaterial()
// )

// directionalLightHelper.material.color.setRGB(0.1,0.1,1)
// directionalLightHelper.material.side= THREE.DoubleSide
// directionalLightHelper.position.set(0,0,3)

// scene.add(directionalLightHelper)



const PointHelper= new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1,2),
    new THREE.MeshBasicMaterial()
)

PointHelper.material.color.setRGB(1,0.0,1)
// directionalLightHelper.material.side= THREE.DoubleSide
PointHelper.position.set(0,5,0)

scene.add(PointHelper)


// const directionalPointHelper2= new THREE.Mesh(
//     new THREE.IcosahedronGeometry(0.1,2),
//     new THREE.MeshBasicMaterial()
// )

// directionalPointHelper2.material.color.setRGB(0.1,1.0,0.5)
// // directionalLightHelper.material.side= THREE.DoubleSide
// directionalPointHelper2.position.set(2,2,2)

// scene.add(directionalPointHelper2)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    water.material.uniforms.uTime.value=elapsedTime

    // Rotate objects
    // if(suzanne)
    // {
    //     suzanne.rotation.x = - elapsedTime * 0.1
    //     suzanne.rotation.y = elapsedTime * 0.2
    // }

    sphere.rotation.x = - elapsedTime * 0.1
    sphere.rotation.y = elapsedTime * 0.2

    torusKnot.rotation.x = - elapsedTime * 0.1
    torusKnot.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()