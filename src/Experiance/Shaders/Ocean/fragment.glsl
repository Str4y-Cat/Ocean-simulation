// uniform vec3 uDepthColor;
// uniform vec3 uSurfaceColor;
// uniform float uColorOffset;
// uniform float uColorMultiplier;
uniform float uTime;
uniform float uFresnelPow;
uniform samplerCube uEnvironmentTexture;
uniform vec3 uColor;
uniform vec2 uRay;

// varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;
//varying vec4 vColor;
varying vec3 vWorldPosition;

#include ../lights/ambient.glsl
// #include ../lights/directional.glsl
#include ../lights/point.glsl
#include ../lights/spot.glsl
#include ../lights/directional.glsl

void main()
{
    vec3 normal = normalize(vNormal);
    vec3 colorSea = vec3(1.0, 1.0, 1.0);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float distanceFromCamera = length(vPosition - cameraPosition);

    vec3 viewDirection_flippedx = viewDirection;
    vec3 reflectionDirection = reflect(viewDirection_flippedx, normal);
    reflectionDirection = reflect(reflectionDirection, vec3(1.0, 0.0, 0.0));
    vec3 environmentLight = textureCube(uEnvironmentTexture, reflectionDirection).xyz;

    float fresnel = 1.0 + dot(viewDirection, normal);
    fresnel = pow(fresnel, uFresnelPow);

    //light
    vec3 light = vec3(0.0);
    light += ambientLight(
            // vec3(0.0, 0.235, 0.372), //light color
            uColor, //light color
            0.04 //light intensity
        );

    light += pointLight(
            // vec3(1.0, 1.0, 0.929), //light color
            vec3(0.2, 0.2, 0.02), //light color
            2.5, //intensity
            normal, //normal, no shit
            vec3(uRay.x, 4.0, -uRay.y), // position
            viewDirection, //view direction
            1.0, //specularpower
            vPosition, //position
            0.13 // lightDecay
        );
    // light += spotLight(
    //         // vec3(1.0, 1.0, 0.929), //light color
    //         vec3(1.0, 1.0, 1.0), //light color
    //         0.7, //intensity
    //         normal, //normal, no shit
    //         vec3(0.0, 4.0, 0.0), // position
    //         viewDirection, //view direction
    //         1.0, //specularpower
    //         vPosition, //position
    //         0.13 // lightDecay
    //     );

    vec3 finalColor = mix(light, environmentLight, fresnel);
    //vec3 finalColor = mix(light, vec3(0.0, 0.0, 0.01), fresnel);

    light = mix(light, vec3(0.0), max(distanceFromCamera / 50.0, 0.2));

    //gl_FragColor = vec4(finalColor, 1.0);
    // gl_FragColor = vec4(uColor, 1.0);
    gl_FragColor = vec4(light, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
