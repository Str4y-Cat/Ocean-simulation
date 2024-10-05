uniform sampler2D initialSpectrumTexture;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    vec2 h0k= texture(initialSpectrumTexture,uv).xy;
    vec2 h0MinusK= texture(initialSpectrumTexture, 1.0 - uv).xy;
    
    gl_FragColor= vec4(h0k,h0MinusK.x, -h0MinusK.y);
}