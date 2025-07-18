import * as THREE from "three";
export default class Grid {
    constructor() {}

    /**
     * @typedef {Object} GridOptions
     * @property {number} width - Total width of the grid
     * @property {number} length - Total length of the grid
     * @property {number} cellWidth - Width of each individual cell
     * @property {number} cellLength - Length of each individual cell
     * @property {Function} rezFalloffFn - Function that determines the level-of-detail falloff
     * @property {number} minRez - Minimum resolution value
     * @property {number} maxRez - Maximum resolution value
     * @property {number} minDistance - Minimum distance at which LOD begins affecting resolution
     * @property {*} material - High-resolution material
     * @property {*} materialLowRes - Low-resolution material
     * @property {boolean} debug - Whether to enable debug mode
     */

    /**
     * Creates a LOD grid of cells. Each cell is defined by size and resolution.
     * The level of detail is interpolated between min and max resolution using a falloff function.
     *
     * @param {GridOptions} options - Configuration object for the grid
     */
    createGrid({
        width,
        length,
        cellWidth,
        cellLength,
        rezFalloffFn,
        minRez,
        maxRez,
        minDistance,
        material,
        materialLowRes,
        debug,
    }) {
        //defaults
        debug = debug ? debug : false;
        width = width ? width : 64;
        length = length ? length : 64;
        cellLength = cellLength ? cellLength : 8;
        cellWidth = cellWidth ? cellWidth : 8;
        minRez = minRez ? minRez : 2;
        maxRez = maxRez ? maxRez : 64;
        minDistance = minDistance ? minDistance : 0;
        rezFalloffFn = rezFalloffFn ? rezFalloffFn : (x) => x ** 3;
        material = material
            ? material
            : new THREE.MeshBasicMaterial({
                  color: new THREE.Color("#ff0000"),
                  wireframe: true,
              });

        if ((width / cellWidth) % 1 != 0 || (length / cellLength) % 1 != 0) {
            throw new Error(
                "cell size is not correct. It does not tile without remainder",
            );
            return false;
        }

        const widthIndex = width / cellWidth;
        const lengthIndex = length / cellLength;

        const group = new THREE.Group();

        //max hypotenuse. Pythag distance of the length and width/2
        const maxDistance = this.distance(
            widthIndex * cellWidth * 0.5,
            lengthIndex * cellLength,
        );

        //creates a array of the possible resolutions
        const resolutionArray = this.createResolutionArray(minRez, maxRez);

        let cellOffset = 0;
        if (widthIndex % 2 == 0) {
            cellOffset = cellWidth / 2;
        }

        for (let xIndex = -widthIndex / 2; xIndex < widthIndex / 2; xIndex++) {
            for (let zIndex = 0; zIndex < lengthIndex; zIndex++) {
                const xValue = xIndex * cellWidth + cellOffset;
                const zValue = zIndex * cellLength;

                let normalizedDistance =
                    1 - this.distance(xValue, zValue) / maxDistance;

                normalizedDistance =
                    normalizedDistance > 1 - minDistance / maxDistance
                        ? 1
                        : normalizedDistance;

                //add the fn call here
                normalizedDistance = rezFalloffFn(normalizedDistance);
                const resolution = this.getResolution(
                    resolutionArray,
                    normalizedDistance,
                );

                //we need to now create a resolution that fits within the 1,2,4,8,16,32,64,...
                const geometry = new THREE.PlaneGeometry(
                    cellWidth,
                    cellLength,
                    resolution,
                    resolution,
                );

                if (debug) {
                    const colorA = new THREE.Color("#ff0000");
                    const colorB = new THREE.Color("#0000ff");
                    const mainColor = colorA.lerp(colorB, normalizedDistance);
                    material = new THREE.MeshBasicMaterial({
                        color: mainColor,
                        wireframe: true,
                    });
                }

                geometry.rotateX(-Math.PI / 2);
                let mesh;

                //sets a different material on the worst resolution geometries
                if (materialLowRes && resolution == resolutionArray[0]) {
                    mesh = new THREE.Mesh(geometry, materialLowRes);
                } else {
                    mesh = new THREE.Mesh(geometry, material);
                }

                const offset = new THREE.Vector3(
                    xIndex * cellWidth + cellOffset,
                    0,
                    -zIndex * cellLength,
                );
                mesh.position.copy(offset);

                group.add(mesh);
            }
        }

        return group;
    }

    /**
     * creates a array of possible resolutions between a max and minimum resolution value
     * @param {int}min a perfect square int
     * @param {int}max a perfect square int
     *
     */
    createResolutionArray(min, max) {
        let arr = [];

        let cur = min;
        while (cur <= max) {
            arr.push(cur);
            cur *= 2;
        }
        return arr;
    }

    /**
     * returns the resolution based on an array of resolution values and a distance value
     *
     * @param {array} resolutionArray array containing ^2 resolutions
     * @param {int} normalizedDistance the distance from the camera, normalized against the maximum size of the grid
     */
    getResolution(resolutionArray, normalizedDistance) {
        const index = Math.floor(
            (resolutionArray.length - 1) * normalizedDistance,
        );
        return resolutionArray[index];
    }

    /**
     * simple pythagorean distance
     * @param {int} x
     * @param {int} y
     * @returns {int}r The hypotenuse
     */
    distance(x, y) {
        return Math.sqrt(x ** 2 + y ** 2);
    }
}
