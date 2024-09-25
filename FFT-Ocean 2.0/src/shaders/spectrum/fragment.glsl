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
varying vec3 vPosition;


#include ./includes/waveSpectra/jonswap.glsl
#include ./includes/waveSpectra/depthAttenuation.glsl
#include ./includes/directionalSpreading/windDirection.glsl
#include ./includes/directionalSpreading/swellDirection.glsl


void main()
{

    //get P(ki)
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

    //atan can choke on a carrot
    float waveWindAngle;
    vec4 testcolor=vec4(vec3(0.0),1.0);
    float original = atan(vUv.y-0.5,vUv.x-0.5) - windAngle;
    float deg = atan(vUv.y-0.5,vUv.x-0.5);
    bool posAxis= windAngle >= 0.0 && (deg> windAngle) || (deg< (-pi + windAngle));
    bool negAxis = windAngle < 0.0 && (deg> windAngle) && (deg< (pi + windAngle));

    if(posAxis||negAxis)
    {
        if(  posAxis )
            {
                //blue
                if(deg>= 0.0)
                {   
                    testcolor=vec4(0.0,0.0,1.0,1.0);
                    waveWindAngle = deg - windAngle;
                }

                //lightblue
                if(deg< 0.0)
                {
                    testcolor=vec4(0.0,1.0,1.0,1.0);
                    waveWindAngle = pi + deg + pi-windAngle;

                }
            }

        //windagle is theta and negative
        if(negAxis)
        {
            
            //red
            if(deg>= 0.0)
            {
                testcolor=vec4(1.0,0.0,0.0,1.0);
                waveWindAngle=deg-windAngle;
            }

            //yellow
            if(deg< 0.0)
            {
                testcolor=vec4(1.0,1.0,0.0,1.0);
                waveWindAngle=deg-windAngle;


            }
        }
    }
    
    else
    {
            if(deg>= 0.0)
            {
                
                
                testcolor=vec4(0.75,0.75,0.75,1.0);
                waveWindAngle = deg - windAngle;

                if(windAngle<0.0)
                {
                    testcolor=vec4(0.75,0.0,0.75,1.0);
                    waveWindAngle= -(( pi- deg) +pi+ windAngle);

                }

            }
            if(deg< 0.0)
            {
                
                testcolor=vec4(0.2,0.2,0.1,1.0);
                   waveWindAngle=deg-windAngle;

            }
    }

    

    float E= swellStrength;
    float Dwind = windDirection( w, wp,  waveWindAngle, pi);


    //Calculate swell
    float Dswell= swellDirection( w,  wp,  windAngle,  E);


    //combine directional spread
    float D= Dwind;//*Dswell;






    vec4 gaussian= texture2D(uGaussianDistribution,vUv);       //make this a 2  dimensional texture. i.e only x and y
    gaussian.x= clamp(gaussian.x, 0.0 , 1.0);
    gaussian.y= clamp(gaussian.y, 0.0 , 1.0);


    float h0= 1.0 / sqrt(2.0) * (gaussian.x + gaussian.y)*sqrt(S*D);
    

    gl_FragColor= vec4(h0,0.0,0.0,1.0);
    // gl_FragColor= vec4(Dswell,0.0,0.0,1.0);
    // gl_FragColor= vec4(Dwind,0.0,0.0,1.0);
    // gl_FragColor= vec4(waveWindAngle,0.0,0.0,1.0);
    // gl_FragColor= vec4(testcolor);
    // float test = distance(vPosition.xy, vec2(0.0));
    // float test = distance(vUv.xy, vec2(0.5));
    // gl_FragColor= vec4((waveWindAngle),0.0,0.0,1.0);
    // gl_FragColor= vec4((original),0.0,0.0,1.0);
}