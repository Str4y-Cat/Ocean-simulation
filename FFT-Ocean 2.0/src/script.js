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
let oceanParams= oceanSpectrum.getSpectrumParameters()

console.table(oceanParams)



const spectrum= Ocean.createSpectrum(scene,oceanParams)
console.log(spectrum)

gui.add(oceanParams,"F",0,20000).name("Fetch").onChange((F)=>
{
    oceanSpectrum.setFetch(F)
    const temp = oceanSpectrum.getSpectrumParameters()
    oceanParams.U=temp.U
    oceanParams.a=temp.a
    oceanParams.wp=temp.wp

    spectrum.material.uniforms.F.value=oceanParams.F
    spectrum.material.uniforms.a.value=oceanParams.a
    spectrum.material.uniforms.wp.value=oceanParams.wp


})

gui.add(oceanParams,"U",0,100).name("Wind Speed").onChange((U)=>
    {
        oceanSpectrum.setWindSpeed(U)
        const temp = oceanSpectrum.getSpectrumParameters()
        oceanParams.U=temp.U
        oceanParams.a=temp.a
        oceanParams.wp=temp.wp

        spectrum.material.uniforms.U.value=oceanParams.U
        spectrum.material.uniforms.a.value=oceanParams.a
        spectrum.material.uniforms.wp.value=oceanParams.wp

    })

gui.add(oceanParams,"Y",1,5).name("Peak Frequency").onChange((Y)=>
    {
        oceanSpectrum.Y=Y
        spectrum.material.uniforms.Y.value=oceanParams.Y
        
    })

gui.add(oceanSpectrum,"spectralEnergyFactor",-0.075,1).name("spectral Energy Factor").onChange((x)=>
    {
        oceanSpectrum.setDynamicValues()
        oceanParams.a=oceanSpectrum.a
        spectrum.material.uniforms.a.value=oceanParams.a

        
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