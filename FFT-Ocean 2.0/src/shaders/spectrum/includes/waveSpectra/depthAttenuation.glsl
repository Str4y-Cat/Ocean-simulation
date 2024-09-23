float depthAttenuation(float w,float h,float g)
{
    float wh = w*sqrt(h/g);
    
    if(wh > 1.0)
    {
        return 1.0 - ( 1.0 / 2.0 ) * pow( ( 2.0 - wh ) , 2.0 );
    }
    return (1.0/2.0) * pow(wh,2.0);
}