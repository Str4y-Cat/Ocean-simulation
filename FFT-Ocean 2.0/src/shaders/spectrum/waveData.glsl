
uniform float g; //gravity
uniform float h;//depth

#include ./includes/waveSpectra/tma.glsl

void main()
{

    /* -------------------------------------------------------------------------------

    SET UP VARIABLES
    ----------------------------------------------------------------------------------*/
    //TODO:
    //convert these values to uniforms
    float highCutoff = 0.7; // allows for cascades
    float lowCutoff = 0.0;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float f= abs(distance(uv,vec2(0.5,0.5))); //f= distance from the origin
    // float w= 2.0 * pi * f;  
    float w= getAngularFrequency( g,  f,  h); //w= angular frequency

    vec4 wavesData;
    

    /* -------------------------------------------------------------------------------
    CUTTOFF CHECK
    ----------------------------------------------------------------------------------*/
    //this is for the cascades in future tweaks
    if( lowCutoff <= f)
    {
        wavesData=vec4(uv.x,1.0/f,uv.y,w);
        // gl_FragColor= vec4(Dswell,0.0,0.0,1.0);
        
    }
    else
    {
        wavesData=vec4(uv.x,1.0,uv.y,0);
    }
    /* -------------------------------------------------------------------------------

    RENDER
    ----------------------------------------------------------------------------------*/

    // general
    //----------------------------------------
    // gl_FragColor= vec4(test,0.0,0.0,1.0);

    // gl_FragColor= vec4(randomDispertion.x,randomDispertion.y,0.0,1.0);

    //final render
    //----------------------------------------
    gl_FragColor= vec4(wavesData);
    // 
    
}