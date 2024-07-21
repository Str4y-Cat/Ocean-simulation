import * as THREE from 'three'
import Experience from "./Experiance"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Camera
{

    constructor(){
        this.experience= new Experience()
        this.sizes= this.experience.sizes
        this.scene= this.experience.scene
        this.canvas= this.experience.canvas

        // console.log("camera")

        this.setInstance()
        this.setOrbitControls()
    }

    setInstance()
    {
        // this.instance=new THREE.PerspectiveCamera(
        //     35,
        //     this.sizes.width/this.sizes.height,
        //     0.1,
        //     100
        // )
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
        this.instance.position.set(6, 4, 8)
        this.scene.add(this.instance)
    }

    setOrbitControls()
    {
        this.controls= new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping=true
    }

    resize()
    {
        // console.log("DEBUG: Resizing Camera")

        this.instance.aspect= this.sizes.width/this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        // console.log("DEBUG: Updating Camera")
        this.controls.update()
    }
}