
const float PI = 3.14159265359;
const float G = 9.81;
const float KM = 370.0;
const float CM = 0.23;

uniform vec2 u_wind;
uniform float u_resolution;
uniform float u_size;

varying vec2 vUv;

float square (float x) {
return x * x;
}

float omega (float k) {
return sqrt(G * k * (1.0 + square(k / KM)));
}

float tanH (float x) {
return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));
}

void main()
{
    vec2 coordinates = vUv-0.5;

    float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;
    float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;

    vec2 K = (2.0 * PI * vec2(n, m)) / u_size;
    float k = length(K);

    float l_wind = length(u_wind);

    float Omega = 0.84;
    float kp = G * square(Omega / l_wind);

    float c = omega(k) / k;
    float cp = omega(kp) / kp;

    float Lpm = exp(-1.25 * square(kp / k));
    float gamma = 1.7;
    float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));
    float Gamma = exp(-square(sqrt(k / kp) - 1.0) / 2.0 * square(sigma));
    float Jp = pow(gamma, Gamma);
    float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));
    float alphap = 0.006 * sqrt(Omega);
    float Bl = 0.5 * alphap * cp / c * Fp;

    float z0 = 0.000037 * square(l_wind) / G * pow(l_wind / cp, 0.9);
    float uStar = 0.41 * l_wind / log(10.0 / z0);
    float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));
    float Fm = exp(-0.25 * square(k / KM - 1.0));
    float Bh = 0.5 * alpham * CM / c * Fm * Lpm;

    float a0 = log(2.0) / 4.0;
    float am = 0.13 * uStar / CM;
    float Delta = tanH(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));

    float cosPhi = dot(normalize(u_wind), normalize(K));

    float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));

    float dk = 2.0 * PI / u_size;
    float h = sqrt(S / 2.0) * dk;

    if (K.x == 0.0 && K.y == 0.0) {
        h = 0.0; //no DC term
    }


    // gl_FragColor = vec4(K.x,0.0,0.0, 1.0);
    // gl_FragColor = vec4(normalize(K),1.0, 1.0);
    gl_FragColor = vec4(coordinates, 0.0, 1.0);
    gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 0.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}