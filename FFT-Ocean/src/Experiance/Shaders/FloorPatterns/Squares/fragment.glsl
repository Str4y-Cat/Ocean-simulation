uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

vec3 squares(
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

    uv.x= step(0.5,uv.x);
    uv.y= step(0.5,uv.y);

    float Y= abs(uv.x-uv.y);

    return vec3(Y);
}
void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;
    vec3 dotColor=vec3(0.0,0.0,0.0);

    float falloff= distance(vPosition,vec3(cameraPosition.x,0.0,cameraPosition.z));
    
    falloff=1.0- smoothstep(6.0,100.0,falloff);
    falloff= pow(falloff,5.0);
    //radius
    color= squares(
        color, //base color
        10.0,   //dot amount
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