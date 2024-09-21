import * as THREE from 'three'
import JONSWAP from "./JONSWAP"
import * as Guassian from "./utils/guassian"

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

    export function createSpectrum(scene,{ F , U , g , Y , a , wp, pi} )
    {
            //create jonswap class
            //gausian texture
            //run thr

            const texture=  Guassian.get2DTexture(215,215)
            console.log(texture)

            const geometry= new THREE.PlaneGeometry(1,1)
            const material= new THREE.ShaderMaterial({
                vertexShader: spectrumVertex,
                fragmentShader:spectrumFragment,
                side:THREE.DoubleSide,
                uniforms:
                {
                    F  : new THREE.Uniform(F ),
                    U  : new THREE.Uniform(U ),
                    g  : new THREE.Uniform(g ),
                    Y  : new THREE.Uniform(Y ),
                    a  : new THREE.Uniform(a ),
                    wp : new THREE.Uniform(wp),
                    pi : new THREE.Uniform(pi),
                    uGaussianDistribution: new THREE.Uniform(texture)
                }

            })

            const mesh = new THREE.Mesh(geometry,material)
            scene.add(mesh)
            return mesh
    }

    export function main(scene, params)
    {
        // testGaussianTexture(scene)
        // return createSpectrum(scene,params)
    }