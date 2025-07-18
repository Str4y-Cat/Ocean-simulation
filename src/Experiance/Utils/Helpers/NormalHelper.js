import {
    BufferGeometry,
    Float32BufferAttribute,
    LineSegments,
    LineBasicMaterial,
    Matrix3,
    Vector3,
    Vector4,
    Vector2,
} from "three";

const _v1 = new Vector3();
const _v2 = new Vector3();
const _normalMatrix = new Matrix3();

/**
 * Visualizes an object's vertex normals.
 *
 * Requires that normals have been specified in the geometry as a buffer attribute or
 * have been calculated using {@link BufferGeometry#computeVertexNormals}.
 * ```js
 * const geometry = new THREE.BoxGeometry( 10, 10, 10, 2, 2, 2 );
 * const material = new THREE.MeshStandardMaterial();
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 *
 * const helper = new VertexNormalsHelper( mesh, 1, 0xff0000 );
 * scene.add( helper );
 * ```
 *
 * @augments LineSegments
 * @three_import import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
 */
class VertexNormalsHelper extends LineSegments {
    /**
     * Constructs a new vertex normals helper.
     *
     * @param {Object3D} object - The object for which to visualize vertex normals.
     * @param {number} [size=1] - The helper's size.
     * @param {number|Color|string} [color=0xff0000] - The helper's color.
     */
    constructor(object, size = 1, color = 0xff0000) {
        const geometry = new BufferGeometry();

        const nNormals = object.geometry.attributes.normal.count;
        const positions = new Float32BufferAttribute(nNormals * 2 * 3, 3);

        geometry.setAttribute("position", positions);

        super(geometry, new LineBasicMaterial({ color, toneMapped: false }));

        /**
         * The object for which to visualize vertex normals.
         *
         * @type {Object3D}
         */
        this.object = object;

        /**
         * The helper's size.
         *
         * @type {number}
         * @default 1
         */
        this.size = size;

        this.type = "VertexNormalsHelper";

        /**
         * Overwritten and set to `false` since the object's world transformation
         * is encoded in the helper's geometry data.
         *
         * @type {boolean}
         * @default false
         */
        this.matrixAutoUpdate = false;

        /**
         * This flag can be used for type testing.
         *
         * @type {boolean}
         * @readonly
         * @default true
         */
        this.isVertexNormalsHelper = true;

        this.update();
    }

    /**
     * Updates the vertex normals preview based on the object's world transform.
     */
    update() {
        this.object.updateMatrixWorld(true);

        _normalMatrix.getNormalMatrix(this.object.matrixWorld);
        console.log(_normalMatrix);

        const matrixWorld = this.object.matrixWorld;

        const position = this.geometry.attributes.position;

        //

        const objGeometry = this.object.geometry;

        if (objGeometry) {
            const objPos = objGeometry.attributes.position;

            const objNorm = objGeometry.attributes.normal;
            console.log(objNorm);
            console.log(objPos);

            let idx = 0;

            // for simplicity, ignore index and drawcalls, and render every normal

            for (let j = 0, jl = objPos.count; j < jl; j++) {
                //base position, just connected to the geometry base, dont change unless you shift the base?
                const uvPos = new Vector4(
                    objPos.getX(j) / 32,
                    objPos.getY(j),
                    objPos.getZ(j) / 32,
                    objPos.getW(j),
                );

                _v1.fromBufferAttribute(objPos, j).applyMatrix4(matrixWorld);

                console.log(Pos);
                //top position, objNorm represents the normal vector
                _v2.fromBufferAttribute(objNorm, j)
                    .applyMatrix3(_normalMatrix)
                    .normalize()
                    .multiplyScalar(this.size)
                    .add(_v1);

                //sets the position at a specific index
                position.setXYZ(idx, _v1.x, _v1.y, _v1.z);

                idx = idx + 1;

                position.setXYZ(idx, _v2.x, _v2.y, _v2.z);

                idx = idx + 1;
            }
        }

        position.needsUpdate = true;
    }

    calculateNormal({ position }) {
        function getDirection(/*vec2*/ direction, /*vec4*/ position) {
            //using position z because we're using the flat plain. i.e x and z axis
            const value = direction.x * position.x - direction.y * position.z;
            return value;
        }

        //a- amplitude D- direction w= frequency t-time speed- speed
        function getElevation(
            /*float*/ a,
            /*float*/ D,
            /*float*/ w,
            /*float*/ t,
            /*float*/ speed,
            /*float*/ phase,
        ) {
            const ePow = Math.pow(uEuler, Math.sin(D * w + t * phase) - 1.0);
            return a * ePow;
        }

        function getNormal(
            /*float*/ a,
            /*float*/ D,
            /*float*/ angle,
            /*float*/ w,
            /*float*/ t,
            /*float*/ speed,
            /*float*/ phase,
        ) {
            const ePow = Math.pow(uEuler, Math.sin(D * w + t * phase) - 1.0);

            return w * angle * a * ePow * Mah.cos(D * w + t * phase);
        }

        let uTime;
        let uDirection;
        let uEuler;
        let uOctaves;
        let uAmplitude;
        let uFrequency;
        let uLacunarity;
        let uGain;

        //base position
        //let modelWorldPosition = modelMatrix * Vector4(position, 1.0);

        //wave values
        let wavelength = 1.0;
        let w = (3.14 * 2.0) / wavelength; //frequency
        let speed = 0.2;
        let phase = speed * ((3.14 * 2.0) / wavelength);
        let elevation = 0.0;
        let dx = 0.0;
        let dy = 0.0;

        //fractional brownian motion
        /*vec2*/ let directionVec = texture(uDirection, Vector2(0.0, 0.0)).xy;
        w *= uFrequency;
        let a = uAmplitude;

        for (let i = 0.0; i < uOctaves; i++) {
            let D = getDirection(directionVec, modelWorldPosition);
            D += dx - dy;
            elevation += getElevation(a, D, w, -uTime, speed, phase * 0.7);
            dx += getNormal(
                a,
                D,
                directionVec.x,
                w,
                -uTime,
                speed,
                phase * 0.7,
            );
            dy += getNormal(
                a,
                D,
                directionVec.y,
                w,
                -uTime,
                speed,
                phase * 0.7,
            );

            a *= uLacunarity;
            w *= uGain;
            speed *= 0.1;

            directionVec = texture(uDirection, Vector2(i / uOctaves, 0.0)).xy;
        }

        //calculate normal
        let T = Vector3(1, 0, dx);
        let B = Vector3(0, 1, dy);
        //vec3 calculatedNormal = normalize(vec3(-dx, -dy, 1.0);
        let calculatedNormal = normalize(Vector3(dx, dy, vNormal.z));
        modelWorldPosition.y += elevation;

        //final position
        // vec4 viewPosition = viewMatrix * modelWorldPosition;
        // vec4 projectedPosition = projectionMatrix * viewPosition;

        //varyings
        let transformed = position;
        transformed.y += elevation;
        //vec3 vWorldPosition = vec3(-modelWorldPosition.z, modelPosition.y, -modelPosition.x);
        vNormal = (modelMatrix * Vector4(calculatedNormal, 0.0)).xyz;
    }

    /**
     * Frees the GPU-related resources allocated by this instance. Call this
     * method whenever this instance is no longer used in your app.
     */
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

export { VertexNormalsHelper };
