uniform float uTime;
uniform sampler2D uSpectrumTexture;


void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 spectrum= texture(uSpectrumTexture,uv);
    // gaussianRandom.x-=sin(uTime)/5.0;
    float color= sin(uTime);
    color= smoothstep(-1.0,1.0,color);
    // gl_FragColor= vec4(color,0.0,0.0,1.0);
    gl_FragColor= vec4(spectrum);
}