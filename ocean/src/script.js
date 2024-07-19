import * as THREE from 'three'
import gsap from 'gsap'
import { CustomEase } from "gsap/CustomEase";
import { ExpoScaleEase } from "gsap/EasePack";


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
var random = gsap.utils.random(["sunset","sunset2","sunset3","sunset4","sunset5","sunset6","sunset7","clear","clouds1","clouds2"], true);
const path= random()

//textures
const cubeTextureLoader= new THREE.CubeTextureLoader()
const environmentMap= cubeTextureLoader.load([
    `/environments/${path}/px.png`,
    `/environments/${path}/nx.png`,
    `/environments/${path}/py.png`,
    `/environments/${path}/ny.png`,
    `/environments/${path}/pz.png`,
    `/environments/${path}/nz.png`,]
)


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background=environmentMap

console.log(scene.background)
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
// camera.position.x = 25
// camera.position.y = 24
// camera.position.z = 25
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

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
worldValues.amplitude=0.0;
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
        uOctaves:{value:32},
        uEnvironmentTexture:{value:environmentMap},
        uAmplitude:{value:worldValues.amplitude},
        uFrequency:{value:worldValues.frequency},
        uLacunarity:{value:worldValues.lacunarity},
        uGain:{value:worldValues.gain},
        uFresnelPow: new THREE.Uniform(5)

        
    }
}) 

gui.add(waterMaterial.uniforms.uOctaves,'value').min(1).max(64).step(1).name("Octaves")
gui.add(waterMaterial.uniforms.uAmplitude,'value').min(0).max(2).step(0.0001).name("Amplitude")
gui.add(waterMaterial.uniforms.uFrequency,'value').min(0).max(2).step(0.0001).name("Frequency")
gui.add(waterMaterial.uniforms.uLacunarity,'value').min(0).max(2).step(0.0001).name("Lacunarity")
gui.add(waterMaterial.uniforms.uGain,'value').min(0).max(2).step(0.0001).name("Gain")
gui.add(waterMaterial.uniforms.uFresnelPow,'value').min(0).max(10).step(0.0001).name("Fresnel Pow")


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


//gsap

camera.position.y=20
camera.rotation.x= -Math.PI/2 
camera.rotation.y= -0.17
gui.add(camera.rotation,'x').min(-6).max(6).step(0.01)
gui.add(camera.rotation,'y').min(-6).max(12).step(0.001)
gui.add(camera.rotation,'z').min(0).max(6).step(0.01)
gui.add(camera.position,'x').min(0).max(100).step(0.01).name('cameraPosition x')
gui.add(camera.position,'y').min(0).max(100).step(0.01).name('cameraPosition y')
gui.add(camera.position,'z').min(0).max(100).step(0.01).name('cameraPosition z')

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ExpoScaleEase,CustomEase);

// const moveLocation=()=>
//     {
//         //z=28
//         //y=3
//         gsap.to(camera.position,{
//             z:28,
//             duration:2.5,
//             ease: "sine.inOut",
            
//         })
//         gsap.to(camera.position,{
//             y:3,
//             // ease: "back.in(1.7)",
//             ease: CustomEase.create("custom", "M0,0 C0,0 0.045,-0.015 0.065,-0.028 0.107,-0.056 0.199,-0.168 0.242,-0.185 0.259,-0.192 0.282,-0.189 0.295,-0.182 0.309,-0.175 0.335,-0.146 0.347,-0.126 0.362,-0.102 0.386,-0.04 0.397,-0.007 0.41,0.029 0.428,0.1 0.44,0.154 0.466,0.279 0.549,0.573 0.59,0.687 0.7,1 0.814,1.074 0.94,1.024 1,1 1,1 1,1 "),
//             duration:2.5,
//         })

//     }
// debug.moveLocation=moveLocation
debug.reset=()=>{
    camera.rotation.x=-Math.PI/2 
    camera.position.z=0
    camera.position.y=20
}

    

// const rotateCamera=()=>
//     {
//         //x=0
//         gsap.to(camera.rotation,{
//             x:0,
//         })

//     }
    const letThereBeWaves=()=>
    {
        gsap.to(waterMaterial.uniforms.uAmplitude,{
            value:0.4,
            duration:3,
            
        })
        gsap.to(waterMaterial.uniforms.uFresnelPow,{
            value:0.6,
            duration:4,
        })
    }
    debug.showWaves=letThereBeWaves
    const move=()=>
        {
            gsap.to(waterMaterial.uniforms.uFresnelPow,{
                value:5,
                duration:5,
                ease: "power3.inOut",
            })
            gsap.to(camera.position,{
                z:28,
                duration:6,
                ease: "power2.inOut",
                
            })
            gsap.to(camera.position,{
                y:3,
                ease: "sine.inOut",
                // ease: CustomEase.create("custom", "M0,0 C0,0 0.045,-0.015 0.065,-0.028 0.107,-0.056 0.199,-0.168 0.242,-0.185 0.259,-0.192 0.282,-0.189 0.295,-0.182 0.309,-0.175 0.335,-0.146 0.347,-0.126 0.362,-0.102 0.386,-0.04 0.397,-0.007 0.41,0.029 0.428,0.1 0.44,0.154 0.466,0.279 0.549,0.573 0.59,0.687 0.7,1 0.814,1.074 0.94,1.024 1,1 1,1 1,1 "),
                duration:3,
            })

            gsap.to(camera.rotation,{
                ease: "power2.inOut",
                duration:4,
                x:0,
            })
        }
    debug.move=move
    gui.add(debug,'move')
    gui.add(debug,'reset')
    gui.add(debug,'showWaves')
// camera.rotation.y=3
// camera.rotation.x=2
// camera.rotation.z=3
// camera.rotation.y=3

// camera.rotation.set(0,3,0)
// camera.rotation.y=0


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
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()