precision highp float;
uniform sampler2D samp;
varying vec2 tc;
const float h = 1./512., dt = .001, tau = .5*dt/h;

void main(void) {
   vec2 D = -tau*vec2(
     texture2D(samp, tc).x + texture2D(samp, vec2(tc.x - h, tc.g)).x,
     texture2D(samp, tc).y + texture2D(samp, vec2(tc.x, tc.y - h)).y );
   vec2 Df = floor(D),   Dd = D - Df;
   vec2 tc1 = tc + Df*h;
   vec3 new =  
     (texture2D(samp, tc1).xyz * (1. - Dd.y) + texture2D(samp, vec2(tc1.x, tc1.y + h)).xyz * Dd.y)*(1. - Dd.x) +
     (texture2D(samp, vec2(tc1.x + h, tc1.y)).xyz*(1. - Dd.y) + texture2D(samp, vec2(tc1.x + h, tc1.y + h)).xyz*Dd.y)*Dd.x;
   
   gl_FragColor = vec4( new, texture2D(samp, tc).w );
}