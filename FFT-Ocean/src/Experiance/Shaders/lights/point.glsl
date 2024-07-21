vec3 pointLight(
    vec3 lightColor,
    float lightIntensity,
     vec3 normal, 
     vec3 lightPosition,
     vec3 viewDirection,
     float specularPower,
     vec3 position, 
     float lightDecay)
{

    vec3 lightDelta=lightPosition-position;

    vec3 lightDirection= normalize((lightDelta));
    float lightDistance= length(lightDelta);
    normal= normalize(normal);
    vec3 lightReflection= reflect(-lightDirection,normal);



    //Shading
    float shading= dot(normal,lightDirection);
    // shading = clamp(shading,0.0,0.1);
    shading = max(shading,0.0);

    //specular
    float specular= -dot(lightReflection,viewDirection);
    // specular = clamp(specular,0.0,0.1);
    specular = max(specular,0.0);
    specular = pow(specular,specularPower);

    //decay
    float decay=1.0-lightDistance*lightDecay;
    decay = max(decay,0.0);


    return lightColor*lightIntensity*decay*(shading+specular);
    // return vec3(decay);
}