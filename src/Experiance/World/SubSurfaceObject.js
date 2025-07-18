import * as THREE from "three";
import gsap from "gsap";

import { VertexNormalsHelper } from "../Utils/Helpers/NormalHelper";
import { SubsurfaceScatteringShader } from "three/addons/shaders/SubsurfaceScatteringShader.js";
import Experience from "../Experiance";
import Raycaster from "../Utils/Raycaster";
import fragmentShader from "../Shaders/Ocean/fragment.glsl";
import vertexShader from "../Shaders/Ocean/vertex.glsl";
import vertexModifiedShader from "../Shaders/Ocean/vertex_modified.glsl";
import fragmentSSSShader from "../Shaders/SSSMaterial/fragment.glsl";

import { directionTexture } from "../Utils/TextureMaker";

export default class Ocean {
    constructor() {
        //console.log("------OCEAN-------");
        this.experience = new Experience();

        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.camera = this.experience.camera.instance;
        this.sizes = this.experience.sizes;
        this.debug = this.experience.debug;

        //setUp
        this.setTextures();
        this.setUniforms();
        this.setGeometry();
        this.setTextures();
        this.setMaterial();
        this.setMesh();

        //Debug
        if (this.debug.active) {
            //this.setDebug();
            this.setMaterialDebug();
        }
    }

    setUniforms() {
        this.sssValues = {};
        //console.log(this.thicknessTexture);
        this.sssValues.uniforms = {
            uDiffuse: new THREE.Uniform(new THREE.Vector3(1.0, 0.2, 0.2)),
            uShininess: new THREE.Uniform(500),
            uThicknessMap: this.thicknessTexture,
            uThicknessColor: new THREE.Uniform(
                new THREE.Vector3(0.5, 0.5, 0.5),
            ),
            uThicknessDistortion: new THREE.Uniform(0.1),
            uThicknessAmbient: new THREE.Uniform(0.4),
            uThicknessAttenuation: new THREE.Uniform(0.8),
            uThicknessPower: new THREE.Uniform(2.0),
            uThicknessScale: new THREE.Uniform(16.0),
        };
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(2);
    }

    setTextures() {
        const width = 32;
        const height = 32;

        const size = width * height;
        const data = new Uint8Array(4 * size);
        const color = new THREE.Color(0xffffff);

        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);

        for (let i = 0; i < size; i++) {
            const stride = i * 4;
            data[stride] = r;
            data[stride + 1] = g;
            data[stride + 2] = b;
            data[stride + 3] = 255;
        }

        // used the buffer to create a DataTexture
        this.thicknessTexture = new THREE.DataTexture(data, width, height);
        this.thicknessTexture.needsUpdate = true;
        //return null;
    }

    setMaterial() {
        const shader = SubsurfaceScatteringShader;
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms["diffuse"].value = new THREE.Vector3(2.0, 0.2, 0.2);
        uniforms["shininess"].value = 500;
        uniforms["thicknessMap"].value = this.thicknessTexture;
        uniforms["thicknessColor"].value = new THREE.Vector3(0.5, 0.3, 0.0);
        uniforms["thicknessDistortion"].value = 0.1;
        uniforms["thicknessAmbient"].value = 0.4;
        uniforms["thicknessAttenuation"].value = 0.8;
        uniforms["thicknessPower"].value = 2.0;
        uniforms["thicknessScale"].value = 16.0;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            lights: true,
        });

        console.log(shader.fragmentShader);
        //console.log(material);
        this.material = material;
    }

    setMaterialDebug() {
        this.debugFolder = this.debug.ui.addFolder("OceanMaterial");
        const folder = this.debugFolder;

        if (this.mesh.material.type == "ShaderMaterial") {
            const debugValues = {
                color: new THREE.Color(
                    this.mesh.material.uniforms.thicknessColor.value,
                ).getHex(),
            };

            // uniforms["diffuse"].value = new THREE.Vector3(1.0, 0.2, 0.2);
            folder.addColor(debugValues, "color").onChange((color) => {
                this.mesh.material.uniforms.thicknessColor.value =
                    new THREE.Color(color);
                //console.log(this.mesh.material.uniforms.thicknessColor);
            });

            // uniforms["shininess"].value = 500;
            folder
                .add(this.mesh.material.uniforms.shininess, "value")
                .min(100)
                .max(1000)
                .step(10)
                .name("Shininess");

            // uniforms["thicknessColor"].value = new THREE.Vector3(0.5, 0.3, 0.0);
            // folder.add(this.mesh.material.uniforms.thicknessColor,'value').min().max().step().name('thicknessColor')
            // folder.add(this.mesh.material.uniforms.thicknessColor,'value').min().max().step().name('thicknessColor')
            // folder.add(this.mesh.material.uniforms.thicknessColor,'value').min().max().step().name('thicknessColor')

            // uniforms["thicknessDistortion"].value = 0.1;
            folder
                .add(this.mesh.material.uniforms.thicknessDistortion, "value")
                .min(0.1)
                .max(1)
                .step(0.01)
                .name("thicknessDistortion");
            // uniforms["thicknessAmbient"].value = 0.4;
            folder
                .add(this.mesh.material.uniforms.thicknessAmbient, "value")
                .min(0.1)
                .max(5)
                .step(0.1)
                .name("thicknessAmbient");
            // uniforms["thicknessAttenuation"].value = 0.8;
            folder
                .add(this.mesh.material.uniforms.thicknessAttenuation, "value")
                .min(0.1)
                .max(5)
                .step(0.1)
                .name("thicknessAttenuation");
            // uniforms["thicknessPower"].value = 2.0;
            folder
                .add(this.mesh.material.uniforms.thicknessPower, "value")
                .min(0.1)
                .max(16)
                .step(1)
                .name("thicknessPower");
            // uniforms["thicknessScale"].value = 16.0;
            folder
                .add(this.mesh.material.uniforms.thicknessScale, "value")
                .min(1)
                .max(30)
                .step(0.5)
                .name("thicknessScale");
        }
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.geometry.rotateX(-Math.PI * 0.5);
        this.mesh.position.y += 2;
        this.scene.add(this.mesh);
    }

    update() {}
}
