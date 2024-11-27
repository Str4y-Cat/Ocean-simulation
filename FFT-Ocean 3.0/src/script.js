// https://github.com/Spiri0/Threejs-WebGPU-IFFT-Ocean-V2/tree/main
//

import * as THREE from 'three/tsl';
//import * as THREE from 'three';
import WebGPU from 'three/addons/capabilities/WebGPU.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


//--------------------------------
// global variables

let camera, scene, renderer

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

//--------------------------------
// MAIN FUNCTION 


function main() {
	console.log("hi from main")



	const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

	const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

	scene.add(box);

}
//--------------------------------
// FUNCTIONS 


//--------------------------------
// THREE.JS REQUIRED

function sceneInit() {
	scene = new THREE.Scene();

	console.log('initiating scene', scene)
}

function cameraInit() {
	// Base camera
	camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
	//camera.position.set(1, 2, 1)
	//console.log('initiating camera', camera)
	//const aspect = window.innerWidth / window.innerHeight;
	//camera = new THREE.OrthographicCamera(- aspect, aspect, 1, - 1, 0, 2);
	camera.position.z = 2;
}

function rendererInit() {
	renderer = new THREE.WebGPURenderer(
		{
			antialias: true
		});

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(sizes.width, sizes.height);
	renderer.setAnimationLoop(render);
	document.body.appendChild(renderer.domElement);

	controlsInit(renderer.domElement)

	console.log('initiating renderer', renderer)
	// compute init

	//renderer.computeAsync(computeInitNode);
}

function controlsInit(canvas) {
	//const canvas = document.querySelector(canvas)
	if (canvas) {


		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
	}
}

function resizeInit() {
	function onWindowResize() {
		// Update sizes
		sizes.width = window.innerWidth
		sizes.height = window.innerHeight

		// Update camera
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix()

		// Update renderer
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}


	window.addEventListener('resize', onWindowResize)
}

function render() {

	//time functions

	// compute step

	/*
	renderer.compute(phase ? computeToPong : computeToPing);

	material.map = phase ? pongTexture : pingTexture;
	
	phase = !phase;
	*/


	// render step

	// update material texture node

	renderer.render(scene, camera);
}


function init() {
	sceneInit()
	cameraInit()

	main()

	rendererInit()
	resizeInit()
}

init()
