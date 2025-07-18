#define USE_UV
//#define SUBSURFACE

uniform float uTime;
uniform float uDelta;

uniform sampler2D uDirection;
uniform float uEuler;
uniform float uOctaves;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLacunarity;
uniform float uGain;
uniform float uNormalDiff;

uniform float uWaveLength;
uniform float uWaveSpeed;
uniform float uPeakMultiplier;
uniform float uMaxFrequency;
uniform float uPhaseMultiplier;

varying float vHeight;
// varying vec3 vViewPosition;

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
float getElevation(float a, float D, float w, float t, float phase) {
    float ePow = pow(uEuler, (sin((D * w + t * phase)) - 1.0));
    return a * ePow;
}

//rename this
float getNormal(float a, float D, float angle, float w, float t, float phase) {
    float ePow = pow(uEuler, (sin((D * w + t * phase)) - 1.0));

    return w * angle * a * ePow * cos(D * w + t * phase);
}

#include <SPLIT>

//MAIN
#include <begin_vertex>

//PERF:
//- we should look at using the derivatives instead of central difference
//- not sure why it's not working. could be due to something further down the line?

//REFACTOR:
//- take a look through and ensure theres no redundant variables
//New Uniforms:
// - wavelength
// - speed
// - peakMultiplier
// - phaseMultiplier
// - speedMultipler

//base position
vec4 modelWorldPosition = modelMatrix * vec4(position, 1.0);

//neighboring vertex difference
vec3 modelWorldPosition_ShiftedX = modelWorldPosition.xyz + vec3(uNormalDiff, 0.0, 0.0);
vec3 modelWorldPosition_ShiftedZ = modelWorldPosition.xyz + vec3(0.0, 0.0, -uNormalDiff);
// vec4 modelWorldPosition_ShiftedX = modelMatrix * vec4(position + vec3(uNormalDiff, 0.0, 0.0), 1.0);
// vec4 modelWorldPosition_ShiftedZ = modelMatrix * vec4(position + vec3(0.0, 0.0, -uNormalDiff), 1.0);

//wave values
//float wavelength = 1.0; //REFACTOR: change to uniform : waveLength
float w = ((3.14 * 2.0) / uWaveLength) * uFrequency; //frequency
//float speed = 0.2; //REFACTOR: change to uniform : waveSpeed
float speed = uWaveSpeed;
float phase = speed * ((3.14 * 2.0) / uWaveLength);
float dx = 0.0;
float dy = 0.0;
float a = uAmplitude;

//elevation is a vector here, we need 3 values to calulate normals, where:
//- x represents the desired elevation
//- y represents the elevation shifted on the x, yes this is confusing
//- z represents the elevation shifted on the z
vec3 elevation = vec3(0.0);

//fractional brownian motion
//note, on each layer, the direction is the same, the more layers, the more
// directions we can add. It essentially runs down an array of 2d vectors
vec2 directionVec = texture(uDirection, vec2(0.0, 0.0)).xy;

for ( float i = 0.0; i < uOctaves; i ++ )
{
vec3 D = vec3(
        getDirection(directionVec, modelWorldPosition),
        getDirection(directionVec, modelWorldPosition_ShiftedX),
        getDirection(directionVec, modelWorldPosition_ShiftedZ));

//adds peaks to based on the change in partial derivative
//D += ( dx - dy ) * 1.0 ; // REFACTOR: change to uniform: peakMultiplier
D += ( dx - dy ) * uPeakMultiplier;

//update the current elevation
elevation . x += getElevation(a, D.x, w, -uTime, phase); //REFACTOR: change to uniform: phaseMultiplier

//note we're using dy for elevation x, whats that about?
//well we are just storing the values in a vector
elevation . y += getElevation(a, D.y, w, -uTime, phase);
elevation . z += getElevation(a, D.z, w, -uTime, phase);

dx += getNormal(a, D.x, directionVec.x, w, -uTime, phase);
dy += getNormal(a, D.z, directionVec.y, w, -uTime, phase);

//update the brownian motion values
a *= uLacunarity;
w = min(w*uGain, uMaxFrequency);

//speed *= 0.1 ; //REFACTOR: change to uniform: speedMultipler

phase = max(speed*uPhaseMultiplier, 0.05)* ( ( 3.14 * 2.0 ) / uWaveLength ) ;
directionVec = texture(uDirection, vec2(i/uOctaves, 0.0)). xy;
}

//update the elevations
modelWorldPosition . y += elevation . x;
modelWorldPosition_ShiftedX . y += elevation . y;
modelWorldPosition_ShiftedZ . y += elevation . z;

modelWorldPosition . x += dx;
modelWorldPosition . z += dy;
modelWorldPosition_ShiftedX . x += dx;
modelWorldPosition_ShiftedX . z += dy;
modelWorldPosition_ShiftedZ . x += dx;
modelWorldPosition_ShiftedZ . z += dy;

//calculate normal
vec3 dPositionX = (modelWorldPosition_ShiftedX.xyz - modelWorldPosition.xyz);
vec3 dPositionZ = (modelWorldPosition_ShiftedZ.xyz - modelWorldPosition.xyz);
//vec3 calculatedNormal = normalize(cross(dPositionX, dPositionZ));
vec3 calculatedNormal = normalize(cross(dPositionX, dPositionZ));

//update the material position
transformed . y += elevation . x;
transformed . x += dx;
transformed . z += dy;

//update the material normal
vNormal = normalize(normalMatrix*calculatedNormal);
vHeight = elevation . x;
vViewPosition = modelWorldPosition . xyz;
