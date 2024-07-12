uniform samplerCube uEnvironment;
varying vec3 vWorldPosition;

void main(){
	vec3 normalizedVWorldPosition = normalize(vWorldPosition);
  vec3 outcolor = textureCube(uEnvironment, normalizedVWorldPosition).rgb;

  gl_FragColor = vec4(outcolor, 1.0);
}