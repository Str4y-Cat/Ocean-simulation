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

    /**
     * Creates the initial spectrum texture
     * 
     * @param {*} gpgpu 
     * @param {*} randomTexture 
     * @param {*} props 
     * @returns returns a function that returns the texture if called without parameters, and updates the texture if called with parameters
     */
    export function createSpectrumTexture(gpgpu,randomTexture, props)
    {
        //set up the uniforms
        const uniforms=
        {
            uRandomDistribution: new THREE.Uniform(randomTexture),
            ...createUniforms(props)
        }
        console.log(uniforms)

        //set up the shader pass
        const spectrumPass = gpgpu.computation.createShaderMaterial( spectrumCompute,  uniforms  );

        let renderTarget = gpgpu.computation.createRenderTarget();


        return (newProps)=>
        {
            
            if(newProps)
            {
                //updates the uniforms of the shader
                for(const key in newProps)
                {
                    uniforms[key]=new THREE.Uniform(newProps[key])
                    spectrumPass.uniforms[key]=uniforms[key]
                }
            }

            //render the texture to the rendertarget
            gpgpu.computation.doRenderTarget( spectrumPass, renderTarget );


            return(renderTarget.texture)
        }
        
    }

    //TODO: lets clean this up aswell
    export function compute(renderer,scene, props)
    {
        //parameters to pass in
        let rez=256;
        



        //set up gpgpu
        const gpgpu= {}
        gpgpu.size= rez //square texture used to compute
        
        gpgpu.computation = new GPUComputationRenderer(gpgpu.size,gpgpu.size,renderer) //instanciate the gpgpu renderer

        /**
         * CREATE THE INITIAL SPECTRUM TEXTURE
         * done once, recomputed on parameter change. Hopefully atleast
         */

        //create the random texture. In our case a gaussian distribution
        let randomDispersionTexture= gpgpu.computation.createTexture()
        randomDispersionTexture=  Guassian.gaussianTexture(256,randomDispersionTexture)
        console.log(randomDispersionTexture.image.data)

        //create the spectrum texture
        const spectrumCreator = createSpectrumTexture(gpgpu,randomDispersionTexture,props);
        const spectrumTexture = spectrumCreator()

        /**
         * CREATE THE UPDATING COMPUTE SHADERS
         * 
         * Goal:
         * - create a sequence of variables that will follow on from each other. 
         * 
         * - create spectrum that is shifted by the phase (move the spectrun forward in time)
         * - create the derivatives and displacement passes
         * - combine the displacement and derivatives
         * - add lighting, not sure if this needs to be a pass
         */
       
        const phaseTexture = gpgpu.computation.createTexture();
        const displacementTexture = gpgpu.computation.createTexture();
        const derivativesTexture = gpgpu.computation.createTexture();
        

        gpgpu.phaseVariable  = gpgpu.computation.addVariable('texturePhase', gpgpuTestShader, phaseTexture)

        // gpgpu.displacementVariable = gpgpu.computation.addVariable('textureDisplacement', displacementFragment, displacementTexture)
        // gpgpu.derivativesVariable  = gpgpu.computation.addVariable('textureDerivatives' , derivativeFragment  , derivativesTexture)

        // gpgpu.computation.setVariableDependencies(gpgpu.displacementVariable,[gpgpu.phaseVariable])
        // gpgpu.computation.setVariableDependencies(gpgpu.displacementVariable,[gpgpu.phaseVariable])

        gpgpu.phaseVariable.material.uniforms.utime=new THREE.Uniform(0)
        gpgpu.phaseVariable.material.uniforms.uSpectrumTexture= new THREE.Uniform(spectrumTexture)

        gpgpu.computation.init()
        //do initial calculations



        //debug
        gpgpu.debug = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget(gpgpu.phaseVariable).texture})
        )
        
        // gpgpu.debug = new THREE.Mesh(
        //     new THREE.PlaneGeometry(1,1),
        //     new THREE.MeshBasicMaterial({map:spectrumTexture})
        // )

        scene.add(gpgpu.debug)

        return {
            updateParams: (props)=>
            {
                spectrumCreator(props)
            },

            compute: (elapsedTime)=>
            {
                //run the update function
                gpgpu.phaseVariable.material.uniforms.uTime = new THREE.Uniform(elapsedTime)
                gpgpu.computation.compute()
            }
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