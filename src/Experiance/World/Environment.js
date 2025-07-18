import * as THREE from "three";

import Experience from "../Experiance";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.experience.lights = {};

    this.setEnvironmentMap();
    this.setBackground();

    //Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Environment");
      //this.setBackgroundDebug();
    }
  }

  setEnvironmentMap() {
    this.environmentMap = {};
    this.environmentMap.intensity = 10.0;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;
    //this.environmentMap.texture.mapping = THREE.EquirectangularReflectionMapping;
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;

    this.scene.environment = this.environmentMap.texture;
    //this.scene.environment.rotation += 1;

    this.environmentMap.updateMaterial = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };

    this.environmentMap.updateMaterial();

    this.experience.environmentMapTexture = this.environmentMap.texture;
  }

  setBackground() {
    this.scene.background = this.environmentMap.texture;
  }

  //#region DEBUG
  setBackgroundDebug() {
    const folder = this.debug.ui.addFolder("Background");
    //
    const debug = {
      bgColor: this.scene.background.getHex(),
    };

    folder.addColor(debug, "bgColor").onChange((color) => {
      this.scene.background = new THREE.Color(color);
    });
  }

  //#endregion
}
