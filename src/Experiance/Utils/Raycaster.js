import Experience from "../Experiance";
import * as THREE from "three";
import EventEmitter from "./EventEmitter";

export default class Raycaster extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.camera = this.experience.camera.instance;
        this.raycastCallbacks = [];
        this.instance = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.mouse_last = new THREE.Vector2();
        this.setMouseListeners();

        this.targets = [];
    }
    //NOTE:
    //- add target, fn callback for data retreaval
    //- listen for target

    setMouseListeners() {
        //handle desktop
        window.addEventListener("mousemove", (event) => {
            this.mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2;
        });
        // //handle mobile
        window.addEventListener("pointerdown", (event) => {
            this.mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener("touchmove", (event) => {
            event.preventDefault;
            this.mouse.x =
                (event.touches[0].clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y =
                -(event.touches[0].clientY / window.innerHeight - 0.5) * 2;
        });
    }

    addTarget(
        mesh,
        name,
        fn = (intersection) => {
            return intersection;
        },
    ) {
        this.experience.scene.add(mesh);
        this.targets.push({
            mesh,
            name,
            callback: fn,
        });
        //console.log(this.targets);
    }

    castRays() {
        for (let i = 0; i < this.targets.length; i++) {
            let intersection = this.instance.intersectObject(
                this.targets[i].mesh,
            );
            this.trigger(
                this.targets[i].name,
                this.targets[i].callback(intersection),
            );
        }
    }

    //removes all the triggers
    destroy() {
        this.targets.forEach((target) => {
            this.off(target.name);
        });
    }

    // intersectObject(object) {
    //     return this.instance.intersectObject(object);
    // }

    //only updates when the mouse moves
    update() {
        //console.log(this.mouse, this.mouse_last);
        if (
            this.mouse_last.x != this.mouse.x &&
            this.mouse_last.y != this.mouse.y
        ) {
            this.mouse_last.copy(this.mouse);
            this.instance.setFromCamera(this.mouse, this.camera);
            //console.log(this.mouse);
            this.castRays();
        }
    }
}
