import * as THREE from 'three'
import * as OceanUtils from "./OceanUtils"

//compute
// import oceanVertexShader from '../Shaders/ocean/vertex.glsl'
// import initialSpectrum from '../Shaders/ocean/ocean_initital_spectrum.glsl'
// import gaussianFragment from '../Shaders/ocean/gaussianFragment.glsl'


export function testGaussianTexture(scene,position)
    {
        const geometry = new THREE.PlaneGeometry(1,1)
        
        const texture =  OceanUtils.gaussianTexture(64,64)

        const material = new THREE.MeshBasicMaterial(
            {
                map:texture,
                side:THREE.DoubleSide
            }
        )
        
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
    }

export function createWaveSpectrum()
{
    const initialTexture =  OceanUtils.gaussianTexture()
    initialTexture
    console.log(initialTexture)
    
}

export function setInitialSpectrumMaterial(){
    return testMaterial = new THREE.ShaderMaterial({
        vertexShader:oceanVertexShader,
        fragmentShader:initialSpectrum,
        uniforms:{
            u_wind:new THREE.Uniform(new THREE.Vector2(4.0, 2.0)),
            u_resolution:new THREE.Uniform(4),
            u_size:new THREE.Uniform(2),
        }
        // wireframe:true 
    })
}

export function setPhaseMaterial(){
    //create texture
    const width = 64;
    const height = 64;

    const size = width * height;
    const data = new Uint8Array( 4 * size );

    for ( let i = 0; i < size; i ++ ) {
        const stride = i * 4;
        data[ stride ] = 0;
        data[ stride + 1 ] = 0;
        data[ stride + 2 ] = 0;
        data[ stride + 3 ] = 0;
    }

    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture( data, width, height );
    texture.needsUpdate = true;

    return testMaterial = new THREE.ShaderMaterial({
                vertexShader:oceanVertexShader,
                fragmentShader:initialSpectrum,
                uniforms:{
                    "u_phases": { value: texture },
                    "u_deltaTime": { type: "f", value: null },
                    "u_resolution": { type: "f", value: null },
                    "u_size": { type: "f", value: null },
                }
            // wireframe:true 
            })
}