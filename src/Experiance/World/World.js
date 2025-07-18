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
    const start = () => {
      // gsap.to(this.material.uniforms.uAmplitude, {
      //     value: 0.4,
      //     duration: 3,
      // });
      // gsap.to(this.material.uniforms.uFresnelPow, {
      //
      //     value: 0.6,
      //     duration: 4,
      // });
    };

    const transitionIn = () => {
      gsap.to(this.camera.position, {
        z: 20,
        duration: 7,
        ease: "power2.inOut",
      });
      gsap.to(this.camera.position, {
        x: 0,
        duration: 7,
        ease: "power2.inOut",
      });
      gsap.to(this.camera.position, {
        y: 5.5,
        ease: "sine.inOut",
        duration: 4,
      });
      gsap.to(this.camera.rotation, {
        delay: 1,
        x: 0,
        ease: "power1.inOut",
        duration: 4,
      });
    };

    const transitionOut = (callback) => {
      gsap.to(this.camera.position, {
        z: 0,
        duration: 4,
        ease: "power1.inOut",
        onComplete: callback,
      });
      gsap.to(this.camera.position, {
        x: 0,
        duration: 4,
        ease: "power1.inOut",
        onComplete: callback,
      });
      gsap.to(this.camera.position, {
        y: 8,
        // ease: "sine.inOut",
        //ease: "expo.in",
        ease: "power4.in",
        duration: 3,
      });
    };

    const rotateUpToStars = ({ onStart, onComplete } = {}) => {
      gsap.to(this.camera.rotation, {
        x: Math.PI / 4,
        ease: "power1.inOut",
        duration: 2,
        onComplete: onComplete,
        onStart: onStart,
      });
      gsap.to(this.stars.particles.material.uniforms.uOpacity, {
        value: 0,
        ease: "power1.inOut",
        duration: 2,
      });
    };

    const rotateDownFromStars = ({ onStart, onComplete } = {}) => {
      console.log("rotating down from stars");
      gsap.set(this.camera.position, {
        z: 20,
        y: 5,
      });
      gsap.from(this.camera.rotation, {
        delay: 1.0,
        x: Math.PI / 4,
        ease: "power1.inOut",
        duration: 2,
        onComplete: onComplete,
        onStart: onStart,
      });
      gsap.from(this.stars.particles.material.uniforms.uOpacity, {
        value: 0,
        ease: "power1.out",
        duration: 3,
      });
    };

    this.experience.animations = {
      start,
      transitionOut,
      transitionIn,
      rotateUpToStars,
      rotateDownFromStars,
    };
  }
}
