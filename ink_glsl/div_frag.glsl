precision highp float;
uniform sampler2D samp;
varying vec2 tc;
const float n = 512., h = 1./n;

void main(void) {
  //responsible for pushing the ink down and out.  
   vec4 t = texture2D(samp, tc);
   // t.x -= (texture2D(samp, vec2(tc.x + h, tc.y)).w - t.w)*n;
   // t.y -= (texture2D(samp, vec2(tc.x, tc.y + h)).w - t.w)*n;
   gl_FragColor = t;
}
