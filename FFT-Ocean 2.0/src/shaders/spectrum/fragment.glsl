uniform sampler2D uGaussianDistribution;

uniform float F; //fetch
uniform float U; //windspeed
uniform float g; //gravity
uniform float Y; //peak enhancement
uniform float a; //spectral energy factor
uniform float wp;//peak frequency 

uniform float h;//depth

uniform float windAngle;
uniform float swellStrength;

uniform float pi; //no shit dude   

varying vec2 vUv; 

#include ./includes/waveSpectra/jonswap.glsl
#include ./includes/waveSpectra/depthAttenuation.glsl
#include ./includes/directionalSpreading/dbDirectionalSpread.glsl


void main()
{

    //get P(k)
    float f= abs(distance(vUv,vec2(0.5,0.5))); //f= distance from the origin

    float w= 2.0 * pi * f;  //w= angular frequency
    
    /**
    Calculating the Wave Energy Spectrum S(w)
    */
    float o = 0.09;
    if(w<=wp)
    {
        o = 0.07;
    }

    //TMA Spectrum
    float S = jonswap( F, U, g, Y, a, wp, w, o, pi); //* depthAttenuation(w,h,g); dont know if this is correct, must check on sim once created


    /**
    Calculationg the directional spread D(w,theta)
    */
    // float waveWindAngle = atan((vUv.y-0.5),(vUv.x-0.5)) * 2.0;
    
    float waveWindAngle= abs((atan((vUv.y-0.5),(vUv.x-0.5)) - windAngle)); //BEST ONE SO FAR
    // waveWindAngle/=(pi/2.0);
    // float waveWindAngle=mod(atan((vUv.y-0.5),(vUv.x-0.5)) - windAngle, 2.0 *pi);
    // float waveWindAngle=mod(abs(atan((vUv.y-0.5),(vUv.x-0.5)) - windAngle),4.0 *pi);

    vec2 target=vec2(0.0,0.5);
    // float waveWindAngle = atan((vUv.y-0.5),(vUv.x-0.5)) - atan((target.y),target.x);

    float E= swellStrength;
    float D = dbDirectionalSpread( w, wp,  waveWindAngle, pi);









    vec4 gaussian= texture2D(uGaussianDistribution,vUv);       //make this a 2  dimensional texture. i.e only x and y
    gaussian.x= clamp(gaussian.x, 0.0 , 1.0);
    gaussian.y= clamp(gaussian.y, 0.0 , 1.0);


    float h0= 1.0 / sqrt(2.0) * (gaussian.x + gaussian.y)*sqrt(S*D);
    

    gl_FragColor= vec4(h0,0.0,0.0,1.0);
    // gl_FragColor= vec4(D,0.0,0.0,1.0);
    // gl_FragColor= vec4(waveWindAngle,0.0,0.0,1.0);
    // gl_FragColor= vec4(gaussian.xy,0.0,1.0);
}