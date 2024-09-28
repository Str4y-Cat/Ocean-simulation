
//JONSWAP ocean spectrum function
float jonswap(float g, float Y, float a, float wp, float w, float o, float pi)
{
    
    float A= (a*(g*g))/pow(w,5.0);
    float B= exp( -(5.0/4.0) * pow((wp/w),4.0));

    float r= exp(- pow((w-wp),2.0) / (2.0 * pow(o,2.0) * pow(wp,2.0) ));

    float C= pow(Y,r);

    return A * B * C;

}   