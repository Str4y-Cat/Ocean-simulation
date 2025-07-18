import * as lilGUI from "lil-gui";

export default class Debug {
  constructor() {
    //console.log(window.location.hash);
    //n
    //this.active = window.location.hash === "#debug";

    this.active = true;
    if (this.active) {
      this.ui = new lilGUI.GUI();
      this.ui.close();
    }
  }
}
