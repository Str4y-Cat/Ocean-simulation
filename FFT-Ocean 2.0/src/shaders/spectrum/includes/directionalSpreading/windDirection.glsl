
//directional spread function by doneal-banner
//found at "emperical directional wave spectra for computer graphics" by Christopher J. Horvath, page 35
float windDirection(float w, float wp, float waveWindAngle, float pi)
{
    float wwp=w/wp;
    float B= 2.61 * pow((wwp),1.3);
    float E= -0.4 + 0.89393 * exp( -0.567 * log( pow( wwp , 2.0 )));



    if(0.9 <= wwp  && wwp < 1.6)
    {
        B= 2.28 * pow((wwp),-1.3);
    }
    if(1.6 <= wwp)
    {
        B= 2.28 * pow((wwp),-1.3);
    }

    float spread= ( B / (2.0 * tanh(B * pi) ) ) * pow( 1.0 / cosh(B * waveWindAngle) , 2.0 );

    return spread;
}