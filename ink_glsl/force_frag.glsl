precision highp float;
uniform sampler2D samp;
uniform float force ;
varying vec2 tc;
const float h = 1./512.;

void main(void) {
  vec4 t = texture2D(samp, tc);
  vec4 test = texture2D(samp, vec2(tc.x, tc.y + h));
  t.y += force *(t.z + test.z);

  gl_FragColor = t;
}