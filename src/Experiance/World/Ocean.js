import * as THREE from "three";
import gsap from "gsap";

import Experience from "../Experiance";
import vertexModifiedShader from "../Shaders/Ocean/vertex_modified.glsl";

import { directionTexture } from "../Utils/TextureMaker";
import Grid from "../Utils/Grid";

export default class Ocean {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.environmentMapTexture = this.experience.environmentMapTexture;
    this.environment = this.experience.environment;

    this.camera = this.experience.camera.instance;
    this.sizes = this.experience.sizes;
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.grid = new Grid();

    //setUp
    this.constants = this.setConstants();
    this.setUniforms();
    // this.setGeometry();
    this.setMaterial();
    this.setMesh();

    //Debug
    if (this.debug.active) {
      this.setVertexShaderDebug();
      this.setMaterialDebug();
      this.setAnnimationDebug();
    }
  }

  setConstants() {
    return {
      ocean: {
        time: 0,
        delta: 0,
        direction: directionTexture(0, 4, 64),
        euler: Math.E,
        normalDiff: 0.01,
        octaves: 35,
        uEnvironmentTexture: { value: this.environmentMapTexture },
        amplitude: 0.45,
        frequency: 0.1,
        lacunarity: 0.72,
        gain: 1.26,
        color: new THREE.Color("#003C5F "),
        ray: new THREE.Vector2(0.0, 0.0),
        fresnelPow: 5,
        resolution: new THREE.Vector2(
          this.sizes.width * this.sizes.pixelRatio,
          this.sizes.height * this.sizes.pixelRatio,
        ),

        waveLength: 1.75,
        waveSpeed: 0.23,
        peakMultiplier: 1,
        phaseMultiplier: 1,
        maxFrequency: 9.0,
      },
      material: {
        color: new THREE.Color("#052236"),
        roughness: 0.0, // Moderate roughness for subtle reflections
        // specularIntensity: 0.3,
        // clearcoat: 0.15, // Full clear coat for surface reflections
      },
    };
  }

  setUniforms() {
    const CONSTANTS = this.constants;

    this.uniforms = {
      ocean: {
        uTime: new THREE.Uniform(0),
        uDelta: new THREE.Uniform(0),
        uDirection: new THREE.Uniform(CONSTANTS.ocean.direction),
        uEuler: new THREE.Uniform(CONSTANTS.ocean.euler),
        uNormalDiff: new THREE.Uniform(CONSTANTS.ocean.normalDiff),
        uOctaves: new THREE.Uniform(CONSTANTS.ocean.octaves),
        uEnvironmentTexture: {
          value: this.environmentMapTexture,
        },
        uAmplitude: new THREE.Uniform(CONSTANTS.ocean.amplitude),
        uFrequency: new THREE.Uniform(CONSTANTS.ocean.frequency),
        uLacunarity: new THREE.Uniform(CONSTANTS.ocean.lacunarity),
        uGain: new THREE.Uniform(CONSTANTS.ocean.gain),
        uColor: new THREE.Uniform(CONSTANTS.ocean.color),
        uRay: new THREE.Uniform(CONSTANTS.ocean.ray),
        uFresnelPow: new THREE.Uniform(CONSTANTS.ocean.fresnelPow),
        uResolution: new THREE.Uniform(CONSTANTS.ocean.resolution),

        uWaveLength: new THREE.Uniform(CONSTANTS.ocean.waveLength),
        uWaveSpeed: new THREE.Uniform(CONSTANTS.ocean.waveSpeed),
        uPeakMultiplier: new THREE.Uniform(CONSTANTS.ocean.peakMultiplier),
        uPhaseMultiplier: new THREE.Uniform(CONSTANTS.ocean.phaseMultiplier),
        uSpeedMultipler: new THREE.Uniform(CONSTANTS.ocean.speedMultipler),
        uMaxFrequency: new THREE.Uniform(CONSTANTS.ocean.maxFrequency),
      },
    };
  }

  setMaterial() {
    const CONSTANTS = this.constants;

    let material = new THREE.MeshPhysicalMaterial({
      // wireframe: false,
      // flatShading: false,

      color: CONSTANTS.material.color,
      roughness: CONSTANTS.material.roughness,
      transmission: 0.5, // enable refraction (optional)
      ior: 1.33,
      reflectivity: 0.2,
      thickness: 0.5,
      // specularIntensity: CONSTANTS.material.specularIntensity,
      // clearcoat: CONSTANTS.material.clearcoat, // Full clear coat for surface reflections
    });

    //material = new THREE.MeshNormalMaterial();

    //this.materialLowRes = material;
    this.materialLowRes = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff0000"),
    });
    this.material = this.modifyMaterial(material);
  }

  modifyMaterial(material) {
    const splitVertexShader = vertexModifiedShader.split("#include <SPLIT>");

    //REFACTOR:
    //- not urgent. Lets see if we can make this more elegant
    material.onBeforeCompile = (shader) => {
      //uniforms
      console.log(this.uniforms.subSurface);
      shader.uniforms = {
        ...shader.uniforms,
        ...this.uniforms.ocean,
      };

      //add the uniforms
      shader.vertexShader = splitVertexShader[0] + shader.vertexShader;
      //
      //add functions
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",

        //shader content
        splitVertexShader[1],
      );
      //add your section
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        //shader content
        splitVertexShader[2],
      );

      material.userData.shader = shader;
    };

    return material;
  }

  setMesh() {
    this.mesh = this.grid.createGrid({
      width: 64,
      length: 64,
      cellLength: 16,
      cellWidth: 16,
      minRez: 32,
      maxRez: 256,
      // maxRez: 32,
      minDistance: 20,
      rezFalloffFn: (x) => x ** 2,
      debug: false,
      // debug: true,
      material: this.material,
      //materialLowRes: this.materialLowRes,
    });
    this.mesh.position.z += 7;

    this.scene.add(this.mesh);
  }

  /**
   * steps the ocean shader forward in time
   */
  updateOceanShader() {
    if (!this.material.userData.shader) return;

    this.material.userData.shader.uniforms.uTime.value =
      this.time.elapsed / 1000;

    //NOTE:
    // don't think we need a delta value, as the time is not dependent on
    // framerate. and the movement of the ocean is dependent on time.
    this.material.userData.shader.uniforms.uDelta.value =
      this.time.delta / 1000;
  }

  update() {
    this.updateOceanShader();
  }

  //#region DEBUG

  setMaterialDebug() {
    this.debugFolder = this.debug.ui.addFolder("OceanMaterial");
    const folder = this.debugFolder;

    console.log("this is a shader material");
    const debugValues = {
      color: this.material.color ? this.material.color.getHex() : null,
      attenuationColor: this.material.attenuationColor
        ? this.material.attenuationColor.getHex()
        : null,
    };

    folder.add(this.material, "wireframe").name("Wireframe");
    folder
      .add(this.material, "flatShading")
      .name("Flat shading")
      .onChange(() => {
        this.material.needsUpdate = true;
      });

    //console.log("this is the material type", this.material.type);
    folder.addColor(debugValues, "color").onChange((color) => {
      this.material.color = new THREE.Color(color);
    });

    folder
      .add(this.material, "roughness")
      .min(0)
      .max(1)
      .step(0.01)
      .name("roughness");

    folder
      .add(this.material, "metalness")
      .min(0)
      .max(1)
      .step(0.01)
      .name("metalness");

    // folder
    //     .add(this.material, "transmission")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("transmission");
    // folder
    //     .add(this.material, "thickness")
    //     .min(0)
    //     .max(10)
    //     .step(0.01)
    //     .name("thickness");
    // folder
    //     .add(this.material, "dispersion")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("dispersion");

    // folder.add(this.material, "ior").min(0).max(5).step(0.01).name("ior");

    // folder.addColor(debugValues, "attenuationColor").onChange((color) => {
    //     this.material.attenuationColor = new THREE.Color(color);
    // });
    // folder
    //     .add(this.material, "attenuationDistance")
    //     .min(1)
    //     .max(100)
    //     .step(1)
    //     .name("attenuationDistance");
    // folder
    //     .add(this.material, "specularIntensity")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("specularIntensity");

    // folder
    //     .add(this.material, "clearcoat")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("clearcoat");
    // folder
    //     .add(this.material, "clearcoatRoughness")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("clearcoatRoughness");
    // folder
    //     .add(this.material, "reflectivity")
    //     .min(0)
    //     .max(1)
    //     .step(0.01)
    //     .name("reflectivity");
  }

  setVertexShaderDebug() {
    const folder = this.debug.ui.addFolder("Vertex Uniforms");
    folder
      .add(this.uniforms.ocean.uNormalDiff, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uNormalDiff.value = val;
      })
      .min(0.001)
      .step(0.001)
      .max(1)
      .name("uNormalDiff");

    folder
      .add(this.uniforms.ocean.uOctaves, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uOctaves.value = val;
      })
      .min(1)
      .step(1)
      .max(64)
      .name("uOctaves");
    folder
      .add(this.uniforms.ocean.uAmplitude, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uAmplitude.value = val;
      })

      .min(0)
      .max(2)
      .step(0.01)
      .name("uAmplitude");
    folder
      .add(this.uniforms.ocean.uFrequency, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uFrequency.value = val;
      })
      .min(0)
      .max(2)
      .step(0.01)
      .name("uFrequency");
    folder
      .add(this.uniforms.ocean.uLacunarity, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uLacunarity.value = val;
      })
      .min(0)
      .max(2)
      .step(0.01)
      .name("uLacunarity");
    folder
      .add(this.uniforms.ocean.uGain, "value")
      .onChange((val) => {
        this.material.userData.shader.uniforms.uGain.value = val;
      })
      .min(0)
      .max(2)
      .step(0.01)
      .name("uGain");

    folder
      .add(this.uniforms.ocean.uWaveLength, "value", 0, 3, 0.01)
      .onChange((val) => {
        this.material.userData.shader.uniforms.uWaveLength.value = val;
      })
      .name("uWaveLength");

    folder
      .add(this.uniforms.ocean.uWaveSpeed, "value", 0, 3, 0.01)
      .onChange((val) => {
        this.material.userData.shader.uniforms.uWaveSpeed.value = val;
      })
      .name("uWaveSpeed");

    folder
      .add(this.uniforms.ocean.uPeakMultiplier, "value", 0, 3, 0.01)
      .onChange((val) => {
        this.material.userData.shader.uniforms.uPeakMultiplier.value = val;
      })
      .name("uPeakMultiplier");

    folder
      .add(this.uniforms.ocean.uPhaseMultiplier, "value", 0, 3, 0.01)
      .onChange((val) => {
        this.material.userData.shader.uniforms.uPeakMultiplier.value = val;
      })
      .name("uPhaseMultiplier");

    folder
      .add(this.uniforms.ocean.uMaxFrequency, "value", 0, 10, 0.01)
      .onChange((val) => {
        this.material.userData.shader.uniforms.uMaxFrequency.value = val;
      })
      .name("uMaxFrequency");
  }

  setAnnimationDebug() {
    this.debugFolder.add(this.experience.animations, "start");
    this.debugFolder.add(this.experience.animations, "transitionIn");
    this.debugFolder.add(this.experience.animations, "transitionOut");
  }

  //#endregion
}
