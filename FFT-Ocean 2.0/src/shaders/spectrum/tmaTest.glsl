

//adapted from https://github.com/gasgiant/FFT-Ocean/blob/main/Assets/ComputeShaders/InitialSpectrum.compute
// returns wh, the angular frequency thats damped depending on depth. 
// TMA function, found in  EDWS for computer graphics, page 33, formula 29
float getAngularFrequency(float g, float f, float depth)
{
    return sqrt( g * f * tanh( min( k*depth , 20 )) );
}

//got it from wolfram alfa
float getAngularFrequencyDerivative(float g, float f, float depth)
{
    float tanh = tanh(min(f*depth,20))
    float sech = sech(min(f*depth,20))

    return (g* ( tanh + f * pow(sech,2) )) / ( 2.0* sqrt( g * f * tanh))
}

