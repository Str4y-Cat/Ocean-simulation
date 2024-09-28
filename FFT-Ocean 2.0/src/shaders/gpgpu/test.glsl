// uniform float uTime;
uniform sampler2D uRandom;


void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 gaussianRandom= texture(uRandom,uv);
    // gaussianRandom.x-=sin(uTime)/5.0;

    // gl_FragColor= vec4(1.0,0.0,0.0,1.0);
    gl_FragColor= vec4(gaussianRandom);
}