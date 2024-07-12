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
    vec3 viewDirection= normalize(vPosition-cameraPosition);
    // vec3 lig= normalize(vPosition-cameraPosition);
    vec3 reflectionDirection= reflect(viewDirection,normal);
    vec4 temp=textureCube(uEnvironment,reflectionDirection);
    // temp=normalize(temp);
    // vec3 light= vec3(0.0);
    // light+= ambientLight(
    //     vec3(1.0),  //light color
    //     0.03        //light intensity
    //     );
    // light+= directionalLight(
    //     vec3(0.1,0.1,1.0),  //light color
    //     1.0,        //light intensity
    //     vNormal,    //model normals
    //     vec3(0.0,0.0,3.0),   //light positions
    //     viewDirection,
    //     20.0
    //     );
    // light+= pointLight(
    //     vec3(1.0,0.1,0.1),  //light color
    //     1.0,        //light intensity
    //     vNormal,    //model normals
    //     vec3(0,2.5,0),   //light positions
    //     viewDirection,
    //     20.0,
    //     vPosition,
    //     0.25
    //     );

    // light+= pointLight(
    //     vec3(0.1,1.0,0.5),  //light color
    //     1.0,        //light intensity
    //     vNormal,    //model normals
    //     vec3(2.0,2.0,2.0),   //light positions
    //     viewDirection,
    //     20.0,
    //     vPosition,
    //     0.25
    //     );

    
    // color*=light;
    // Final color
    // gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vNormal, 1.0);
    gl_FragColor = vec4(temp);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}