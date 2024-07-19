uniform float uTime;
uniform sampler2D uDirection;
uniform float uEuler;
uniform float uOctaves;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uLacunarity;
uniform float uGain;


varying float vElevation;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
varying vec3 vWorldPosition;
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
    float ePow= pow(uEuler,(sin((D*w+t*phase))-1.0));
    return a*ePow;
}

float getNormal(float a,float D, float angle,float w,float t,float speed,float phase){
    float ePow= pow(uEuler,(sin((D*w+t*phase))-1.0));

    return w*angle*a*ePow*cos(D*w+t*phase);
}

void main()
{

    //base position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //wave values
    vec2 uBigWavesFrequency= vec2(2.0,1.0);
    float uBigWavesSpeed= 0.2;
    float wavelength=1.0;
    float a= 1.0;               //height muliplier. amplitude
    float w=((3.14*2.0)/wavelength);     //frequency
    float speed= 0.3;
    float phase= speed*((3.14*2.0)/wavelength);
    float elevation=0.0;
    float dx=0.0;
    float dy=0.0;
    float lacunarity=uLacunarity;
    float gain= uGain;


    //fractional brownian motion
    float octaves=uOctaves;
    vec2 directionVec= texture(uDirection,vec2(0.0,0.0)).xy;
    w*= uFrequency;
    a= uAmplitude;
    // a=0.2;
    // a=0.0;
    for(float i=0.0; i<octaves; i++)
    {
        float D= getDirection(directionVec,modelPosition);
        D+=(dx-dy);
        elevation+= getElevation(a,D,w,-uTime,speed,phase);
        dx+= getNormal(a, D, directionVec.x,w,-uTime,speed,phase);
        dy+= getNormal(a, D, directionVec.y,w,-uTime,speed,phase);

        a*=lacunarity;
        // a*=0.78;
        // a*=0.0;
        w*=gain;
        // w*=1.28;
        speed*=0.1;

        directionVec= texture(uDirection,vec2(i/octaves,0.0)).xy;

    }

    //calculate normal
    vec3 T=vec3(1,0,dx);
    vec3 B=vec3(0,1,dy);
    vec3 calculatedNormal= vec3(-dx,-dy,1.0);            
    modelPosition.y+=elevation;

    //final position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    //varyings
    vPosition=modelPosition.xyz;
    vWorldPosition = vec3(-modelPosition.z, modelPosition.y, -modelPosition.x);
    vNormal=(modelMatrix*vec4(calculatedNormal,0.0)).xyz;
    vColor=texture(uDirection,vec2(-1.0,0.0));
}