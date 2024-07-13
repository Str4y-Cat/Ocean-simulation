// uniform vec3 uDepthColor;
// uniform vec3 uSurfaceColor;
// uniform float uColorOffset;
// uniform float uColorMultiplier;
uniform float uTime;
uniform samplerCube uEnvironmentTexture;

// varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec3 vWorldPosition;


#include ../lights/ambient.glsl
// #include ../lights/directional.glsl
#include ../lights/point.glsl
#include ../lights/directional.glsl


void main()
{
    // float positionColor=smoothstep(-0.5,1.0,vPosition.y);
    vec3 normal= normalize(vNormal);
    vec3 colorSea= vec3(1.0,1.0,1.0);
    vec3 viewDirection= normalize(vPosition-cameraPosition);


    //world reflecions
    vec3 viewDirection_flippedx= reflect(viewDirection,vec3(1.0,0.0,0.0));
    vec3 reflectionDirection= reflect(viewDirection_flippedx,normal);
    vec3 environmentLight=textureCube(uEnvironmentTexture,reflectionDirection).xyz;
    
    float fresnel=1.0+ dot(viewDirection,normal);
    fresnel= pow(fresnel,1.0);
    

    //light
    vec3 light= vec3(0.0);
    light+=ambientLight(
        vec3(0.0,0.0,0.2),  //light color
        0.5        //light intensity
    );
    vec3 finalColor=mix(light,environmentLight,fresnel);
    


    // gl_FragColor = vec4(normal, 1.0);
    // gl_FragColor = vec4(0.0,normal.g,0.0, 1.0);
    // gl_FragColor = vec4(vec3(light), 1.0);
    // vec3 textureColor=(textureCube(uEnvironmentTexture,reflectionDirection).xyz);
    // gl_FragColor = vec4(textureCube(uEnvironmentTexture,reflectionDirection),1.0);
    // temp=normalize(temp);
    gl_FragColor = vec4(finalColor,1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}