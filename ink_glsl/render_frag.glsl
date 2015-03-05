precision highp float;
uniform sampler2D samp;
varying vec2 tc;

void main(void) {
  vec4 test = texture2D(samp, tc);
  gl_FragColor = vec4(1. - test.z, 1. - test.z, 1. - test.z, 1.0);
  // gl_FragColor = vec4(1, 1. + test.y, 1, 1.0);
}
