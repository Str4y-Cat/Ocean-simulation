import * as THREE from "three";
import Experience from "./Experiance";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

export default class PostProcessing {
    constructor() {
        this.experience = new Experience();
        this.canvas = this.experience.canvas;
        this.sizes = this.experience.sizes;
        this.debug = this.experience.debug;
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        this.setInstance();
        this.effectComposer = this.setPostProcessing();
        this.addProcessingPasses();
    }

    setInstance() {
        THREE.ColorManagement.legacyMode = false;

        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.outputEncoding = THREE.sRGBEncoding;
        // this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.setClearColor("#000");
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    setPostProcessing() {
        this.postProcessing = {};
        this.postProcessing.target;

        const renderTarget = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
                samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
            },
        );

        const effectComposer = new EffectComposer(this.instance, renderTarget);
        effectComposer.setPixelRatio(this.sizes.pixelRatio);
        effectComposer.setSize(this.sizes.width, this.sizes.height);

        const renderPass = new RenderPass(this.scene, this.camera.instance);
        effectComposer.addPass(renderPass);

        return effectComposer;
    }

    addProcessingPasses() {
        //add Bloom
        this.effectComposer.addPass(this.bloomPass());
        // this.effectComposer.addPass(this.luminenceTestPass());
    }

    bloomPass() {
        const unrealBloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.sizes.width, this.sizes.height),
            0.5,
            1.0,
        );
        unrealBloomPass.enabled = false;
        unrealBloomPass.strength = 2;
        unrealBloomPass.radius = 1;
        unrealBloomPass.threshold = 0.4;
        // this.instance.toneMapping = false;
        if (this.debug.active) {
            const folder = this.debug.ui.addFolder("Bloom");

            folder.add(unrealBloomPass, "enabled");
            folder.add(unrealBloomPass, "strength", 0, 2, 0.01);
            folder.add(unrealBloomPass, "radius", 0, 2, 0.01);
            folder.add(unrealBloomPass, "threshold", 0, 10, 0.01);
        }
        return unrealBloomPass;
    }

    luminenceTestPass() {
        const luminenceTest = {
            uniforms: {
                tDiffuse: { value: null },
                uCuttoff: { value: 1.0 },
            },
            vertexShader: `
            varying vec2 vUv;
            void main()
            {
            gl_Position= projectionMatrix * modelViewMatrix * vec4(position,1.0);
            vUv=uv;
            }
    `,
            fragmentShader: `
            uniform float uCuttoff;
            uniform sampler2D tDiffuse;
            varying vec2 vUv;

            float cuttoff(float x,float cuttoff){
            return clamp(x,0.0,cuttoff);
            }

            void main(){
            vec4 color= texture2D(tDiffuse,vUv);
            color.xyz -= uCuttoff;
            gl_FragColor=vec4(color);
        }
    `,
        };

        const luminencePass = new ShaderPass(luminenceTest);

        if (this.debug.active) {
            const folder = this.debug.ui.addFolder("luminence");

            folder
                .add(luminencePass.uniforms.uCuttoff, "value", 0.0, 2.0, 0.01)
                .name("Cuttoff");
        }

        return luminencePass;
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    update() {
        // console.log('Debug: Updating renderer')
        // this.instance.render(this.scene, this.camera.instance);
        this.effectComposer.render();
        // this.effect.render(this.scene, this.camera.instance);
    }
}
