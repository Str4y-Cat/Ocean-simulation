//Everything here works. Perhaps not the most optimized, and there are creases in the normals
uniform float uTime;
uniform sampler2D uDirection;
uniform float uEuler;
uniform float uOctaves;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLacunarity;
uniform float uGain;
uniform float uNormalDiff;

#include <SPLIT>
// varying float vTime;

#include <common>
// #include ./includes/perlinClassic3D.glsl
float getDirection(vec2 direction, vec4 position)
{
    //note, direction y is the same as position y. Confusing but remember the plain has been rotated
    return ((direction.x) * position.x - (direction.y) * position.z);
}

float getDirection(vec2 direction, vec3 position)
{
    //note, direction y is the same as position y. Confusing but remember the plain has been rotated
    return ((direction.x) * position.x - (direction.y) * position.z);
}

//a- amplitude D- direction w= frequency t-time speed- speed
float getElevation(float a, float D, float w, float t, float speed, float phase) {
    float ePow = pow(uEuler, (sin((D * w + t * phase)) - 1.0));
    return a * ePow;
}

float getNormal(float a, float D, float angle, float w, float t, float speed, float phase) {
    float ePow = pow(uEuler, (sin((D * w + t * phase)) - 1.0));

    return w * angle * a * ePow * cos(D * w + t * phase);
}

// float getNormal(vec4 pos, float a, float D, float angle, float w, float t, float speed, float phase) {
//     float epsilon = 0.001;
//     float h = getElevation(a, getDirection(D, pos + vec4(epsilon, 0, 0, 0)), w, t, speed, phase);
//     float l = getElevation(a, getDirection(D, pos - vec4(epsilon, 0, 0, 0)), w, t, speed, phase);
//     float dx = (h - l) / (2.0 * epsilon);
//     return dx;
// }

#include <SPLIT>

//MAIN
#include <begin_vertex>
//base position
vec4 modelWorldPosition = modelMatrix * vec4(position, 1.0);
// vec4 modelWorldPosition = vec4(position, 1.0);

//wave values
float wavelength = 1.0;
float w = ((3.14 * 2.0) / wavelength); //frequency
float speed = 0.2;
float phase = speed * ((3.14 * 2.0) / wavelength);
float elevation = 0.0;
float dx = 0.0;
float dy = 0.0;
vec3 modelWorldPosition_ShiftedX = vec3(modelWorldPosition.x + uNormalDiff, modelWorldPosition.yz);
vec3 modelWorldPosition_ShiftedZ = vec3(modelWorldPosition.xy, modelWorldPosition.z - uNormalDiff);

//neighboring vertex difference

//fractional brownian motion
//note, on each layer, the direction is the same, the more layers, the more
// directions we can add. It essentially runs down an array of 2d vectors
vec2 directionVec = texture(uDirection, vec2(0.0, 0.0)).xy;

w *= uFrequency;
float a = uAmplitude;

for ( float i = 0.0; i < uOctaves; i ++ )
{
vec3 D = vec3(
        getDirection(directionVec, modelWorldPosition),
        getDirection(directionVec, modelWorldPosition_ShiftedX),
        getDirection(directionVec, modelWorldPosition_ShiftedZ));

//adds peaks to based on the change in partial derivative
D += ( dx - dy ) * 2.0 ;

elevation += getElevation(a, D.x, w, -uTime, speed, phase*0.7);

//note we're using dy for elevation x, whats that about?
//well we are just storing the values in a vector
modelWorldPosition_ShiftedX . y += getElevation(a, D.y, w, -uTime, speed, phase*0.7);
modelWorldPosition_ShiftedZ . y += getElevation(a, D.z, w, -uTime, speed, phase*0.7);

// elevationA += getElevation(a, Da, w, -uTime, speed, phase*0.7);
// elevationB += getElevation(a, Db, w, -uTime, speed, phase*0.7);

dx += getNormal(a, D.x, directionVec.x, w, -uTime, speed, phase*0.7);
dy += getNormal(a, D.x, directionVec.y, w, -uTime, speed, phase*0.7);

a *= uLacunarity;
w *= uGain;
speed *= 0.1 ;

directionVec = texture(uDirection, vec2(i/uOctaves, 0.0)). xy;
}

modelWorldPosition . y += elevation;
//calculate normal
// vec3 dPositionX = normalize(vec3(1.0, dx, 0));
// vec3 dPositionZ = normalize(vec3(0, dy, 1.0));
vec3 dPositionX = normalize(modelWorldPosition_ShiftedX - modelWorldPosition.xyz);
vec3 dPositionZ = normalize(modelWorldPosition_ShiftedZ - modelWorldPosition.xyz);
vec3 calculatedNormal = normalize(cross(dPositionX, dPositionZ));
//vec3 calculatedNormal = normalize(vec3(-dx, -dy, 1.0);
//vec3 calculatedNormal = normalize(vec3(dx, dy, vNormal.z));
// vec3 calculatedNormal = vec3(-dx, -dy, vNormal.z);

//final position
// vec4 viewPosition = viewMatrix * modelWorldPosition;
// vec4 projectedPosition = projectionMatrix * viewPosition;

//varyings
//vec3 transformed = position;
transformed . y += elevation;
//vec3 vWorldPosition = vec3(-modelWorldPosition.z, modelPosition.y, -modelPosition.x);
//objectNormal = normalize(normalMatrix*calculatedNormal);
vNormal = normalize(normalMatrix*calculatedNormal);
//vNormal = calculatedNormal;
