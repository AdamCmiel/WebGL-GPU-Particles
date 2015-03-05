precision highp float;
uniform sampler2D samp;
varying vec2 tc;

void main(void) {
  vec4 test = texture2D(samp, tc);
  gl_FragColor = vec4(0, 1. + test.z, 0, 1.0);
}