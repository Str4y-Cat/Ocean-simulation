import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import Stats from "stats.js" 
import * as Ocean from "./experience/Ocean"
import betterJONSWAP from './experience/JONSWAP'



//#region three.js base
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)
scene.background=new THREE.Color('#F9F6EE')
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
//#endregion


//
// My Stuff
//----------------------------------------------------------
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const gui = new GUI({ width: 340 })
const debugObject = {}

//create the parameters
const jonswap= new betterJONSWAP(20000,40);
let spectrumParams={
    ...jonswap.update(),
    windAngle: 0,    
    swellStrength: 0,
    pi : Math.PI,
}

const oceanHandler= Ocean.compute(renderer,scene,spectrumParams)
console.log(oceanHandler)

// const oceanSpectrum= new JONSWAP(20000,40);

// //NOTE: create a wrapper function, to hold different spectrum functions, as well as general parameters. 
// // h (height) is NOT part of the Jonswap funciton, but ive put it in for simplicity. Lets see if it becomes an issue
// let jonswapParams= oceanSpectrum.getSpectrumParameters()


// console.table(spectrumParams)

// //create the ocean spectrumm texture
// const spectrum= Ocean.createSpectrum(scene,spectrumParams)
// console.log(spectrum)

/**
 * TWEAKS
 */

const wavespectrumFolder= gui.addFolder('Wave Spectrum')
wavespectrumFolder.add(spectrumParams,"F",0,20000).name("Fetch").onChange((F)=>
{
    jonswap.values.F=F
    const temp = jonswap.update()
    spectrumParams.U=temp.U
    spectrumParams.a=temp.a
    spectrumParams.wp=temp.wp

    oceanHandler.updateParams(spectrumParams)
})

wavespectrumFolder.add(spectrumParams,"U",0,100).name("Wind Speed").onChange((U)=>
    {
        jonswap.values.U=U
        const temp = jonswap.update()
        spectrumParams.U=temp.U
        spectrumParams.a=temp.a
        spectrumParams.wp=temp.wp
        oceanHandler.updateParams(spectrumParams)


    })

wavespectrumFolder.add(spectrumParams,"Y",1,5).name("Peak Frequency").onChange((Y)=>
    {
        jonswap.Y=Y
        oceanHandler.updateParams(spectrumParams)
        
    })

wavespectrumFolder.add(spectrumParams,"h",0,40).name("Ocean Depth").onChange((h)=>
    {
        jonswap.h=h
        oceanHandler.updateParams(spectrumParams)
        
    })

wavespectrumFolder.add(jonswap.values,"spectralEnergyFactor",-0.075,1).name("spectral Energy Factor").onChange((x)=>
    {
        jonswap.update()
        spectrumParams.a=jonswap.values.a
        oceanHandler.updateParams(spectrumParams)

    })

const waveDirectionFolder= gui.addFolder('Wave Direction')

waveDirectionFolder.add(spectrumParams,"windAngle", -Math.PI, Math.PI,0.01).onChange(()=>
{
    spectrumParams.windAngle
    oceanHandler.updateParams(spectrumParams)

})

waveDirectionFolder.add(spectrumParams,"swellStrength", 0, 1,0.01).onChange(()=>
{
    spectrumParams.swellStrength
    oceanHandler.updateParams(spectrumParams)

})






//#region animate
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    //test animation
    // testSquare.rotation.y=elapsedTime/2
    // testSquare.rotation.x=elapsedTime/4

    // Update controls
    controls.update()

    //update the compute shader
    // updateOcean(elapsedTime)  
    oceanHandler.compute(elapsedTime)

    // Render
    renderer.render(scene, camera)
    stats.end()
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
