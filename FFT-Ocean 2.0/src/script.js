import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as Ocean from "./experience/Ocean"
import JONSWAP from "./experience/JONSWAP"

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
const gui = new GUI({ width: 340 })
const debugObject = {}

const oceanSpectrum= new JONSWAP(20000,40);
//NOTE: create a wrapper function, to hold different spectrum functions, as well as general parameters. 
// h (height) is NOT part of the Jonswap funciton, but ive put it in for simplicity. Lets see if it becomes an issue
let jonswapParams= oceanSpectrum.getSpectrumParameters()

let spectrumParams={
    F  : jonswapParams.F ,       
    U  : jonswapParams.U ,       
    g  : jonswapParams.g , 
    Y  : jonswapParams.Y , 
    a  : jonswapParams.a , 
    wp : jonswapParams.wp, 
    h  : jonswapParams.h,
    windAngle: 0,    
    swellStrength: 0,
    pi : Math.PI,
}
console.table(spectrumParams)


const spectrum= Ocean.createSpectrum(scene,spectrumParams)
console.log(spectrum)

const wavespectrumFolder= gui.addFolder('Wave Spectrum')
wavespectrumFolder.add(spectrumParams,"F",0,20000).name("Fetch").onChange((F)=>
{
    oceanSpectrum.setFetch(F)
    const temp = oceanSpectrum.getSpectrumParameters()
    spectrumParams.U=temp.U
    spectrumParams.a=temp.a
    spectrumParams.wp=temp.wp

    spectrum.material.uniforms.F.value=spectrumParams.F
    spectrum.material.uniforms.a.value=spectrumParams.a
    spectrum.material.uniforms.wp.value=spectrumParams.wp


})

wavespectrumFolder.add(spectrumParams,"U",0,100).name("Wind Speed").onChange((U)=>
    {
        oceanSpectrum.setWindSpeed(U)
        const temp = oceanSpectrum.getSpectrumParameters()
        spectrumParams.U=temp.U
        spectrumParams.a=temp.a
        spectrumParams.wp=temp.wp

        spectrum.material.uniforms.U.value=spectrumParams.U
        spectrum.material.uniforms.a.value=spectrumParams.a
        spectrum.material.uniforms.wp.value=spectrumParams.wp

    })

wavespectrumFolder.add(spectrumParams,"Y",1,5).name("Peak Frequency").onChange((Y)=>
    {
        oceanSpectrum.Y=Y
        spectrum.material.uniforms.Y.value=spectrumParams.Y
        
    })

wavespectrumFolder.add(spectrumParams,"h",0,2000).name("Ocean Depth").onChange((h)=>
    {
        oceanSpectrum.h=h
        // console.log(spectrumParams)
        spectrum.material.uniforms.h.value=spectrumParams.h
        
    })

wavespectrumFolder.add(oceanSpectrum,"spectralEnergyFactor",-0.075,1).name("spectral Energy Factor").onChange((x)=>
    {
        oceanSpectrum.setDynamicValues()
        spectrumParams.a=oceanSpectrum.a
        spectrum.material.uniforms.a.value=spectrumParams.a

        
    })


const waveDirectionFolder= gui.addFolder('Wave Direction')

waveDirectionFolder.add(spectrumParams,"windAngle", -Math.PI, Math.PI,0.01).onChange(()=>
{
    spectrum.material.uniforms.windAngle.value=spectrumParams.windAngle

})

waveDirectionFolder.add(spectrumParams,"swellStrength", 0, 1,0.01).onChange(()=>
{
    spectrum.material.uniforms.swellStrength.value=spectrumParams.swellStrength

})

//#region animate
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //test animation
    // testSquare.rotation.y=elapsedTime/2
    // testSquare.rotation.x=elapsedTime/4

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

//#endregion