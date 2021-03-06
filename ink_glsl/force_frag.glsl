precision highp float;
uniform sampler2D samp;
uniform float force;
varying vec2 tc;
const float h = 1./512.;

void main(void) {
  vec4 t = texture2D(samp, tc);
  //z is density
  
  // not too different here. 
  vec4 below = texture2D(samp, vec2(tc.x, tc.y + h));
  t.y -= force * (t.z + below.z);
  
  gl_FragColor = t;
}
