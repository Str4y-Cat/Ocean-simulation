import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from "lil-gui"
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import BOIDS from 'three-boids'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/Addons.js'

console.log(BOIDS)
//#region three.js

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


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

    // Materials
    // particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 18)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
//#endregion




//test geometry 
const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(17,3,0.5),
    new THREE.MeshStandardMaterial({wireframe:true})
)

scene.add(testCube)

//create a boundning box and new boids instance
const box = new THREE.Box3(new THREE.Vector3(-10,-5,-10),new THREE.Vector3(10,5,10))
const boids = new BOIDS(scene,box)

//initiate the boid simulation
boids.setParams(
    {
        visualRange:0.75046, 
        protectedRange:0.38377,
        enviromentVision:0.5,
        objectAvoidFactor:1,
        cohesionFactor:0.00206, 
        matchingFactor:0.02993, 
        seperationFactor:0.22342, 
        minSpeed:3.977, 
        maxSpeed:5.206, 
        turnFactor:0.201
    }
)
boids.initBoids(40)

//add a mesh for the boids
const geometry=new THREE.SphereGeometry(0.1)
// geometry.rotateX(-Math.PI * 0.5);
const mesh= new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:"yellow"}))
boids.setModelMesh(mesh,2)

//initiate the boids vision and add objects to avoid
boids.initVision()


const gui= new GUI()
boids.addDebug(gui)

boids.addEnvironmentObjects([testCube],true)

// font
const fontLoader= new FontLoader()
fontLoader.load(
    "fonts/helvetiker_regular.typeface.json",
    (font)=>
    {
        const textGeometry= new TextGeometry(
            "Leo Kamhoot",
            {
                font:font,
                size:2,
                height:0.4,
                curveSegments: 12,
                // bevelEnabled:true,
                // bevelThickness:0.03,
                // bevelSize:0.02,
                // bevelOffset:0,
                // bevelSegments:3
            }
        )
        // const textFolder= gui.addFolder('Text')
        // console.log(textGeometry)
        // textFolder.add(textGeometry,'size').min(0).max(2).step(0.001)
        textGeometry.center()

        // const textMaterial= new THREE.MeshBasicMaterial()
        const textMaterial= new THREE.MeshStandardMaterial(
            {
                color: "#fffff",
                metalness: 0.5,
                roughness: 0.5,
                // emissive:new THREE.Color('#ffffff'),
                // emissiveIntensity:0.1
            }
        )
        // const textFolder= gui.addFolder('Text')
        // textFolder.addColor(debug,'textColor').onChange(color=>{textMaterial.color=new THREE.Color(color)})

        // textFolder.add(textMaterial,'metalness').min(0).max(1).step(0.001)
        // textFolder.add(textMaterial,'roughness').min(0).max(1).step(0.001)
        // gui.add(textMaterial,"wireframe")
        const textMesh= new THREE.Mesh(textGeometry,textMaterial)
        scene.add(textMesh)
        // textMesh.position.y=3
        // textMesh.position.z=20
        // textMesh.position.z=5

        // const environmentObject= testCube



    }
)

// boids.
// boids.addEnvironmentObjects([environmentObject],true)

//within your tick function, update the simulation





/**
 * Lights
 */
const ambient = new THREE.AmbientLight('#ffffff',1)
// scene.add(ambient)
const lightArray= []
const objectArray=[]
const glow={
    geometry:new THREE.SphereGeometry(1),
    material:new THREE.ShaderMaterial(
        {
            side:THREE.BackSide,
            vertexShader:particlesVertexShader,
            fragmentShader:particlesFragmentShader,
            transparent:true,
            depthWrite:false,
            blending:THREE.AdditiveBlending,
            uniforms:
            {
                uColor: new THREE.Uniform(new THREE.Color("#fff000")),
                uIntensity: new THREE.Uniform(1)
            }
    
        })
}

const blackOut={
    geometry:new THREE.SphereGeometry(0.1),
    material:new THREE.MeshBasicMaterial({color:'#000000',transparent:true,})
} 

for(let i= 0; i<40;i++)
{

    const pointLight = new THREE.PointLight(new THREE.Color("#fff000"),1)
    const offset= Math.random()
    scene.add(pointLight)


    const glowObj=new THREE.Mesh(glow.geometry,new THREE.ShaderMaterial(
        {
            side:THREE.BackSide,
            vertexShader:particlesVertexShader,
            fragmentShader:particlesFragmentShader,
            transparent:true,
            depthWrite:false,
            blending:THREE.AdditiveBlending,
            uniforms:
            {
                uColor: new THREE.Uniform(new THREE.Color("#fff000")),
                uIntensity: new THREE.Uniform(1)
            }
    
        }))
    const blackOutObj=new THREE.Mesh(blackOut.geometry,new THREE.MeshBasicMaterial({color:'#000000',transparent:true,}))
    // console.log(glowObj,blackOut)
    objectArray.push({})
    lightArray.push({light:pointLight, offset,glow:glowObj, blackOut:blackOutObj })
    scene.add(glowObj,blackOutObj)

}
// const pointlightHelper= new THREE.PointLightHelper(pointLight,0.2,new THREE.Color("#fdf34"))



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor('#000000')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// const boidPositions = boids.getBoidArray()
// console.log(boidPositions)
/**
 * Animate
 */
const clock = new THREE.Clock()
let past= 0
const tick = () =>
{
    const elapsedTime= clock.getElapsedTime()
    const deltaTime= elapsedTime-past
    past = elapsedTime
    // console.log(deltaTime)
    // Update controls
    const boidPositions = boids.getBoidArray()

    controls.update()
    // const intesityArray= new Float32Array(lightArray.length)
    let intensity
    lightArray.forEach((obj,i)=>{
         intensity=  Math.max(0,Math.sin(elapsedTime*obj.offset-0.5))
        obj.light.position.set(...boidPositions[i].position)
        obj.light.intensity=intensity

        obj.glow.position.set(...boidPositions[i].position)
        obj.glow.material.uniforms.uIntensity.value=intensity
        // obj.blackOut.position.set(...boidPositions[i].position)
        // obj.blackOut.material.opacity=1-intensityk;
        // console.log(intensity)
        // intesityArray[i]=intensity
        
    })
    // console.log("=============================================")


    boids.update(elapsedTime,deltaTime)


    // pointLight.position.x= Math.sin(elapsedTime)*3
    // pointLight.position.z= Math.cos(elapsedTime)*3

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()