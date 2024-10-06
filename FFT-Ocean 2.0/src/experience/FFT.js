THREE.Ocean.prototype.renderSpectrumFFT = function() {

	// GPU FFT using Stockham formulation
	var iterations = Math.log2( this.resolution ) * 2; // log2
	
	this.scene.overrideMaterial = this.materialOceanHorizontal;
	var subtransformProgram = this.materialOceanHorizontal;
	
	// Processus 0-N
	// material = materialOceanHorizontal
	// 0 : material( spectrumFramebuffer ) > pingTransformFramebuffer
	
	// i%2==0 : material( pongTransformFramebuffer ) > pingTransformFramebuffer
	// i%2==1 : material( pingTransformFramebuffer ) > pongTransformFramebuffer
	
	// i == N/2 : material = materialOceanVertical
	
	// i%2==0 : material( pongTransformFramebuffer ) > pingTransformFramebuffer
	// i%2==1 : material( pingTransformFramebuffer ) > pongTransformFramebuffer
	
	// N-1 : materialOceanVertical( pingTransformFramebuffer / pongTransformFramebuffer ) > displacementMapFramebuffer
	
	var frameBuffer;
	var inputBuffer;
	
	for (var i = 0; i < iterations; i++) {
		if (i === 0) {
			inputBuffer = this.spectrumFramebuffer;
			frameBuffer = this.pingTransformFramebuffer ;
		} 
		else if (i === iterations - 1) {
			inputBuffer = ((iterations % 2 === 0)? this.pingTransformFramebuffer : this.pongTransformFramebuffer) ;
			frameBuffer = this.displacementMapFramebuffer ;
		}
		else if (i % 2 === 1) {
			inputBuffer = this.pingTransformFramebuffer;
			frameBuffer = this.pongTransformFramebuffer ;
		}
		else {
			inputBuffer = this.pongTransformFramebuffer;
			frameBuffer = this.pingTransformFramebuffer ;
		}
		
		if (i === iterations / 2) {
			subtransformProgram = this.materialOceanVertical;
			this.scene.overrideMaterial = this.materialOceanVertical;
		}
		
		subtransformProgram.uniforms.u_input.value = inputBuffer;
		
		subtransformProgram.uniforms.u_subtransformSize.value = Math.pow(2, (i % (iterations / 2) + 1 )); //set the uniform subtransform
		this.renderer.render(this.scene, this.oceanCamera, frameBuffer); //compute
	}
	
};


