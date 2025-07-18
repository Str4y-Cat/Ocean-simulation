import * as THREE from "three";

import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import sources from "./sources";
import Debug from "./Utils/Debug";
import Raycaster from "./Utils/Raycaster";

//convert to singleton
let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) {
      //console.log("returning the singleton");
      return instance;
    }
    instance = this;

    //global access
    window.experience = this;

    //options
    this.canvas = canvas;

    //setUp
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();

    this.resources = new Resources(sources);

    // this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.init();
    this.raycaster = new Raycaster();

    this.setFog();
  }

  resize() {
    // console.log("resizing")
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    if (this.debug.active) {
    }
    // console.log('update the experiance')
    this.raycaster.update();
    this.camera.update();
    this.world.update();
    this.renderer.update();

    if (this.debug.active) {
    }
  }

  init() {
    //sizes resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    //Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  setFog() {
    //this.scene.fog = new THREE.Fog("#", 30, 70);
  }

  destroy() {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    //this.camera.controls.dispose();
    this.renderer.instance.dispose();
    if (this.debug.active) {
      this.debug.ui.destroy();
    }

    this.sizes.off("resize");
    this.time.off("tick");
    this.raycaster.destroy();
    //optionsn
    this.canvas = null;

    //setUp
    // this.debug = null;
    // this.sizes = null;
    // this.time = null;
    // this.scene = null;
    //
    this.resources.dispose();
    // this.resources = null;
    //
    // // this.resources =null;
    // this.camera = null;
    // this.renderer = null;
    // this.world = null;
    //
    instance = null;
    //console.log(this);
    window.experience = null;
  }
}
