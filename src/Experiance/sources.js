import Experience from "./Experiance.js";
import gsap from "gsap";

//create a object conatining any assets from laravel
//get the page
/*
    const sources = experience.sources
    console.log(sources)
    export default [
    ...sources
]
*/

var random = gsap.utils.random(
  [
    "sunset",
    // "sunset2",
    // "sunset3",
    "sunset4",
    // "sunset5",
    // "sunset6",
    // "sunset7",
    "clear",
    // "clouds1",
    // "clouds2",
  ],
  true,
);

const path = random();
console.log(path);

export default [
  {
    name: "environmentMapTexture",
    type: "cubeTexture",
    path: [
      `environments/${path}/px.png`,
      `environments/${path}/nx.png`,
      `environments/${path}/py.png`,
      `environments/${path}/ny.png`,
      `environments/${path}/pz.png`,
      `environments/${path}/nz.png`,
    ],
  },
];
// export default init();
