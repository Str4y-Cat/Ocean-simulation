import * as THREE from "three";

import EventEmitter from "./EventEmitter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    //Options
    this.sources = sources;

    //Setup
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    // console.log('starting resources methods')
    this.setEvents();
    this.setLoaders();
    //this.setLoadingManager();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};

    //this.loaders.manager = new THREE.LoadingManager();

    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.loaders.rgbeLoader = new RGBELoader();
    //console.log(this.loaders.rgbeLoader);
  }

  startLoading() {
    //Load each source
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          console.log("loaded cube texture");
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "equirectangularTexture") {
        this.loaders.rgbeLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    //console.log(source);
    this.items[source.name] = file;
    // this.loaded++;
    // //add event listener here
    // //event.progress = this.loaded
    //
    // if (this.loaded === this.toLoad) {
    //     //console.log("DEBUG FINISHED LOADING SOURCES");
    //this.trigger("ready");
    // }
  }

  setEvents() {
    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.trigger("start");
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      this.trigger("ready");
    };

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      //console.log(`loaded ${url}, ${itemsLoaded} of ${itemsTotal}`);
      this.trigger("progress", [{ itemsLoaded, itemsTotal }]);
    };

    THREE.DefaultLoadingManager.onError = (url) => {
      this.trigger("error", url);
    };
  }

  dispose() {
    //console.log(this.items);
    for (let key in this.items) {
      this.items[key].dispose();
    }
  }
}
