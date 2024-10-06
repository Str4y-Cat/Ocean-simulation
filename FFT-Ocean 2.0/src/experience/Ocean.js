import * as THREE from 'three'
import JONSWAP from "./JONSWAP"
import * as Guassian from "./utils/guassian"
import betterJONSWAP from './JONSWAP'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'

//imports
import gpgpuTestShader from "../shaders/gpgpu/test.glsl"

import computeFFT from '../shaders/utils/fft.glsl'

import pointVertexShader from "../shaders/points/vertex.glsl"
import pointFragmentShader from "../shaders/points/fragment.glsl"

import spectrumVertex from "../shaders/spectrum/vertex.glsl"
import spectrumFragment from "../shaders/spectrum/fragment.glsl"

import spectrumCompute from "../shaders/spectrum/spectrumCompute.glsl"
import complexConjugateCompute from "../shaders/spectrum/complexConjugateCompute.glsl"
import waveData from "../shaders/spectrum/waveData.glsl"
import computeDxDy_Phase from "../shaders/phase/DxDy_Phase.glsl"
import computeDyxDxx_Phase from "../shaders/phase/DyxDxx_Phase.glsl"

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

        //set up the shader pass #1, initial spectrum
        const spectrumPass = gpgpu.computation.createShaderMaterial( spectrumCompute,  uniforms  );
        let renderTarget = gpgpu.computation.createRenderTarget();

        //shader pass 2, add the complex conjugate
        const initialAndConjugatePass = gpgpu.computation.createShaderMaterial( complexConjugateCompute,{initialSpectrumTexture:{value:null}}  );
        initialAndConjugatePass.uniforms.initialSpectrumTexture.value = renderTarget.texture;
        const outputRenderTarget = gpgpu.computation.createRenderTarget();

        //set up the wave data pass
        const waveDataPass = gpgpu.computation.createShaderMaterial( waveData,  {g:uniforms.g, h: uniforms.h}  );
        let waveDataRenderTarget = gpgpu.computation.createRenderTarget();

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
            gpgpu.computation.doRenderTarget( initialAndConjugatePass, outputRenderTarget );

            gpgpu.computation.doRenderTarget( waveDataPass, waveDataRenderTarget );

            

            return[
                outputRenderTarget.texture,
                waveDataRenderTarget.texture
            ]
            // return(renderTarget.texture)
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
        randomDispersionTexture=  Guassian.gaussianTexture(rez,randomDispersionTexture)
        console.log(randomDispersionTexture.image.data)

        //create the spectrum texture
        const spectrumCreator = createSpectrumTexture(gpgpu,randomDispersionTexture,props);
        const [initalSpectrum, waveDataTexture] = spectrumCreator()

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
       
        const DxDy_PhaseTexture = gpgpu.computation.createTexture();
        const DyxDxx_PhaseTexture = gpgpu.computation.createTexture();

        const displacementTexture = gpgpu.computation.createTexture();
        const derivativesTexture = gpgpu.computation.createTexture();
        

        gpgpu.DxDyVariable  = gpgpu.computation.addVariable('phaseTexture', computeDxDy_Phase, DxDy_PhaseTexture)
        gpgpu.DyxDxxVariable  = gpgpu.computation.addVariable('phaseTexture', computeDyxDxx_Phase, DyxDxx_PhaseTexture)

        gpgpu.displacementVariable  = gpgpu.computation.addVariable('displacementTexture', computeFFT, derivativesTexture)
        gpgpu.computation.setVariableDependencies( gpgpu.displacementVariable, [ gpgpu.displacementVariable, gpgpu.DxDyVariable ] );  


        gpgpu.DxDyVariable.material.uniforms.uTime=new THREE.Uniform(0)
        gpgpu.DxDyVariable.material.uniforms.waveDataTexture=new THREE.Uniform(waveDataTexture)
        gpgpu.DxDyVariable.material.uniforms.h0kTexture=new THREE.Uniform(initalSpectrum)

        gpgpu.DyxDxxVariable.material.uniforms.uTime=new THREE.Uniform(0)
        gpgpu.DyxDxxVariable.material.uniforms.waveDataTexture=new THREE.Uniform(waveDataTexture)
        gpgpu.DyxDxxVariable.material.uniforms.h0kTexture=new THREE.Uniform(initalSpectrum)

        // gpgpu.displacementVariable.material.uniforms.u_transformSize= rez;
        // gpgpu.displacementVariable.material.uniforms.u_subtransformSize=


        gpgpu.computation.init()
        //do initial calculations


        const updateFFT =  renderSpectrumFFT(gpgpu, rez )


        //debug
        // gpgpu.debug = new THREE.Mesh(
        //     new THREE.PlaneGeometry(1,1),
        //     new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget(gpgpu.phaseVariable).texture})
        // )
        
        gpgpu.debug = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:initalSpectrum})
        )

        scene.add(gpgpu.debug)

        gpgpu.debug2 = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:waveDataTexture})
        )
        gpgpu.debug2.position.x-=1.1;

        scene.add(gpgpu.debug2)

        gpgpu.debug3 = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget( gpgpu.DxDyVariable ).texture})
        )
        gpgpu.debug3.position.x+=1.1;

        scene.add(gpgpu.debug3)

        gpgpu.debug4 = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial({map:gpgpu.computation.getCurrentRenderTarget( gpgpu.DyxDxxVariable ).texture})
        )
        gpgpu.debug4.position.x+=1.1;
        gpgpu.debug4.position.y-=1.1;

        scene.add(gpgpu.debug4)

        gpgpu.debug5 = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.MeshBasicMaterial()
        )
        gpgpu.debug5.position.x+=2.2;
        

        scene.add(gpgpu.debug5)

        return {
            updateParams: (props)=>
            {
                spectrumCreator(props)
            },

            compute: (elapsedTime)=>
            {
                //run the update function
                gpgpu.DyxDxxVariable.material.uniforms.uTime = new THREE.Uniform(elapsedTime)
                gpgpu.DxDyVariable.material.uniforms.uTime = new THREE.Uniform(elapsedTime)
                gpgpu.computation.compute()

                // const texture=
                gpgpu.debug5.material.map = updateFFT(gpgpu.computation.getCurrentRenderTarget( gpgpu.DyxDxxVariable ).texture)
                // gpgpu.debug5.material.map= gpgpu.computation.getCurrentRenderTarget( gpgpu.DyxDxxVariable ).texture
            }
        }
    }

    function renderSpectrumFFT(gpgpu,rez) {

        //variables
        //resolution 
        //oceanHorizontal   
        //oceanVertical
    
        //could refactor this to only be one shader material. ADD/REMOVE the horizontal part dynamically
        const oceanHorizontal = gpgpu.computation.createShaderMaterial( "#define HORIZONTAL \n" + computeFFT, { inputTexture: { value: null }, u_subtransformSize:{value: null} } );
        const oceanHorizontalPong = gpgpu.computation.createShaderMaterial( "#define HORIZONTAL \n" + computeFFT, { inputTexture: { value: null }, u_subtransformSize:{value: null} } );
        const oceanVertical = gpgpu.computation.createShaderMaterial(   computeFFT, { inputTexture: { value: null } , u_subtransformSize:{value: null} } );

        oceanHorizontal.uniforms.u_transformSize = new THREE.Uniform(rez);
        oceanVertical.uniforms.u_transformSize = new THREE.Uniform(rez);
    
        const renderTarget = gpgpu.computation.createRenderTarget();
        const renderTargetPong = gpgpu.computation.createRenderTarget();
    
        // GPU FFT using Stockham formulation
        // const iterations = Math.log2( rez ) * 2; // log2
        const iterations = Math.log2( rez ) * 2; // log2
        
        // this.scene.overrideMaterial = oceanHorizontal;
        // var subtransformProgram = oceanHorizontal;
        
        // Processus 0-N
        // material = materialOceanHorizontal
        // 0 : material( spectrumFramebuffer ) > pingTransformFramebuffer
        
        // i%2==0 : material( pongTransformFramebuffer ) > pingTransformFramebuffer
        // i%2==1 : material( pingTransformFramebuffer ) > pongTransformFramebuffer
        
        // i == N/2 : material = materialOceanVertical
        
        // i%2==0 : material( pongTransformFramebuffer ) > pingTransformFramebuffer
        // i%2==1 : material( pingTransformFramebuffer ) > pongTransformFramebuffer
        
        // N-1 : materialOceanVertical( pingTransformFramebuffer / pongTransformFramebuffer ) > displacementMapFramebuffer
        
        // var frameBuffer;
        // var inputBuffer;
        return (startTexture)=>
        {
            oceanHorizontal.uniforms.u_input = new THREE.Uniform(startTexture);
            oceanHorizontalPong.uniforms.u_input = new THREE.Uniform(renderTarget.texture);
            

            // oceanVertical.uniforms.u_input = new THREE.Uniform(renderTarget.texture);

            for (var i = 0; i < iterations; i++) {
                // if (i === 0) {
                //     inputBuffer = this.spectrumFramebuffer;
                //     frameBuffer = this.pingTransformFramebuffer ;
                // } 
                // else if (i === iterations - 1) {
                //     inputBuffer = ((iterations % 2 === 0)? this.pingTransformFramebuffer : this.pongTransformFramebuffer) ;
                //     frameBuffer = this.displacementMapFramebuffer ;
                // }
                // else if (i % 2 === 1) {
                //     inputBuffer = this.pingTransformFramebuffer;
                //     frameBuffer = this.pongTransformFramebuffer ;
                // }
                // else {
                //     inputBuffer = this.pongTransformFramebuffer;
                //     frameBuffer = this.pingTransformFramebuffer ;
                // }
                
                // if (i === iterations / 2) {
                //     subtransformProgram = this.materialOceanVertical;
                //     this.scene.overrideMaterial = this.materialOceanVertical;
                // }
                
                // subtransformProgram.uniforms.u_input.value = inputBuffer;
                // subtransformProgram.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations / 2) + 1 )); //set the uniform subtransform
                // this.renderer.render(this.scene, this.oceanCamera, frameBuffer); //compute
    
               
                
                //horizontal
                if(i< iterations/2)
                {
                    
                    oceanHorizontal.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations / 2) + 1 )); //set the uniform subtransform
                    
                    //compute the horizontal texture, save the texture back into itself
                    if(i===0)
                    {
                    gpgpu.computation.doRenderTarget( oceanHorizontal, renderTarget );

                    // const texture= renderTarget.texture;
                    // oceanHorizontal.uniforms.u_input.value = texture;
                    // oceanHorizontal.uniforms.u_input.value = renderTargetPong.texture


                    }
                    else{
                        //odd
                        if(i%2!=0)
                        {
                            gpgpu.computation.doRenderTarget( oceanHorizontalPong, renderTargetPong );

                        }
                        else{
                            gpgpu.computation.doRenderTarget( oceanHorizontal, renderTarget );

                        }
                    }
                    //first itteration uses a predefined input texture, then it sets the inputTexture tot the rendered texture target
                    
                }
    
                //vertical
                else
                {
                    oceanVertical.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations / 2) + 1 )); //set the uniform subtransform
                    //compute the vertical texture, save the texture back into itself
                    gpgpu.computation.doRenderTarget( oceanVertical, renderTarget );
                }
            }
            //return the final texture
            
            return renderTarget.texture
        }
        
        
    };

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