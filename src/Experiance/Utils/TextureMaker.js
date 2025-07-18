import * as THREE from "three";
import * as SIMPLEX from "simplex-noise";

const CONSTANTS = {
    octaves: 35,
    baseDir: new THREE.Vector2(0, 1).normalize(), // Dominant wave direction
    maxVariance: Math.PI / 2, // up to ±90° variation
    falloff: 1.5, // How quickly it diverges from baseDir
    noiseFrequency: 1.0, // Affects spatial coherence
    noiseField: SIMPLEX.createNoise2D(),
};

export function directionTexture(value, varience, count) {
    const width = count;
    const height = 1;

    const size = width * height;
    const data = new Uint8Array(4 * size);

    for (let i = 0; i < size; i++) {
        //const waveDirection = randomDirection(value, varience);
        const waveDirection = getDirection(i);
        const r = Math.floor(waveDirection.x * 255);
        const g = Math.floor(waveDirection.y * 255);

        const stride = i * 4;
        data[stride] = r;
        data[stride + 1] = g;
        data[stride + 2] = 0;
        data[stride + 3] = 0;
    }

    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture(data, width, height);
    texture.needsUpdate = true;
    return texture;
}

function randomDirection(value, varience) {
    // if(value>2){
    //     value=value%2
    // }
    // value=0.0
    let randomValue = (Math.random() - 0.5) * 2;
    //  randomValue= 0
    value += randomValue * varience;
    value += randomValue * varience;
    value = Math.random() * 2;
    // if(value>2 ||value<-2)
    // {

    // }
    // console.log(value)
    const direction = new THREE.Vector2(
        Math.cos(value * Math.PI),
        Math.sin(value * Math.PI),
    );
    // console.log(`direction:`)
    direction.normalize();
    // console.log(direction)
    // const color = new THREE.Color();

    return direction;
}

function getDirection(index) {
    const t = index / (CONSTANTS.octaves - 1);
    const variance = CONSTANTS.maxVariance * Math.pow(t, CONSTANTS.falloff); // increases with t

    // Coherent angle offset
    const noise = CONSTANTS.noiseField(index * CONSTANTS.noiseFrequency, 0);
    const angleOffset = noise * variance;

    const cosA = Math.cos(angleOffset);
    const sinA = Math.sin(angleOffset);

    // Rotate base direction
    const dirX = cosA * CONSTANTS.baseDir.x - sinA * CONSTANTS.baseDir.y;
    const dirY = sinA * CONSTANTS.baseDir.x + cosA * CONSTANTS.baseDir.y;
    return { x: dirX, y: dirY };
}
