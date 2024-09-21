uniform sampler2D uGaussianDistribution;

uniform float F; //fetch
uniform float U; //windspeed
uniform float g; //gravity
uniform float Y; //peak enhancement
uniform float a; //spectral energy factor
uniform float wp;//peak frequency 
uniform float pi; //no shit dude   

varying vec2 vUv; 

#include ../includes/jonswap.glsl
void main()
{

    //get P(k)
    //f= distance from the origin

    float f= abs(distance(vUv,vec2(0.5,0.5)));

    float w= 2.0 * pi * f;
    
    float o = 0.09;

    if(w<=wp)
    {
        o = 0.07;
    }

    float P = jonswap( F, U, g, Y, a, wp, w, o, pi);


    vec4 gaussian= texture2D(uGaussianDistribution,vUv);       //make this a 2  dimensional texture. i.e only x and y
    gaussian.x= clamp(gaussian.x, 0.0 , 1.0);
    gaussian.y= clamp(gaussian.y, 0.0 , 1.0);


    float h0= 1.0 / sqrt(2.0) * (gaussian.x + gaussian.y)*sqrt(P);

    gl_FragColor= vec4(h0,0.0,0.0,1.0);
    // gl_FragColor= vec4(gaussian.xy,0.0,1.0);
}