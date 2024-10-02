
//JONSWAP ocean spectrum function
float jonswap(float g, float Y, float a, float wp, float w, float o, float pi)
{
    
    float A= (a*(g*g))/pow(w,5.0);
    float B= exp( -(5.0/4.0) * pow((wp/w),4.0));

    float r= exp(- pow((w-wp),2.0) / (2.0 * pow(o,2.0) * pow(wp,2.0) ));

    float C= pow(Y,r);

    return A * B * C;

}   

//adapted from https://github.com/gasgiant/FFT-Ocean/blob/main/Assets/ComputeShaders/InitialSpectrum.compute
// returns wh, the angular frequency thats damped depending on depth. 
// TMA function, found in  EDWS for computer graphics, page 33, formula 29
float getAngularFrequency(float g, float f, float depth)
{
    return sqrt( g * f * tanh( min( f * depth , 20.0 )) );
}

//got it from wolfram alfa
float getAngularFrequencyDerivative(float g, float f, float depth)
{
    float tanH = tanh(min(f*depth,20.0));
    float secH = 1.0/cosh(min(f*depth,20.0));

    return (g* ( tanH + f * pow(secH,2.0) )) / ( 2.0* sqrt( g * f * tanH));
}

