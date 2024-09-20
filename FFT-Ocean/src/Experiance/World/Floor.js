import * as THREE from 'three'

import Experience from "../Experiance";
import fragmentShader from '../Shaders/FloorPatterns/Dots/fragment.glsl'
// import fragmentShader from '../Shaders/FloorPatterns/Squares/fragment.glsl'
import vertexShader from '../Shaders/FloorPatterns/vertex.glsl'

export default class Floor
{
    constructor()
    {
        this.experience= new Experience()
        this.scene= this.experience.scene
        this.resources= this.experience.resources
        this.sizes= this.experience.sizes
        this.debug= this.experience.debug

        //Debug
        if(this.debug.active)
            {
                this.debugFolder=this.debug.ui.addFolder("Test Floor")
            }

        //setUp
        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()

        console.log(this.sizes.pixelRatio)
    }

    setDebug(){

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