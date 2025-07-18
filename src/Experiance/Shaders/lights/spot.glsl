vec3 spotLight(
    vec3 lightColor,
    float lightIntensity,
    vec3 normal,
    vec3 lightPosition,
    vec3 viewDirection,
    float specularPower,
    vec3 position,
    float lightDecay)
{
    //ensure normal is normalized
    normal = normalize(normal);

    //get the difference between the pixel and light position
    vec3 lightDelta = lightPosition - position;

    //get the direction of the light
    vec3 lightDirection = normalize((lightDelta));

    //get the distance of the light
    float lightDistance = length(lightDelta);

    //calculate the reflection
    vec3 lightReflection = reflect(-lightDirection, normal);

    //Shading
    float shading = dot(normal, lightDirection);
    shading = max(shading, 0.0);

    if (shading < 0.0) {
        return vec3(0.0);
    }

    //specular
    float specular = -dot(lightReflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, specularPower);

    //decay
    float decay = 1.0 - lightDistance * lightDecay;
    decay = max(decay, 0.0);

    //return lightColor * lightIntensity * decay;
    return lightColor * lightIntensity * decay * (shading + specular);
    // return vec3(decay);
}
