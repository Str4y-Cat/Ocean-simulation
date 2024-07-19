uniform vec3 uColor;
uniform samplerCube uEnvironment;

varying vec3 vNormal;
varying vec3 vPosition;


#include ../lights/ambient.glsl
#include ../lights/directional.glsl
#include ../lights/point.glsl

void main()
{
    vec3 color = uColor;
    vec3 normal= normalize(vNormal);
    vec3 test = vPosition;
    // test.z*= -1.0;
    // test.x*= -1.0;
    
    vec3 viewDirection= normalize(test-cameraPosition);


    //light relections
    vec3 reflectionDirection= reflect(viewDirection,normal);
    vec4 temp=textureCube(uEnvironment,reflectionDirection);

    // color*=light;
    // Final color
    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = vec4(vNormal, 1.0);
    // gl_FragColor = vec4(fresnel, 1.0);

    // gl_FragColor = vec4(temp);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}