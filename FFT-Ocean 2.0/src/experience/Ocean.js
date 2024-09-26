import * as THREE from 'three'
import JONSWAP from "./JONSWAP"
import * as Guassian from "./utils/guassian"
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

//imports
import gpgpuTestShader from "../shaders/gpgpu/test.glsl"

import spectrumVertex from "../shaders/spectrum/vertex.glsl"
import spectrumFragment from "../shaders/spectrum/fragment.glsl"

//compute
// import oceanVertexShader from '../Shaders/ocean/vertex.glsl'
// import initialSpectrum from '../Shaders/ocean/ocean_initital_spectrum.glsl'
// import gaussianFragment from '../Shaders/ocean/gaussianFragment.glsl'


    function testGaussianTexture(scene,position)
    {
        const geometry = new THREE.PlaneGeometry(1,1)
        
        const texture =  Guassian.get2DTexture(64,64)

        const material = new THREE.MeshBasicMaterial(
            {
                map:texture,
                side:THREE.DoubleSide
            }
        )
        
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
    }

    export function createSpectrum(scene,props )
    {
            //create jonswap class
            //gausian texture
            //run thr

            const texture=  Guassian.get2DTexture(256,256)
            console.log(texture)

            const geometry= new THREE.PlaneGeometry(1,1)
            const material= new THREE.ShaderMaterial({
                vertexShader: spectrumVertex,
                fragmentShader:spectrumFragment,
                side:THREE.DoubleSide,
                uniforms:
                {
                    F  :                    new THREE.Uniform(props.F ),
                    U  :                    new THREE.Uniform(props.U ),
                    g  :                    new THREE.Uniform(props.g ),
                    Y  :                    new THREE.Uniform(props.Y ),
                    a  :                    new THREE.Uniform(props.a ),
                    wp :                    new THREE.Uniform(props.wp),
                    h :                     new THREE.Uniform(props. h),
                    windAngle:              new THREE.Uniform(props.windAngle),
                    swellStrength:          new THREE.Uniform(props.swellStrength),
                    pi :                    new THREE.Uniform(props.pi),
                    uGaussianDistribution:  new THREE.Uniform(texture)
                }

            })

            const mesh = new THREE.Mesh(geometry,material)
            scene.add(mesh)
            return mesh
    }

    export function nameLater()
    {
        //figure out how to do multiple passes for the ping pong buffer thing
        //create the spectrum texture

        //1. create the random texture using random function of choice
        // IN THE GPGPU 
        // 1.  create the spectrum texture based on all your parameters
        // - - option to show spectrum texture
        // setSpectrum({props}, )

    }

    export function compute(renderer,scene)
    {
        //parameters to pass in
        let rez=256;
        



        //set up gpgpu
        const gpgpu= {}
        gpgpu.size= rez //square texture used to compute
        // const texture=  Guassian.get2DTexture(256,256)
        gpgpu.computation = new GPUComputationRenderer(gpgpu.size,gpgpu.size,renderer) //instanciate the gpgpu renderer

        //base texture
        const oceanTexture= gpgpu.computation.createTexture()
        console.log(oceanTexture.image.data)

        /**
         * Variable 1: I believe this is the shader pass. lets see
         */
        gpgpu.oceanSpectrumVariable = gpgpu.computation.addVariable("uSpectrum",gpgpuTestShader,oceanTexture) //create a variablein the shader we can acess the texture as "uSpectrum"


        // we want the data to persist so we need to reinject it.
        //note, i think for the spectrum we wont need to reinject it, as we're only making it once
        gpgpu.computation.setVariableDependencies(gpgpu.oceanSpectrumVariable,[ gpgpu.oceanSpectrumVariable ]) 
        

        gpgpu.computation.init()
        //do initial calculations


        //debug
        gpgpu.debug = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget(gpgpu.oceanSpectrumVariable).texture})
        )

        scene.add(gpgpu.debug)


        //returns update function to be called on tick
        return (elapsedTime)=>
        {
            //run the update function
            gpgpu.computation.compute()
        }
    }

    // export function compute()
    // {
    //     //set up gpgpu

    //     //do initial calculations


    //     //returns update function to be called on tick
    //     return (elapsedTime)=>
    //     {
    //         //run the update function
    //     }
    // }

    export function main(scene, params)
    {
        // testGaussianTexture(scene)
        // return createSpectrum(scene,params)


    }