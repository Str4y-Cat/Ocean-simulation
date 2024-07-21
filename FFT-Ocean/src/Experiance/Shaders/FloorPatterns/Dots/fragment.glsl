uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 pointColor,
    vec3 normal
)
{
    //dots
    vec2 uv = vUv*10.0;
    uv*=repetitions;
    uv=mod(uv,1.0);

    float point= distance(uv,vec2(0.5));
    point= 1.0-step(0.05,point);

    return mix(color,pointColor,point);
}
void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;
    vec3 dotColor=vec3(0.0,0.0,0.0);

    float falloff= distance(vPosition,cameraPosition);
    
    falloff=1.0- smoothstep(2.0,100.0,falloff);
    falloff= pow(falloff,0.5);
    //radius
    color= halftone(
        color, //base color
        20.0,   //dot amount
        dotColor,  //color point
        normal
    );


    color=mix(uColor,color,falloff);
    

    // Final color
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(uv,1.0, 1.0);
    // gl_FragColor = vec4(point,point,point, 1.0);
    // gl_FragColor = vec4(intensity,intensity,intensity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}