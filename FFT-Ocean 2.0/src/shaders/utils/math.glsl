//General math functions that are unavailabe in glsl

float tanh(x,e)
{
    return ( pow(e,x) - pow(e,-x) ) / ( pow(e,x) + pow(e,-x) );
}

float sech(x,e)
{
    return 2.0 / ( pow(e,x) + pow(e,-x) );
}