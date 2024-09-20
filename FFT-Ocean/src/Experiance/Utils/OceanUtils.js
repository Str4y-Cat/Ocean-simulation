import * as THREE from 'three'

export default class OceanUtils 
{
    
    gaussianRandom(){
        const u1= Math.random()
        const u2= Math.random()

        const x= Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2)
        const y= Math.sqrt(-2*Math.log(u1))*Math.sin(2*Math.PI*u2)
        return (new THREE.Vector3(x,y))
    }

    gaussianTexture(width=64,height=64)
    {
        

        const size = width * height;
        const data = new Uint8Array( 4 * size );
        

        for ( let i = 0; i < size; i ++ ) {
            const gaussian= this.gaussianRandom()
            const stride = i * 4;
            data[ stride + 0 ] = gaussian.x*255;
            data[ stride + 1 ] = gaussian.z*255;
            data[ stride + 2 ] = 0;
            data[ stride + 3 ] = 255;
        }

        // used the buffer to create a DataTexture
        const texture = new THREE.DataTexture( data, width, height );
        texture.needsUpdate = true;
        return texture
    }

    getJONSWAP(w)
    {
        console.log('doing spectrum')
        //User Variables
        const F= 10
        const U= 100


        //constants
        const g=9.8                         //gravity
        const a= 0.076*((U**2)/F*g)**0.22    //numeric constant
        const wp= 22*(g**2/U*F)**(1/3)      //?
        const Y= 3.3                        //relates to linear changes
        const o= (w<=wp)?0.07:0.09          //deviance

        const r= Math.exp(-((w-wp)**2)/(2*(o**2)*(wp**2)))
        

        ((a*(g**2))/w**5)*Math.exp(-(5/4)*(wp/w)**4)*Y**r

        // const resultPt1
        // const resultPt2
        // const resultPt3
        const result= ((a*(g**2))/w**5)*Math.exp(-(5/4)*(wp/w)**4)*Y**r

        console.log(r)
    }






}