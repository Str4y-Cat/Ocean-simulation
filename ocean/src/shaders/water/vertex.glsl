uniform float uTime;
uniform vec2 uWaveAngle1;
uniform vec2 uWaveAngle2;
uniform vec2 uWaveAngle3;
uniform vec2 uWaveAngle4;


varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;
// varying float vTime;

// #include ./includes/perlinClassic3D.glsl
float getDirection(vec2 direction, vec4 position)
{
    float value= ((direction.x)*position.x-(direction.y)*position.z);
    return value;
}

//a- amplitude
//D- direction
//w= frequency
//t-time
//speed- speed
float getElevation(float a,float D,float w,float t,float speed){
    return a*sin((D*w+t*(speed*w)));
}

float getNormal(float a,float D, float angle,float w,float t,float speed){
    return w*angle*a*cos(D*w+t*(speed*w));
}


void main()
{

    
    

    // vec3 tempPosition= position;
    // float elevation= sin(3.0);
    // modelPosition.y=elevation;




    //base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //waves
    // float elevation=    sin(modelPosition.x*uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
    //                     sin(modelPosition.z*uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
    //                     uBigWavesElevation;   
    //vales
    vec2 uBigWavesFrequency= vec2(2.0,1.0);
    float uBigWavesSpeed= 0.2;
    float wavelength=1.0;
    float a= 0.3;               //height muliplier. amplitude
    float w=(3.14*2.0)/wavelength;     //frequency
    float speed= 0.1;
    float phase= speed*((3.14*2.0)/wavelength);
    float D1=getDirection(uWaveAngle1,modelPosition);
    float D2= getDirection(uWaveAngle2,modelPosition);
    float D3= getDirection(uWaveAngle3,modelPosition);
    float D4= getDirection(uWaveAngle4,modelPosition);

    // vec3 direction= vec3(0.0,0.0,0)
    // float elevation= a*sin((D1*w+uTime*(speed*w)));
    float elevation=0.0;
    float dx=0.0;
    float dy=0.0;

    
        w*=0.3;
        
     elevation+= getElevation(a,D1,w,uTime,speed);
     dx+= getNormal(a, D1, uWaveAngle1.x,w,uTime,speed);
     dy+= getNormal(a, D1, uWaveAngle1.y,w,uTime,speed);

        a*=0.5;
        w*=2.0;
        speed*=1.5;
     elevation+= getElevation(a,D2,w,uTime,speed);
     dx+= getNormal(a, D2, uWaveAngle2.x,w,uTime,speed);
     dy+= getNormal(a, D2, uWaveAngle2.y,w,uTime,speed);

        a*=0.5;
        w*=2.0;
        speed*=1.1;
     elevation+= getElevation(a,D3,w,uTime,speed);
     dx+= getNormal(a, D3, uWaveAngle3.x,w,uTime,speed);
     dy+= getNormal(a, D3, uWaveAngle3.y,w,uTime,speed);

     a*=0.1;
        w*=5.0;
        speed*=1.1;
     elevation+= getElevation(a,D3,w,uTime,speed);
     dx+= getNormal(a, D4, uWaveAngle3.x,w,uTime,speed);
     dy+= getNormal(a, D4, uWaveAngle3.y,w,uTime,speed);




    vec3 T=vec3(1,0,dx);
    vec3 B=vec3(0,1,dy);
    // vec3 calculatedNormal= (cross(B,T));






    vec3 calculatedNormal= vec3(-dx,-dy,1.0);

                        
    modelPosition.y=elevation;

    //final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    vPosition=modelPosition.xyz;
    vNormal=(modelMatrix*vec4(calculatedNormal,0.0)).xyz;
}