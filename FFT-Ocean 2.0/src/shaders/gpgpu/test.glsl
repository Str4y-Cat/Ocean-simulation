uniform float uTime;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 gaussianRandom= texture(uSpectrum,uv);
    gaussianRandom.x-=sin(uTime)/5.0;

    gl_FragColor= vec4(gaussianRandom);
}