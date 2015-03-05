precision highp float;
uniform sampler2D samp;
varying vec2 tc;
const float h = 1./512., h2 = 1./1024.;
void main(void) {
  vec4 t = texture2D(samp, tc);
  t.w =
    (texture2D(samp, vec2(tc.x - h, tc.y)).w +
    texture2D(samp, vec2(tc.x + h, tc.y)).w +
    texture2D(samp, vec2(tc.x, tc.y - h)).w +
    texture2D(samp, vec2(tc.x, tc.y + h)).w -
    (texture2D(samp, vec2(tc.x + h, tc.y)).x -
    texture2D(samp, vec2(tc.x - h, tc.y)).x +
    texture2D(samp, vec2(tc.x, tc.y + h)).y -
    texture2D(samp, vec2(tc.x, tc.y - h)).y) *h2) *.25;
  gl_FragColor = t;
}