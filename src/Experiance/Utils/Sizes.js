import EventEmitter from "./EventEmitter";

export default class Sizes extends EventEmitter {
    constructor() {
        // console.log('sizes online')
        super();
        //setup
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);

        //Resize Event
        window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.pixelRatio = Math.min(window.devicePixelRatio, 2);

            this.trigger("resize");
        });
    }
}

