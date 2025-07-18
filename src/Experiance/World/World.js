import * as THREE from "three";
import gsap from "gsap";

import Experience from "../Experiance";
import Environment from "./Environment";
import Ocean from "./Ocean";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;

    //this.setLoadingManager();

    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    //this.sssObject = new SubSurfaceObject();

    this.resources.on("start", () => {
      //console.log("resources are starting to load");
    });
    this.resources.on("progress", (arg) => {
      //console.log("progress", arg);
      //console.log("resources are progressing", progress);
    });
    this.resources.on("ready", () => {
      this.environment = new Environment();
      this.ocean = new Ocean();
      this.experience.animations.transitionIn();
    });

    this.setAnnimations();
    //Setup
  }

  //setEvents()

  update() {
    if (this.ocean) this.ocean.update();
    //if (this.text) this.text.update();
  }

  destroy() {
    this.environment;
    this.ocean;
    this.lighthouse;
    this.stars;
  }

  setAnnimations() {
    const transitionIn = () => {
      gsap.from(this.ocean.uniforms.ocean.uAmplitude, {
        value: 0,
        duration: 3,
        ease: "power2.inOut",
        // delay: 3,
      });
      gsap.to(this.camera.position, {
        z: -9,
        duration: 7,
        ease: "power2.inOut",
        delay: 3,
      });
      gsap.to(this.camera.position, {
        x: 0,
        duration: 7,
        ease: "power2.inOut",
        delay: 3,
      });
      gsap.to(this.camera.position, {
        y: 1.5,
        ease: "sine.inOut",
        duration: 5,
        delay: 3,
      });
    };

    this.experience.animations = {
      transitionIn,
    };
  }
}
