import * as THREE from 'three'

import Experience from "../Experiance";
import OceanUtils from '../Utils/OceanUtils';
// import fragmentShader from '../Shaders/FloorPatterns/Dots/fragment.glsl'
import fragmentShader from '../Shaders/FloorPatterns/Squares/fragment.glsl'
import vertexShader from '../Shaders/FloorPatterns/vertex.glsl'

//compute
import oceanVertexShader from '../Shaders/ocean/vertex.glsl'
// import initialSpectrum from '../Shaders/ocean/ocean_initital_spectrum.glsl'
import gaussianFragment from '../Shaders/ocean/gaussianFragment.glsl'



export default class Ocean
{
    constructor()
    {
        this.experience= new Experience()
        this.scene= this.experience.scene
        this.resources= this.experience.resources
        this.sizes= this.experience.sizes
        this.debug= this.experience.debug
        this.oceanUtils= new OceanUtils()

        //Debug
        if(this.debug.active)
            {
                this.debugFolder=this.debug.ui.addFolder("Ocean")
            }

        //setUp
        // this.setGeometry()
        // this.setMaterial()
        // this.setMesh()
        // this.setInitialSpectrumMaterial()
        // this.setSpectrumMaterial()
        this.setGaussianTexture()
        this.setTestPlane()
    }

    setDebug(){

    }

    setGaussianTexture(){
        
        const texture= this.oceanUtils.gaussianTexture(64,64)

        this.testMaterial = new THREE.ShaderMaterial({
            vertexShader:oceanVertexShader,
            fragmentShader:gaussianFragment,
            uniforms:{
                uTexture: { value: texture },
                
            }
            // wireframe:true 
        })
    }

    setSpectrumMaterial(){
        this.oceanUtils.getJONSWAP(2*Math.PI*0.2)
    }

    setInitialSpectrumMaterial(){
        this.testMaterial = new THREE.ShaderMaterial({
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

    setPhaseMaterial(){
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

        this.testMaterial = new THREE.ShaderMaterial({
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

    setTestPlane(){
        const material= this.testMaterial

        const geometry= new THREE.PlaneGeometry(2,2,64,64)
        const mesh= new THREE.Mesh(geometry,material)
        mesh.position.y= 2;
        this.scene.add(mesh)
    }

    setGeometry()
    {
        this.geometry= new THREE.PlaneGeometry(200,200)
    }

    setTextures()
    {
        return null
    }

    setMaterial()
    {
        this.material= new THREE.ShaderMaterial({
            vertexShader:vertexShader,
            fragmentShader:fragmentShader,
            uniforms:
            {
                uColor: new THREE.Uniform(new THREE.Color("#ffffff")),
                uResolution:new THREE.Uniform( new THREE.Vector2(this.sizes.width*this.sizes.pixelRatio,this.sizes.height*this.sizes.pixelRatio))

            }
        })

        
    }

    setMesh()
    {
        this.mesh=new THREE.Mesh(this.geometry,this.material)
        this.mesh.rotation.x=-Math.PI *0.5
        this.mesh.recieveShadow=true
        console.log(this.mesh)
        console.log(this.mesh.recieveShadow)

        this.scene.add(this.mesh)
    }

}