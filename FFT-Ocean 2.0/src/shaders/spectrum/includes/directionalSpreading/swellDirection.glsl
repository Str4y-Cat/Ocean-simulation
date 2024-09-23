float factorial(float n) {
  float result = 1.0;
  for (float i = n; i > 1.0; i--)
    result *= i;
  return result;
}

//move these to a dedicated maths includes file
float eulerGamma(float n)
{
    return factorial(n - 1.0);
}


float Q(float s, float pi)
{
    float resultant= ( (pow(2.0,(2.0 * s - 1.0 )) / pi) * ( pow(eulerGamma(s+1.0),2.0) / eulerGamma(2.0 * s + 1.0) )  );
    return resultant;
}


//Based on mitsuyasu directional spreading function
float swellDirection(float w, float wp, float theta, float E)
{
    float s = 16.0 * tanh(wp/w) * pow(E,2.0);
    float D= Q(s, pi) * pow( abs( cos( theta/2.0 )),2.0*s);
    return D;

}





