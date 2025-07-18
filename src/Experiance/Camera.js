import * as THREE from "three";
import Experience from "./Experiance";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Camera {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

    // console.log("camera")

    this.setInstance();
    this.setOrbitControls();

    //Debug
    if (this.debug.active) {
      this.setDebug();
    }
  }

  setInstance() {
    // this.instance=new THREE.PerspectiveCamera(
    //     35,
    //     this.sizes.width/this.sizes.height,
    //     0.1,
    //     100
    // )
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100,
    );
    this.instance.position.set(0, 5, -5);

    //this.instance.rotation.x += -Math.PI / 2;
    this.instance.rotation.x = 0;

    this.previousPosition = new THREE.Vector3(0, 0, 0);
    this.previousPosition.copy(this.instance);

    // console.log()
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
    const target = new THREE.Vector3(0, 2, 0);
    // const target = new THREE.Vector3(0, 5, -20);
    this.controls.target = target;
  }

  resize() {
    // console.log("DEBUG: Resizing Camera")

    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Camera");

    this.debugFolder
      .add(this.instance.position, "x")
      .listen(true)
      .min(-40)
      .max(40)
      .step(0.01)
      .name("X Position");

    this.debugFolder
      .add(this.instance.position, "y")
      .listen(true)
      .min(-10)
      .max(10)
      .step(0.01)
      .name("Y Position");

    this.debugFolder
      .add(this.instance.position, "z")
      .listen(true)
      .min(-40)
      .max(40)
      .step(0.01)
      .name("Z Position");
  }

  update() {
    // if (!this.instance.position.equals(this.previousPosition)) {
    //     this.instance.lookAt(new THREE.Vector3(0, 0, 0));
    //     this.previousPosition.copy(this.instance.position);
    // }
    // console.log("DEBUG: Updating Camera")
    if (this.controls) {
      this.controls.update();
    }
  }
}
