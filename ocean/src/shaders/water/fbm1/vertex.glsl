uniform float uTime;
uniform sampler2D uDirection;

varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;
// varying float vTime;

// #include ./includes/perlinClassic3D.glsl
float getDirection(vec2 direction, vec4 position)
{
    // float value= -((direction.y)*position.z+(direction.x)*position.x);

    float value= ((direction.x)*position.x-(direction.y)*position.z);
    return value;
}

//a- amplitude
//D- direction
//w= frequency
//t-time
//speed- speed
float getElevation(float a,float D,float w,float t,float speed,float phase){
    return a*sin((D*w+t*phase));
}

float getNormal(float a,float D, float angle,float w,float t,float speed,float phase){
    return w*angle*a*cos(D*w+t*phase);
}

void main()
{

    //base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //wave values
    vec2 uBigWavesFrequency= vec2(2.0,1.0);
    float uBigWavesSpeed= 0.2;
    float wavelength=1.0;
    float a= 0.1;               //height muliplier. amplitude
    float w=((3.14*2.0)/wavelength);     //frequency
    float speed= 0.4;
    float phase= speed*((3.14*2.0)/wavelength);
    float elevation=0.0;
    float dx=0.0;
    float dy=0.0;


    //fractional brownian motion
    float octaves=5.0;
    vec2 directionVec= texture(uDirection,vec2(0.0,1.0)).xy;
    w*=0.4;
    for(float i=0.0; i<octaves; i++)
    {
        float D= getDirection(directionVec,modelPosition);

        elevation+= getElevation(a,D,w,uTime,speed,phase);
        dx+= getNormal(a, D, directionVec.x,w,uTime,speed,phase);
        dy+= getNormal(a, D, directionVec.y,w,uTime,speed,phase);

        a*=0.5;
        w*=2.0;
        // speed*=0.2;

        directionVec= texture(uDirection,vec2(i,1.0)).xy;

    }

    //calculate normal
    vec3 T=vec3(1,0,dx);
    vec3 B=vec3(0,1,dy);
    vec3 calculatedNormal= vec3(-dx,-dy,1.0);            
    modelPosition.y=elevation;

    //final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    //varyings
    vPosition=modelPosition.xyz;
    vNormal=(modelMatrix*vec4(calculatedNormal,0.0)).xyz;
}