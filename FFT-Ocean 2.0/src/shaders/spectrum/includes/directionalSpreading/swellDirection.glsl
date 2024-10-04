// float factorial(float n) {
//   float result = 1.0;
//   for (float i = n; i > 1.0; i--)
//     result *= i;
//   return result;
// }

// //move these to a dedicated maths includes file
// float eulerGamma(float n)
// {
//     return factorial(n - 1.0);
// }


// float Q(float s, float pi)
// {
//     float resultant= ( (pow(2.0,(2.0 * s - 1.0 )) / pi) * ( pow(eulerGamma(s+1.0),2.0) / eulerGamma(2.0 * s + 1.0) )  );
//     return resultant;
// }


// //Based on mitsuyasu directional spreading function
// float swellDirection(float w, float wp, float theta, float E)
// {
//     float s = 16.0 * tanh(wp/w) * pow(E,2.0);
//     float D= Q(s, pi) * pow( abs( cos( theta/2.0 )),2.0*s);
//     return D;

// }

//based off https://github.com/gasgiant/FFT-Ocean/blob/main/Assets/ComputeShaders/InitialSpectrum.compute
// could not find where in the studies references by gasgiant, this formula can be found. shall remain a mystery

float NormalisationFactor(float s)
{
	float s2 = s * s;
	float s3 = s2 * s;
	float s4 = s3 * s;
	if (s < 5.0)
		return -0.000564 * s4 + 0.00776 * s3 - 0.044 * s2 + 0.192 * s + 0.163;
	else
		return -4.80e-08 * s4 + 1.07e-05 * s3 - 9.53e-04 * s2 + 5.90e-02 * s + 3.93e-01;
}

float Cosine2s(float theta, float s)
{
	return NormalisationFactor(s) * pow(abs(cos(0.5 * theta)), 2.0 * s);
}

float SpreadPower(float w, float wp)
{
	if (w > wp)
	{
		return 9.77 * pow(abs(w / wp), -2.5);
	}
	else
	{
		return 6.97 * pow(abs(w / wp), 5.0);
	}
}

float swellDirection(float w, float wp, float theta, float swellAngle, float E, float pi )
{
  float s = SpreadPower(w, wp) + 16.0 * tanh(min(w / wp, 20.0)) * E * E;
  return   Cosine2s(theta - swellAngle, s);
//  float swell= Cosine2s(theta - swellAngle, s);

  // return mix(2.0 / 3.1415 * cos(theta) * cos(theta), swell, 0.5);
}


