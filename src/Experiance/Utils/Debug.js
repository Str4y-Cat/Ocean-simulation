import * as lilGUI from "lil-gui";

export default class Debug {
    constructor() {
        //console.log(window.location.hash);
        //n
        this.active = window.location.hash === "#debug";

        if (this.active) {
            this.ui = new lilGUI.GUI();
        }
    }
}
