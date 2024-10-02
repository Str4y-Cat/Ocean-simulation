//constants
uniform sampler2D uRandomDistribution;
uniform float pi; //no shit dude   
uniform float lengthScale; //Not sure why we need this
uniform float highCutoff;
uniform float lowCutoff;

//ocean spectrum variables
uniform float g; //gravity
uniform float Y; //peak enhancement
uniform float a; //spectral energy factor
uniform float wp;//peak frequency 
uniform float h;//depth

//directional spreading variables
uniform float windAngle;
uniform float swellStrength;

#include ./includes/waveSpectra/tma.glsl
#include ./includes/waveSpectra/depthAttenuation.glsl
#include ./includes/directionalSpreading/windDirection.glsl
#include ./includes/directionalSpreading/swellDirection.glsl

void main()
{
    /* -------------------------------------------------------------------------------

    SET UP VARIABLES
    ----------------------------------------------------------------------------------*/
    float deltaK = 2 * pi / lengthScale;
    
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float f= abs(distance(uv,vec2(0.5,0.5))); //f= distance from the origin
    // float w= 2.0 * pi * f;  
    float w= getAngularFrequency( g,  f,  h); //w= angular frequency


    /* -------------------------------------------------------------------------------

    WAVE SPECTRUM FUNCTION
    calculates the amplitude, frequency and direction of wave, based on input factors
    ----------------------------------------------------------------------------------*/

    float o = 0.09;
    if(w<=wp)
    {
        o = 0.07;
    }

    float S = jonswap(g, Y, a, wp, w, o, pi) * depthAttenuation(w,h,g); //dont know if this is correct, must check on sim once created

 
    /* -------------------------------------------------------------------------------

    DIRECTIONAL SPREADING FUNCTION
    calculates the direction of the waves based on the direction of the wind.
    Also, allows for another factor, swell. Although i havent figured out the 
    implementation yet
    ----------------------------------------------------------------------------------*/

    //atan can choke on a carrot
    float waveWindAngle;
    vec4 testcolor=vec4(vec3(0.0),1.0);
    float original = atan(uv.y-0.5,uv.x-0.5) - windAngle;
    float deg = atan(uv.y-0.5,uv.x-0.5);
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


    /* -------------------------------------------------------------------------------

    COMBINE THE DIRECTIONAL SPREAD AND ENERGY FUNCTIONS
    ----------------------------------------------------------------------------------*/

    vec4 randomDispertion= texture(uRandomDistribution,uv);
    randomDispertion.x= clamp(randomDispertion.x, 0.0 , 1.0);
    randomDispertion.y= clamp(randomDispertion.y, 0.0 , 1.0);


    float h0= 1.0 / sqrt(2.0) * (randomDispertion.x + randomDispertion.y)*sqrt(S*D);



    /* -------------------------------------------------------------------------------

    RENDER
    ----------------------------------------------------------------------------------*/

    // general
    //----------------------------------------
    // gl_FragColor= vec4(1.0,1.0,1.0,1.0);
    // gl_FragColor= vec4(randomDispertion.x,randomDispertion.y,0.0,1.0);



    //  spectral energy debug
    //----------------------------------------
    // gl_FragColor=vec4(S,0.0,0.0,1.0);


    //  directional spreading debug
    //----------------------------------------
    // gl_FragColor= vec4(Dswell,0.0,0.0,1.0);
    // gl_FragColor= vec4(Dwind,0.0,0.0,1.0);
    // gl_FragColor= vec4(waveWindAngle,0.0,0.0,1.0);
    // gl_FragColor= vec4(testcolor);


    //  random dispertion debug
    //----------------------------------------
    //  gl_FragColor=vec4(gaussianRandom);


    //final render
    //----------------------------------------
    gl_FragColor= vec4(h0,0.0,0.0,1.0);

}