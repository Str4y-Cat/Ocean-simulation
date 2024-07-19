import * as THREE from 'three'



export  function directionTexture(value,varience,count)
{
    const width = count;
    const height = 1;
    
    const size = width * height;
    const data = new Uint8Array( 4 * size );
    
   
    
    
    for ( let i = 0; i < size; i ++ ) {
        const waveDirection= randomDirection(value,varience)
        const r = Math.floor( waveDirection.x * 255 );
        const g = Math.floor( waveDirection.y * 255 );

        const stride = i * 4;
        data[ stride ] = r;
        data[ stride + 1 ] = g;
        data[ stride + 2 ] = 0;
        data[ stride + 3 ] = 0;
    }
    
    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture( data, width, height );
    texture.needsUpdate = true;
    return texture
}

function randomDirection(value,varience)
{
    // if(value>2){
    //     value=value%2
    // }
    // value=0.0
    let randomValue= (Math.random()-0.5)*2
    //  randomValue= 0
    value+=randomValue*varience
    value+=randomValue*varience
    value=Math.random()*2
    // if(value>2 ||value<-2)
    // {

    // }
    // console.log(value)
    const direction=(new THREE.Vector2(Math.cos(value*Math.PI),Math.sin(value*Math.PI)))
    // console.log(`direction:`)
    direction.normalize()
    // console.log(direction)
    // const color = new THREE.Color();

    return direction
}