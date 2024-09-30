// https://github.com/rreusser/glsl-fft?tab=readme-ov-file
// https://github.com/Themaister/GLFFT
// https://www.bealto.com/gpu-fft_opencl-1.html
// https://github.com/bane9/OpenGLFFT //!!!!


//  taken from : https://github.com/dli/waves/blob/master/simulation.js / https://github.com/dli/waves
//  more explaination: https://github.com/jbouny/fft-ocean/blob/master/js/shaders/FFTOceanShader.js
 
 precision highp float;

    const float PI = 3.14159265359;

    uniform sampler2D u_input;

    uniform float u_transformSize; // resolution ???
    uniform float u_subtransformSize; //geometry resolution ???

    // varying vec2 uv;,


    vec2 multiplyComplex (vec2 a, vec2 b) {
        return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);
    }

    void main (void) {
        vec2 uv = gl_FragCoord.xy / resolution.xy;

        #ifdef HORIZONTAL
        float index = uv.x * u_transformSize - 0.5;
        #else
        float index = uv.y * u_transformSize - 0.5;
        #endif

        float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);
        
        //transform two complex sequences simultaneously
        #ifdef HORIZONTAL
        vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;
        vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;
        #else
        vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;
        vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;
        #endif

        float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);
        vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));

        vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);
        vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);

        // outputA+=1000
        // outputB+=1000
        
        gl_FragColor = vec4(outputA, outputB);
        // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }