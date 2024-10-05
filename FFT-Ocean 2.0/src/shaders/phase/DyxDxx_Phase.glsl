
uniform float uTime;
uniform sampler2D waveDataTexture;
uniform sampler2D h0kTexture;

vec2 ComplexMult(vec2 a, vec2 b)
{
	return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 wave= texture(waveDataTexture,uv);
    vec4 h0= texture(h0kTexture,uv);

	float phase = wave.w * uTime;
	vec2 exponent = vec2(cos(phase), sin(phase));
	vec2 h = ComplexMult(h0.xy, exponent) + ComplexMult(h0.zw, vec2(exponent.x, -exponent.y));
	vec2 ih = vec2(-h.y, h.x);

    vec2 displacementX_dx = -h * wave.x * wave.x * wave.y;
	vec2 displacementY_dx = ih * wave.x;
	vec2 displacementZ_dx = -h * wave.x * wave.z * wave.y;
		 
	vec2 displacementY_dz = ih * wave.z;
	vec2 displacementZ_dz = -h * wave.z * wave.z * wave.y;

	vec2 Dyx_Dyz = vec2(displacementY_dx.x - displacementY_dz.y, displacementY_dx.y + displacementY_dz.x);
	vec2 Dxx_Dzz = vec2(displacementX_dx.x - displacementZ_dz.y, displacementX_dx.y + displacementZ_dz.x);
    gl_FragColor= vec4(Dyx_Dyz,Dxx_Dzz);
    // gl_FragColor= vec4(exponent,0.0,1.0);
    
    // gl_FragColor= vec4();
}