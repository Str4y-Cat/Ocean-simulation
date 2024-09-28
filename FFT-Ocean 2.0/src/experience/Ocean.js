import * as THREE from 'three'
import JONSWAP from "./JONSWAP"
import * as Guassian from "./utils/guassian"
import betterJONSWAP from './JONSWAP'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

//imports
import gpgpuTestShader from "../shaders/gpgpu/test.glsl"

import pointVertexShader from "../shaders/points/vertex.glsl"
import pointFragmentShader from "../shaders/points/fragment.glsl"

import spectrumVertex from "../shaders/spectrum/vertex.glsl"
import spectrumFragment from "../shaders/spectrum/fragment.glsl"

import spectrumCompute from "../shaders/spectrum/spectrumCompute.glsl"

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

    export function createSpectrumTexture(gpgpu,randomTexture, props)
    {
        
        const uniforms=
        {
            uRandomDistribution: new THREE.Uniform(randomTexture),
            ...createUniforms(props)
        }
        console.log(uniforms)

        const spectrumPass = gpgpu.computation.createShaderMaterial( spectrumCompute,  uniforms  );
        // const inputTexture = gpgpu.computation.createTexture();
       
        //add the uniforms
        // spectrumPass.uniforms. = inputTexture;



        // const myRenderTarget = gpgpu.computation.createRenderTarget();
         let myRenderTarget = gpgpu.computation.createRenderTarget();
        


        // And compute the frame, before rendering to screen:
        // gpgpu.computation.doRenderTarget( spectrumPass, myRenderTarget );
        
        return (newProps)=>
        {
            
            if(newProps)
            {
                

                //reset the uniforms. loop through newProps and replace uniforms values
                for(const key in newProps)
                {
                    // console.log(key,newProps[key])
                    uniforms[key]=new THREE.Uniform(newProps[key])
                    // console.log(uniforms[key])
                    spectrumPass.uniforms[key]=uniforms[key]
                    // console.log(spectrumPass.uniforms[key])

                }

                // console.log('user made a change')
                // console.log(uniforms)
                // console.log(spectrumPass.uniforms)
                


                //doRenderTarget()

                
                

            }
            // myRenderTarget = gpgpu.computation.createRenderTarget();
            gpgpu.computation.doRenderTarget( spectrumPass, myRenderTarget );
            //return the texture
            return(myRenderTarget.texture)
        }
        
        // return myRenderTarget.texture;
    }


  

    export function compute(renderer,scene, props)
    {
        //parameters to pass in
        let rez=256;
        



        //set up gpgpu
        const gpgpu= {}
        gpgpu.size= rez //square texture used to compute
        
        gpgpu.computation = new GPUComputationRenderer(gpgpu.size,gpgpu.size,renderer) //instanciate the gpgpu renderer

        //base texture
        let oceanTexture= gpgpu.computation.createTexture()
        oceanTexture=  Guassian.gaussianTexture(256,oceanTexture)
        console.log(oceanTexture.image.data)

        /**
         * Variable 1: Create the ocean Spectrum
         */
        // gpgpu.oceanInitialVariable = gpgpu.computation.addVariable("uRandom",gpgpuTestShader,oceanTexture) //create a variablein the shader we can acess the texture as "uSpectrum"
        
        // Uniforms
        // gpgpu.oceanInitialVariable.material.uniforms.uTime = new THREE.Uniform(0)

        // we want the data to persist so we need to reinject it.
        //note, i think for the spectrum we wont need to reinject it, as we're only making it once
        // gpgpu.computation.setVariableDependencies(gpgpu.oceanInitialVariable,[ gpgpu.oceanInitialVariable ]) 

        /**
         * Variable 2: spectrum
         */
        // gpgpu.oceanSpectrumVariable = gpgpu.computation.addVariable("uSpectrum",gpgpuTestShader,oceanTexture) //create a variablein the shader we can acess the texture as "uSpectrum"
        // gpgpu.computation.setVariableDependencies(gpgpu.oceanInitialVariable,[ gpgpu.oceanInitialVariable ]) 
        


        const spectrumCreator= createSpectrumTexture(gpgpu,oceanTexture,props);
        const texture= spectrumCreator({F:5, U:10})

        // gpgpu.computation.init()
        //do initial calculations



        //debug
        // gpgpu.debug = new THREE.Mesh(
        //     new THREE.PlaneGeometry(1,1),
        //     new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget(gpgpu.oceanInitialVariable).texture})
        // )
        gpgpu.debug = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:texture})
        )

        scene.add(gpgpu.debug)

        return {
            updateParams: (props)=>
            {
                spectrumCreator(props)
            },

            compute: (elapsedTime)=>
            {
                //run the update function
                gpgpu.computation.compute()
                gpgpu.oceanInitialVariable.material.uniforms.uTime = new THREE.Uniform(elapsedTime)
            }
        }

        //returns update function to be called on tick
        return (elapsedTime)=>
        {
            //run the update function
            gpgpu.computation.compute()
            gpgpu.oceanInitialVariable.material.uniforms.uTime = new THREE.Uniform(elapsedTime)

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




/**UTILITIES
 * 
 * 
 */

function createUniforms(obj)
    {
        const uniforms= {}
        for (const key in obj)
        {
            uniforms[key]=new THREE.Uniform(obj[key])
        }
        return uniforms
    }

    function testPoints(size){
        const pointGeometry=new THREE.BufferGeometry()
        pointGeometry.setDrawRange(0,size**2)


        const particlesUvArray= new Float32Array(size*size*2)
        //uvs
        for(let y =0; y<size;y++)
        {
            for(let x =0; x<size; x++)
            {
                const i = y* gpgpu.size +x
                const i2= i*2

                //particles
                const uvX = (x+0.5)/size 
                const uvY = (y+0.5)/size

                particlesUvArray[i2 * 0] = uvX;
                particlesUvArray[i2 * 1] = uvY;
            }
        }

        pointGeometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUvArray, 2))
        // material

        const material = new THREE.ShaderMaterial({

            vertexShader:pointVertexShader,
            fragmentShader:pointFragmentShader,
        })
        
        //create the mesh
        const mesh = new THREE.Points(pointGeometry,material)
        
        
        // return mesh
        return mesh
    }


    //DEBUG
    function debug(gui,originalProps,updateFunction)
    {
        const debugValues={...originalProps}

        const waveDirectionFolder= gui.addFolder('Wave Direction')

        waveDirectionFolder.add(spectrumParams,"windAngle", -Math.PI, Math.PI,0.01).onChange(()=>
        {
            spectrum.material.uniforms.windAngle.value=spectrumParams.windAngle

        })

        waveDirectionFolder.add(spectrumParams,"swellStrength", 0, 1,0.01).onChange(()=>
        {
            spectrum.material.uniforms.swellStrength.value=spectrumParams.swellStrength

        })
    }   