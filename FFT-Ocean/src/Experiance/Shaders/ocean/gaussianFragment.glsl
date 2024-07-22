uniform sampler2D uTexture; 

varying vec2 vUv;

void main()
{
    vec3 color= texture2D(uTexture, vUv).rgb;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(h, 0.0, 0.0, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}