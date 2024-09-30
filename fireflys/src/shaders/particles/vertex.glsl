varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
 

    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    //picture
    
    // float pictureIntesity= texture(uDisplacementTexture,uv).r;

    


    //Varyings
    // vColour= vec3(pow(pictureIntesity,3.0));
    vNormal=normal;
    vPosition=modelPosition.xyz;

}