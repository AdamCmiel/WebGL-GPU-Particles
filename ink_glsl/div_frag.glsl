precision highp float;
uniform sampler2D samp;
varying vec2 tc;
const float n = 512., h = 1./n;

void main(void) {
   vec4 t = texture2D(samp, tc);
   //update velocity
   vec4 right = texture2D(samp, vec2(tc.x + h, tc.y));
   vec4 up = texture2D(samp, vec2(tc.x, tc.y + h));
   t.x -= n * (right.w - t.w);
   t.y -= n * (up.w - t.w);
   gl_FragColor = t;
}
