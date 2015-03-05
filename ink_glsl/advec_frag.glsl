precision highp float;
uniform sampler2D samp;
varying vec2 tc;
const float h = 1./512., dt = .001, tau = .5*dt/h, dt0 = dt*512.0;

void main(void) {
  vec4 state = texture2D(samp, tc);
  
}


// precision highp float;
// uniform sampler2D samp;
// varying vec2 tc;
// const float h = 1./512., dt = .001, tau = .5*dt/h;

// void main(void) {
//   vec4 t = texture2D(samp, tc);
//   vec4 left = texture2D(samp, vec2(tc.x - h, tc.y));
//   vec4 below = texture2D(samp, vec2(tc.x, tc.y - h));

//   vec2 D = -tau * vec2(t.x + left.x, t.y + below.y);
//   vec2 Df = floor(D);
//   //Df is difference of the left and below state from the tc's state.  
//   vec2 Dd = D - Df;
//   //Dd is the opposite direction of Df
  
//   vec2 tc1 = tc + Df * h;
//   vec3 new =  
//      (texture2D(samp, tc1).xyz * (1. - Dd.y) + texture2D(samp, vec2(tc1.x, tc1.y + h)).xyz * Dd.y)*(1. - Dd.x) +
//      (texture2D(samp, vec2(tc1.x + h, tc1.y)).xyz*(1. - Dd.y) + texture2D(samp, vec2(tc1.x + h, tc1.y + h)).xyz*Dd.y)*Dd.x;
   
//    gl_FragColor = vec4( new, t.w );
//    // gl_FragColor = t;
// }
