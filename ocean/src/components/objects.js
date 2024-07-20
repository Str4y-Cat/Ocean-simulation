import * as THREE from 'three'


export default class AddObjects
{
    constructor(scene)
    {
        this.scene= scene
        this.octaves= this.octaves
        this.
    }

    addObject()
    {
        const geometry= new THREE.SphereGeometry(0.5)
        const material = new THREE.MeshBasicMaterial({color:'white'})

        const mesh= new THREE.Mesh(geometry,material)

        this.scene.add(mesh)
    }

    float(object)
    {
        const position= {...object.position}


    }
        
    getYCoord()
    {
        
        
        let wavelength=1.0;
        let a= 1.0;               //height muliplier. amplitude
        let w=((3.14*2.0)/wavelength);     //frequency
        let speed= 0.3;
        let phase= speed*((3.14*2.0)/wavelength);
        let elevation=0.0;
        let dx=0.0;
        let dy=0.0;
        let lacunarity=uLacunarity;
        let gain= uGain;

        let octaves=uOctaves;
        vec2 directionVec= texture(uDirection,vec2(0.0,0.0)).xy;
        w*= uFrequency;
        a= uAmplitude;

        for(let i=0.0; i<octaves; i++)
            {
                let D= getDirection(directionVec,modelPosition);
                D+=(dx-dy);
                elevation+= getElevation(a,D,w,-uTime,speed,phase);
                dx+= getNormal(a, D, directionVec.x,w,-uTime,speed,phase);
                dy+= getNormal(a, D, directionVec.y,w,-uTime,speed,phase);
                
                a*=lacunarity;
                w*=gain;
                speed*=0.1;
        
                directionVec= texture(uDirection,vec2(i/octaves,0.0)).xy;
        
            }
    }

    getElevation( a, D, w, t, phase){
        const ePow= (uEuler,(sin((D*w+t*phase))-1.0))**2;
        return a*ePow;
    }
    






}