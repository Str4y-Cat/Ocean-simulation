uniform vec3 uColor;
uniform float uIntensity;

varying vec3 vColour;
varying vec3 vNormal;
varying vec3 vPosition;
void main()
{
    vec3 normal= normalize(vNormal);
    vec3 viewDirection= normalize(vPosition-cameraPosition);
    float fresnel= dot(viewDirection,normal);
    // fresnel=abs(fresnel);
    fresnel= pow(fresnel,50.0)*uIntensity;

    // gl_FragColor= vec4(vec3(distanceToCenter),1.0);
    gl_FragColor = vec4(uColor, fresnel);
    // gl_FragColor = vec4(vNormal, 1.0);
    // gl_FragColor = vec4(vec3(fresnel), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}