precision highp float;
uniform sampler2D samp;
uniform float force;
varying vec2 tc;
const float h = 1.0/512.0;
const float a = 0.1;


void main(void) {
  vec4 state = texture2D(samp, tc);
  //z is density
  vec4 up = a * texture2D(samp, vec2(tc.x, tc.y+h));
  vec4 down = a * texture2D(samp, vec2(tc.x, tc.y-h));
  vec4 left = a * texture2D(samp, vec2(tc.x-h, tc.y));
  vec4 right = a * texture2D(samp, vec2(tc.x+h, tc.y));
  
  vec4 test = state + up + down + left + right - a*4.0*state;
  test.y += 0.001;
  gl_FragColor = test;
}


// precision highp float;
// uniform sampler2D samp;
// uniform float force;
// varying vec2 tc;
// const float h = 1./512.;

// void main(void) {
//   vec4 t = texture2D(samp, tc);
//   //z is density
  
//   // not too different here. 
//   vec4 below = texture2D(samp, vec2(tc.x, tc.y + h));
//   t.y -= force * (t.z + below.z);
  
//   gl_FragColor = t;
// }
