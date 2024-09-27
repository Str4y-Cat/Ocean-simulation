import * as THREE from 'three'

function gaussianRandom()
{
    const u1= Math.random()
    const u2= Math.random()

    const x= Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2)
    const y= Math.sqrt(-2*Math.log(u1))*Math.sin(2*Math.PI*u2)

    return (new THREE.Vector3(x,y))
}

export function get2DTexture(width=64,height=64)
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

export function gaussianTexture(size,texture)
{
    
    const SIZE = size * size;
    
    
    for ( let i = 0; i < SIZE; i ++ ) {
        const gaussian     = gaussianRandom()
        const stride       = i * 4;
        texture.image.data[ stride + 0 ] = gaussian.x;
        texture.image.data[ stride + 1 ] = gaussian.y;
        texture.image.data[ stride + 2 ] = 0;
        texture.image.data[ stride + 3 ] = 1;
    }

    return texture
}
