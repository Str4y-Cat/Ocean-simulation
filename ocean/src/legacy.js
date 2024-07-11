import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

import Stats from 'three/examples/jsm/libs/stats.module.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const worldValues = {}

const stats= new Stats()
document.body.appendChild( stats.dom );

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(8, 8, 512, 512)


//wave shader
worldValues.waveAngle1=0
worldValues.waveAngle2=0
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


// Material



// const waterMaterial = new THREE.ShaderMaterial({
//     vertexShader: waterVertexShader,
//     fragmentShader: waterFragmentShader,
//     // wireframe:true,
//     uniforms:
//     {
//         uTime: { value: 0 },
//         uWaveAngle1:{value: setAngle(0)},
//         uWaveAngle2:{value: setAngle(0)},
//         uWaveAngle3:{value: setAngle(0)},
//         uWaveAngle4:{value: setAngle(0)}
        
//     }
// })


    

// Mesh
// const water = new THREE.Mesh(waterGeometry, waterMaterial)
// water.rotation.x = - Math.PI * 0.5
// scene.add(water)


//helper
const axisHelper= new THREE.AxesHelper(4)
scene.add(axisHelper)

// const testGeometry= new THREE.SphereGeometry(0.02)
// const testMaterial= new THREE.MeshBasicMaterial({color:'red'})
// for(let i=0; i<4;i+=0.2)
// {
//     const testMaterial= new THREE.MeshBasicMaterial({color:'red'})

//     const mesh= new THREE.Mesh(testGeometry,testMaterial)
//     mesh.position.x=i
//     if(Math.round(i*10)/10%1==0)
//     {
//         mesh.material.color.set(new THREE.Color('yellow'))
//     }
//     scene.add(mesh)
// }

const lightHelperGeometry= new THREE.SphereGeometry(0.1)
const lightHelperMaterial= new THREE.MeshBasicMaterial({color:'white'})
const lightHelperMesh= new THREE.Mesh(lightHelperGeometry,lightHelperMaterial)
lightHelperMesh.position.set(0.0,4.0,-3.0)
scene.add(lightHelperMesh)


/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ffffff'

const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    
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
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(),
    material
)
sphere.position.x = - 3
scene.add(sphere)

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
camera.position.set(0, 3, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.toneMapping=THREE.ACESFilmicToneMapping
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin();
    const elapsedTime = clock.getElapsedTime()

    // Helpers
    // normalPlaneHelper.rotation.x=(elapsedTime)
    // normalHelper.rotation.x=(elapsedTime)
    // normalHelper.rotation.y=(elapsedTime*0.2)

    // normalOcoHelper.rotation.y=(elapsedTime*0.2)
    // normalOcoHelper.rotation.x=(elapsedTime)

    // Water
    // waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    stats.end();
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()