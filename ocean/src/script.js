import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {directionTexture} from './utils/TextureMaker'

// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

import shadingVertexShader from './shaders/test/vertex.glsl'
import shadingFragmentShader from './shaders/test/fragment.glsl'

import envVertexShader from './shaders/environment/vertex.glsl'
import envFragmentShader from './shaders/environment/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()
const worldValues = {}
const debug={}
//textures
const cubeTextureLoader= new THREE.CubeTextureLoader()
const environmentMap= cubeTextureLoader.load([
    '/environments/sunset6/px.png',
    '/environments/sunset6/nx.png',
    '/environments/sunset6/py.png',
    '/environments/sunset6/ny.png',
    '/environments/sunset6/pz.png',
    '/environments/sunset6/nz.png',]
)

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background=environmentMap
// scene.fog = new THREE.Fog(new THREE.Color('#ffffff'),1,2);


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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 200)
camera.position.x = 25
camera.position.y = 24
camera.position.z = 25
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

//wave direction
const preferedDirection=0.0
const directions=directionTexture(preferedDirection,2,64)


console.log(directions)
const coneGeometry = new THREE.ConeGeometry( 0.1, 1, 3 ); 
const coneMaterial = new THREE.MeshBasicMaterial( {color: "red"} );
const cone = new THREE.Mesh(coneGeometry, coneMaterial ); 
// scene.add( cone );
cone.position.y=3;
// cone.rotation.x=2
// cone.rotation.z=2

cone.rotateX(Math.PI/2)
cone.rotateZ(-Math.PI/2)

// cone.rotateX(Math.PI/2)
cone.rotation.z=(preferedDirection*-Math.PI)-Math.PI/2
// cone.rotateX



const waterGeometry = new THREE.PlaneGeometry(64, 64, 512, 512)


// Material
worldValues.amplitude=0.4;
worldValues.frequency=0.1;
worldValues.lacunarity=0.72;
worldValues.gain=1.18;

const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    side:THREE.DoubleSide,
    // wireframe:true,
    uniforms:
    {
        uTime: { value: 0 },
        uDirection:{value:directions},
        uEuler:{value:Math.E},
        uOctaves:{value:1},
        uEnvironmentTexture:{value:environmentMap},
        uAmplitude:{value:worldValues.amplitude},
        uFrequency:{value:worldValues.frequency},
        uLacunarity:{value:worldValues.lacunarity},
        uGain:{value:worldValues.gain},

        
    }
}) 

gui.add(waterMaterial.uniforms.uOctaves,'value').min(1).max(64).step(1).name("Octaves")
gui.add(waterMaterial.uniforms.uAmplitude,'value').min(0).max(2).step(0.0001).name("Amplitude")
gui.add(waterMaterial.uniforms.uFrequency,'value').min(0).max(2).step(0.0001).name("Frequency")
gui.add(waterMaterial.uniforms.uLacunarity,'value').min(0).max(2).step(0.0001).name("Lacunarity")
gui.add(waterMaterial.uniforms.uGain,'value').min(0).max(2).step(0.0001).name("Gain")


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
const water2 = new THREE.Mesh(waterGeometry, waterMaterial)
const water3 = new THREE.Mesh(waterGeometry, waterMaterial)
// const water4 = new THREE.Mesh(waterGeometry, waterMaterial)
// const water5 = new THREE.Mesh(waterGeometry, waterMaterial)
// const water = new THREE.Mesh(waterGeometry, new THREE.MeshBasicMaterial({color:'red'}))
// water.position.y+=10
water.rotation.x = - Math.PI * 0.5
water2.position.z-=32
water2.rotation.x = - Math.PI * 0.5

water3.position.z-=64
water3.rotation.x = - Math.PI * 0.5

// water4.position.z-=32
// water4.rotation.x = - Math.PI * 0.5

// water5.position.z+=32
// water5.rotation.x = - Math.PI * 0.5


scene.add(water,water2,water3)

const waterPlaneFolder= gui.addFolder('water Plane')
// water.position.x+=1
console.log(water.position.y)
waterPlaneFolder.add(water.position,'y').min(0).max(100).step(0.001)
waterPlaneFolder.add(water.position,'x').min(0).max(6).step(0.001)
// waterPlaneFolder.add(water.rotation,'z').min(0).max(6).step(0.001)
// waterPlaneFolder.add(water.rotation,'y').min(2*Math.PI).max(2*Math.PI).step(0.001)
// waterPlaneFolder.add(water.rotation,'z').min(2*Math.PI).max(2*Math.PI).step(0.001)

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

const sphereMirror = new THREE.Mesh(
    new THREE.SphereGeometry(),
    new THREE.ShaderMaterial({
        vertexShader: shadingVertexShader,
        fragmentShader: shadingFragmentShader,
        uniforms:
        {
            uEnvironment: new THREE.Uniform(environmentMap),
        }
    })
)
// sphereMirror.position.x = - 3
sphereMirror.position.y =  3
sphereMirror.visible=false
debug.sphere=false
gui.add(debug,'sphere').onChange(bool=>
{
    if(bool)
    {
        sphereMirror.visible=true
    }
    else{
        sphereMirror.visible=false
    }
}
)
scene.add(sphereMirror)

const docehedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(),
    material
)
// sphere.position.x = - 3
docehedron.position.y =  3
docehedron.visible=false
scene.add(docehedron)


/**
 * light helpers
 */

const axisHelper= new THREE.AxesHelper()
axisHelper.visible=false
scene.add(axisHelper)
debug.axis=false
gui.add(debug,'axis').onChange(bool=>
{
    if(bool)
    {
        axisHelper.visible=true
    }
    else{
        axisHelper.visible=false
    }
}
)


const PointHelper= new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1,2),
    new THREE.MeshBasicMaterial()
)

PointHelper.material.color.setRGB(1,1,1)
// directionalLightHelper.material.side= THREE.DoubleSide
PointHelper.position.set(0,5,0)

scene.add(PointHelper)
debug.oco=false
gui.add(debug,'oco').onChange(bool=>
{
    if(bool)
    {
        docehedron.visible=true
        // scene.add(PointHelper)
    }
    else{
        // console.log('removing')
        docehedron.visible=false

        // scene.remove(PointHelper)
        // scene.matrixWorldNeedsUpdate=true
    }
}
)

// const directionalPointHelper2= new THREE.Mesh(
//     new THREE.IcosahedronGeometry(0.1,2),
//     new THREE.MeshBasicMaterial()
// )

// directionalPointHelper2.material.color.setRGB(0.1,1.0,0.5)
// // directionalLightHelper.material.side= THREE.DoubleSide
// directionalPointHelper2.position.set(2,2,2)

// scene.add(directionalPointHelper2)


// //#region environment map

// // geometry
// var envGeometry = new THREE.OctahedronGeometry(100, 5);

// // material
// var envMaterial = new THREE.ShaderMaterial({
    
//     side: THREE.DoubleSide,
//     uniforms: {
//         uEnvironment: {
//             value: environmentMap
//         }
//     },
//     vertexShader: envVertexShader,
//     fragmentShader: envFragmentShader,
// });

// // mesh
// const envMesh = new THREE.Mesh(envGeometry, envMaterial);
// scene.add(envMesh);

// //#endregion




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

    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()