import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
    constructor() {
        super();
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;

        this.slow = 0;

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    tick() {
        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;
        this.slow = Math.floor((this.elapsed / 500) % 100);
        // console.log('tick')
        this.trigger("tick");

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }
}
