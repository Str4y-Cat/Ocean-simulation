import * as THREE from 'three'

function gaussianRandom()
{
    const u1= Math.random()
    const u2= Math.random()

    const x= Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2)
    const y= Math.sqrt(-2*Math.log(u1))*Math.sin(2*Math.PI*u2)

    return (new THREE.Vector3(x,y))
}

export function gaussianTexture(width=64,height=64)
{
    
    const size = width * height;
    const data = new Uint8Array( 4 * size );
    
    for ( let i = 0; i < size; i ++ ) {
        const gaussian     = gaussianRandom()
        const stride       = i * 4;
        data[ stride + 0 ] = gaussian.x*255;
        data[ stride + 1 ] = gaussian.y*255;
        data[ stride + 2 ] = 0;
        data[ stride + 3 ] = 1;
    }

    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture( data, width, height );
    texture.needsUpdate = true;
    return texture
}


export class JONSWAP
{
    constructor(fetch, windSpeed)
    {
        this.F=fetch                        //fetch
        this.U=windSpeed                    //windSpeed

        this.g= 9.8                         //gravity
        this.Y= 3.3                         //peakEnhancement
        this.a= this.getSpectralEnergy()    //spectralEnergy
        this.wp= this.getPeakFrequency()    //peakFrequency

        this.o= 0.07
        console.table(this)
    }
    
    //checked
    getPeakFrequency()
    {
        return 22*(
            Math.pow((this.g**2)/(this.U*this.F),1/3)
        )
    }

    //checked
    getSpectralEnergy()
    {
         return 0.076 * (
            Math.pow(
                (this.U**2)/(this.F*this.g),0.22
            ))
    }

    getSpectralWidth(w)
    {
        return (w<=this.wp)? 0.07 : 0.09
    }

    /**
     * returns spectral density based on input frequency
     * based on JONSWAP equation, found here  https://wikiwaves.org/Ocean-Wave_Spectra
     *  
     * @param {*} f frequency 
     * @returns 
     */
    getJONSWAP(f)
    {
        const w= 2* Math.PI * f
        //checked
    

        const A= (this.a*(this.g**2))/Math.pow(w,5)
        //checked


        const B= Math.exp(
            -(5/4) * Math.pow((this.wp/w),4)
        )
        //checked

        const o = this.getSpectralWidth(w)
        const r= Math.exp
        (
            -((w-this.wp)**2)/(2* o**2 * this.wp**2 )
        )
        // console.log("r: ",r)

        const C= Math.pow(this.Y,r)
        // console.log("c: ",C)

        return A*B*C

    }
}