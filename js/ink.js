
var gl, prog_advec, prog_force, prog_p, prog_div, prog_show,
    FBO, FBO1, texture, texture1,
    timer, delay = 0, it = 10, frames = 0, time, animation,
    n = 512, sampLoc;

var ext;

var shaders = {
  advec_frag: '',
  density_frag: '',
  div_frag: '',
  force_frag: '',
  render_frag: '',
  vertex: ''
};

var gl = Sketch.create({
  // element : document.body,
  type: Sketch.WEBGL,
  autostart: false
});

// TODO embed a video for non-WebGL enabled browsers
if ( !gl ) {
    alert( 'WebGL not detected' );
}

gl.setup = function() {
  loadShaders(function() {

    // var canvas = document.getElementById("canvas");
    // var err = "Your browser does not support ";
    // gl = canvas.getContext("webgl");
    // ext = gl.getExtension("OES_texture_float");
    
    // if (!gl || !ext){
    //   alert(err+"WebGL. See http://get.webgl.org");
    //   return;
    // }

     prog_force = createProgram(shaders.force_frag, shaders.vertex);
     gl.useProgram(prog_force);
     gl.uniform1f(gl.getUniformLocation(prog_force, "force"), .001*.5*2 );

     prog_advec  = createProgram( shaders.advec_frag, shaders.vertex );
     
     prog_p  = createProgram( shaders.density_frag, shaders.vertex );
     
     prog_div  = createProgram( shaders.div_frag, shaders.vertex );
     gl.useProgram(prog_div);
     gl.uniform1i(gl.getUniformLocation(prog_div, "samp"), 1);

     prog_show  = createProgram( shaders.render_frag, shaders.vertex );

     gl.useProgram(prog_advec);
     var aPosLoc = gl.getAttribLocation(prog_advec, "aPos");
     var aTexLoc = gl.getAttribLocation(prog_advec, "aTexCoord");
     gl.enableVertexAttribArray( aPosLoc );
     gl.enableVertexAttribArray( aTexLoc );
     var data = new Float32Array([-1,-1, 0,0,  1,-1, 1,0,  -1,1, 0,1,
       1,1, 1,1]);
     gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
     gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
     gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, gl.FALSE, 16, 0);
     gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, gl.FALSE, 16, 8);
     gl.uniform1i(gl.getUniformLocation(prog_advec, "samp"), 1);

     var pixels = [],  h = 2/n, T;
     for(var i = 0; i<n; i++)
       for(var j = 0; j<n; j++){
         var x = h*(j-n/2),  y = h*(i-n/2);
         if (x*x + y*y > .2) T = 0; else T= -2;
         pixels.push( 0, 0, T, 0 );
       }
     texture = gl.createTexture();
     gl.activeTexture(gl.TEXTURE0);
     gl.bindTexture(gl.TEXTURE_2D, texture);
     gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0,
       gl.RGBA, gl.FLOAT, new Float32Array(pixels));
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

     texture1 = gl.createTexture();
     gl.activeTexture(gl.TEXTURE1);
     gl.bindTexture(gl.TEXTURE_2D, texture1);
     gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0,
       gl.RGBA, gl.FLOAT, new Float32Array(pixels));
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

     FBO = gl.createFramebuffer();
     gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
       gl.TEXTURE_2D, texture, 0);
     if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
       alert(err + "FLOAT as the color attachment to an FBO");
     FBO1 = gl.createFramebuffer();
     gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
         gl.TEXTURE_2D, texture1, 0);

     gl.useProgram(prog_p);
     sampLoc  = gl.getUniformLocation(prog_p, "samp");

     timer = setInterval(fr, 500);
     time = new Date().getTime();
     animation = "animate";
  //   draw();
     anim();

  });
}

function draw(){
   gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
   gl.useProgram(prog_force);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
   gl.useProgram(prog_advec);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   gl.useProgram(prog_p);
   for(var i = 0; i < it; i++){
    gl.uniform1i(sampLoc, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.uniform1i(sampLoc, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   }
   gl.uniform1i(sampLoc, 0);
   gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
   gl.useProgram(prog_div);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

   gl.useProgram(prog_show);
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   frames++;
}
function anim(){
   draw();
   switch ( animation ){
     case "reset":
      var pixels = [], T, h = 2/n;
      for(var i = 0; i<n; i++)
       for(var j = 0; j<n; j++){
        var x = h*(j-n/2),  y = h*(i-n/2);
        // if (x*x + y*y > .05) T = 0; else T= -2;
        pixels.push( 0, 0, 0, 0 );
       }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0,
       gl.RGBA, gl.FLOAT, new Float32Array(pixels));
      
      gl.bindTexture(gl.TEXTURE_2D, texture1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0,
       gl.RGBA, gl.FLOAT, new Float32Array(pixels));
      animation = "animate";
     case "animate":
       if (delay == 0) requestAnimationFrame(anim);
       else setTimeout("requestAnimationFrame(anim)", delay);
       break;
     case "stop":
       break;
   }
}
function run(v) {
  if( animation == "animate" ){
    animation = "stop";
    document.getElementById('runBtn').value = "Run ";}
  else{
    animation = "animate";
    document.getElementById('runBtn').value = "Stop";
    anim();
  }
}
function reset() {
  if( animation == "stop" ){
    animation = "reset";
    document.getElementById('runBtn').value = "Stop";
    anim();}
  else animation = "reset";
}
function fr(){
  var ti = new Date().getTime();
  var fps = Math.round(1000*frames/(ti - time));
  document.getElementById("framerate").value = fps;
  frames = 0;  time = ti;
}
function setDelay(val) {
  delay = parseInt(val);
}
function setIt(val) {
  it = parseInt(val);
}
function setBu(v) {
  var bu = v.valueOf();
  gl.useProgram(prog_force);                //    c = dt*b/2
  gl.uniform1f(gl.getUniformLocation(prog_force, "force"), .001*.5*bu );
}

function loadShaders( callback ) {
    var queue = 0;
    function loadHandler( name, req ) {
        return function() {
            shaders[ name ] = req.responseText;
            if ( --queue <= 0 ) callback();
        };
    }
    for ( var name in shaders ) {
        queue++;
        var req = new XMLHttpRequest();
        req.onload = loadHandler( name, req );
        req.open( 'get', 'ink_glsl/' + name + '.glsl', true );
        req.send();
    }
}

function createShader( source, type ) {
    var shader = gl.createShader( type );
    gl.shaderSource( shader, source );
    gl.compileShader( shader );
    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
        throw gl.getShaderInfoLog( shader );
    return shader;
}

function createProgram(fragmentSource, vertexSource) {
    var vs = createShader( vertexSource, gl.VERTEX_SHADER );
    var fs = createShader( fragmentSource, gl.FRAGMENT_SHADER );
    var program = gl.createProgram();
    gl.attachShader( program, vs );
    gl.attachShader( program, fs );
    gl.linkProgram( program );
    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
        throw gl.getProgramInfoLog( program );
    return program;
}



// /*
// ------------------------------------------------------------

// Config

// ------------------------------------------------------------
// */

// // Number of particles
// var PARTICLE_COUNT = Math.pow( 1024, 2 );

// // Particle count must be power of 2
// var PARTICLE_COUNT_SQRT = Math.sqrt( PARTICLE_COUNT );

// // How many texture slots each particle needs for it's data
// var PARTICLE_DATA_SLOTS = 2;

// // The required size of the FBO containing the particle data
// var PARTICLE_TEXTURE_WIDTH = PARTICLE_COUNT_SQRT * PARTICLE_DATA_SLOTS;
// var PARTICLE_TEXTURE_HEIGHT = PARTICLE_COUNT_SQRT;

// // How many particles can be emitted at a given time
// var PARTICLE_EMIT_RATE = 1000;

// // Programs
// var physicsProgram;
// var renderProgram;
// var debugProgram;

// // Buffers and textures
// var particleUVDataBuffer;  //render uses this to tell which part of texture is particle
// var particleFramebuffer;   //its like a second screen, tell webgl to render to this buffer, instead of canvas.  
//                            //render output contains the result of the physics step.  

// var viewportQuadBuffer;    // basically four corners, -1 to 1, tells physics world to be square???

// var particleData;          //float 32 array to hold initial particle data
// var particleDataTexture;   //a texture that holds particle data, position, velocity, etc.  

// // Shaders
// var shaders = {
//     physics_vert: '',
//     physics_frag: '',
//     render_vert: '',
//     render_frag: '',
//     debug_vert: '',
//     debug_frag: ''
// };

// var debugToggle = document.querySelector( '.toggle-fbo .toggle' );

// // Sketch instance (augmented WebGL context)
// var gl = Sketch.create({
//     type: Sketch.WEBGL,
//     autostart: false
// });

// // TODO embed a video for non-WebGL enabled browsers
// if ( !gl ) {
//     alert( 'WebGL not detected' );
// }

// gl.setup = function() {
//     loadShaders( function() {

//         // Set persistant states
//         gl.clearColor( 0.0, 0.0, 0.0, 0.0 );

//         // Store some extra data we'll need
//         gl.particleIndex = 0;

//         // Enable extensions - this won't work without floating point textures!
//         if ( !gl.getExtension( 'OES_texture_float' ) ) alert( 'Float textures not supported' );

//         // Create shader programs
//         physicsProgram = createProgram( shaders.physics_vert, shaders.physics_frag );
//         renderProgram = createProgram( shaders.render_vert, shaders.render_frag );
//         debugProgram = createProgram( shaders.debug_vert, shaders.debug_frag );

//         // Store physics program attribute and uniform locations
//         physicsProgram.aVertexPositionLoc = gl.getAttribLocation( physicsProgram, 'aVertexPosition' );
//         physicsProgram.uParticleDataLoc = gl.getUniformLocation( physicsProgram, 'uParticleData' );
//         physicsProgram.uViewportLoc = gl.getUniformLocation( physicsProgram, 'uViewport' );

//         // Store render program attribute and uniform locations
//         renderProgram.uParticleTextureLoc = gl.getUniformLocation( renderProgram, 'uParticleTexture' );
//         renderProgram.uParticleDataLoc = gl.getUniformLocation( renderProgram, 'uParticleData' );
//         renderProgram.aParticleUVLoc = gl.getAttribLocation( renderProgram, 'aParticleUV' );

//         // Store debug program attribute and uniform locations
//         debugProgram.aVertexPositionLoc = gl.getAttribLocation( debugProgram, 'aVertexPosition' );
//         debugProgram.uParticleDataLoc = gl.getUniformLocation( debugProgram, 'uParticleData' );

//         // Enable array attribute slots in programs
//         gl.enableVertexAttribArray( physicsProgram.aVertexPositionLoc );
//         gl.enableVertexAttribArray( renderProgram.aParticleUVLoc );
//         gl.enableVertexAttribArray( debugProgram.aVertexPositionLoc );

//         // Setup the initial particle data (4 components per particle slot, all zeros)
//         particleData = new Float32Array( 4 * PARTICLE_COUNT * PARTICLE_DATA_SLOTS );

//         // Create a texture to hold the particle data
//         particleDataTexture = gl.createTexture();
//         particleDataTexture.unit = 0;

//         // Activate the correct texture unit and bind the texture to it
//         gl.activeTexture( gl.TEXTURE0 + particleDataTexture.unit );
//         gl.bindTexture( gl.TEXTURE_2D, particleDataTexture );

//         // Fill the texture with the initial particle data
//         gl.texImage2D(
//             // target, level, internal format, width, height 
//             gl.TEXTURE_2D, 0, gl.RGBA, PARTICLE_TEXTURE_WIDTH, PARTICLE_TEXTURE_HEIGHT,
//             // border, data format, data type, pixels
//             0, gl.RGBA, gl.FLOAT, particleData
//         );

//         // Disable bilinear filtering when minifying / magnifying texture
//         gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
//         gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

//         // Clamp the texture to the edge (don't repeat)
//         gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
//         gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

//         // Create a framebuffer for the physics simulations to render updated particle data to and 
//         // populate it with the initial particle data stored inside `particleDataTexture`
//         particleFramebuffer = gl.createFramebuffer();
//         gl.bindFramebuffer( gl.FRAMEBUFFER, particleFramebuffer );
//         gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, particleDataTexture, 0 );

//         // Create UV coordinates for each particle (0 -> 1). This will tell the physics shader where
//         // to find each particle's data inside the particle texture
//         var particleUVData = new Float32Array( PARTICLE_COUNT * 2 );
//         var interval = 1.0 / PARTICLE_COUNT_SQRT;

//         for ( var i = 0, u = 0, v = 1; i < PARTICLE_COUNT; i++, u = i * 2, v = u + 1 ) {
//             particleUVData[ u ] = interval * ~~( i % PARTICLE_COUNT_SQRT ); // u
//             particleUVData[ v ] = interval * ~~( i / PARTICLE_COUNT_SQRT ); // v
//         }

//         // Buffer in the particle UV data for the render program
//         particleUVDataBuffer = gl.createBuffer();
//         gl.bindBuffer( gl.ARRAY_BUFFER, particleUVDataBuffer );
//         gl.bufferData( gl.ARRAY_BUFFER, particleUVData, gl.STATIC_DRAW );
//         gl.enableVertexAttribArray( renderProgram.aParticleUVLoc );

//         // Create geometry for a fullscreen clipspace quad
//         var viewportQuadVertices = new Float32Array([
//             -1.0, -1.0, // 2----3
//              1.0, -1.0, // | \  |
//             -1.0,  1.0, // |  \ |
//              1.0,  1.0  // 0----1
//         ]);

//         // Buffer in the geometry, used to fill FBOs at the full size of the viewport
//         viewportQuadBuffer = gl.createBuffer();
//         gl.bindBuffer( gl.ARRAY_BUFFER, viewportQuadBuffer );
//         gl.bufferData( gl.ARRAY_BUFFER, viewportQuadVertices, gl.STATIC_DRAW );

//         // Create a texture for the particle image asset
//         var particleTexture = gl.createTexture();
//         particleTexture.unit = 1;

//         // Load the particle asset into the texture
//         var particleTextureImage = new Image();
//         particleTextureImage.src = 'img/particle.png';
//         particleTextureImage.onload = function() {

//             // Activate the correct texture unit and bind the texture to it
//             gl.activeTexture( gl.TEXTURE0 + particleTexture.unit );
//             gl.bindTexture( gl.TEXTURE_2D, particleTexture );
//             gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
//             gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
//             gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
//             gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
//             gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, particleTextureImage );
//             gl.generateMipmap( gl.TEXTURE_2D );
//         };

//         // Set physics program uniform values
//         gl.useProgram( physicsProgram );
//         gl.uniform1i( physicsProgram.uParticleDataLoc, 0 );
//         gl.uniform2f( physicsProgram.uViewportLoc, PARTICLE_TEXTURE_WIDTH, PARTICLE_TEXTURE_HEIGHT );

//         // Set render program uniform values
//         gl.useProgram( renderProgram );
//         gl.uniform1i( renderProgram.uParticleDataLoc, particleDataTexture.unit );
//         gl.uniform1i( renderProgram.uParticleTextureLoc, particleTexture.unit );

//         // Set debug program uniform values
//         gl.useProgram( debugProgram );
//         gl.uniform1i( debugProgram.uParticleDataLoc, 0 );

//         // Kick it off!
//         gl.start();
//     });
// };

// gl.draw = function() {
//     // 1. Physics step

//     // Set the viewport to the size of the particle data texture since we're rendering to that
//     gl.viewport( 0, 0, PARTICLE_TEXTURE_WIDTH, PARTICLE_TEXTURE_HEIGHT );

//     // Prepare the physics program to execute per fragment of the particle data texture
//     gl.useProgram( physicsProgram );
//     gl.bindBuffer( gl.ARRAY_BUFFER, viewportQuadBuffer );
//     gl.vertexAttribPointer( physicsProgram.aVertexPositionLoc, 2, gl.FLOAT, gl.FALSE, 0, 0 );

//     // Tell WebGL to use the particle FBO, not the front buffer for (offscreen) rendering
//     gl.bindFramebuffer( gl.FRAMEBUFFER, particleFramebuffer );
//     gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

//     // Unbind the FBO, WebGL will now use the default buffer for rendering
//     gl.bindFramebuffer( gl.FRAMEBUFFER, null );

//     // 2. Render step

//     // Clear the front buffer (if we had called clear when the particle FBO was bound, it
//     // would have nixed the particle position and velocity data)
//     gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

//     // Set the viewport size to the full canvas
//     gl.viewport( 0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight );

//     // For each particle, pull out the position and render it as a point to the screen
//     gl.useProgram( renderProgram );
//     gl.bindBuffer( gl.ARRAY_BUFFER, particleUVDataBuffer );
//     gl.vertexAttribPointer( renderProgram.aParticleUVLoc, 2, gl.FLOAT, gl.FALSE, 0, 0 );

//     // Draw with additive blending
//     gl.enable( gl.BLEND );
//     gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
//     gl.drawArrays( gl.POINTS, 0, PARTICLE_COUNT );

//      // 3. Debug step

//     if ( debugToggle.checked ) {

//         gl.viewport( 20, 20, 600, 300 );
//         gl.useProgram( debugProgram );
//         gl.bindBuffer( gl.ARRAY_BUFFER, viewportQuadBuffer );
//         gl.vertexAttribPointer( debugProgram.aVertexPositionLoc, 2, gl.FLOAT, gl.FALSE, 0, 0 );

//         // Draw with interpolative blending
//         gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
//         gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
//     }

//     gl.disable( gl.BLEND );
// };


// // Sets `count` particles to be alive, positions them at the emission `origin` and gives them
// // an initial random velocity
// function emitParticles( count, origin, velocities ) {
//     velocities = velocities || { x:0.0, y:0.0, z:0.0 };

//     // Bind the particle data texture since we'll be updating it
//     gl.activeTexture( gl.TEXTURE0 + particleDataTexture.unit );
//     gl.bindTexture( gl.TEXTURE_2D, particleDataTexture );

//     // Determine the x and y coordinates in the particle data texture to start writing to
//     var x = ~~( ( gl.particleIndex * PARTICLE_DATA_SLOTS ) % PARTICLE_TEXTURE_WIDTH );
//     var y = ~~( gl.particleIndex / PARTICLE_TEXTURE_HEIGHT );

//     // An array defining the chunks of texture to be updated
//     var chunks = [{
//         x: x,
//         y: y,
//         size: count * PARTICLE_DATA_SLOTS
//     }];

//     // Recursively splits chunks until they will all fit into the particle data texture
//     function split( chunk ) {

//         var boundary = chunk.x + chunk.size;

//         // If the chunk will exceed the texture size, it must be split
//         if ( boundary > PARTICLE_TEXTURE_WIDTH ) {

//             // How many slots fall outside the texture dimensions
//             var delta = boundary - PARTICLE_TEXTURE_WIDTH;

//             // Reduce the current chunk size to fit
//             chunk.size -= delta;

//             // Create a new chunk from the orphaned data
//             chunk = {
//                 x: 0,
//                 y: ( chunk.y + 1 ) % PARTICLE_TEXTURE_HEIGHT,
//                 size: delta
//             };

//             // Store the new chunk
//             chunks.push( chunk );

//             // Continue splitting chunks
//             split( chunk );
//         }
//     }

//     // Start splitting chunks until we can fit them all into the texture
//     split( chunks[0] );

//     // Now that we have a set of chunks that fit, start updating the texture data
//     var i, j, n, m, chunk, data, force = 1.0;

//     for ( i = 0, n = chunks.length; i < n; i++ ) {

//         chunk = chunks[i];
//         data = [];

//         for ( j = 0, m = chunk.size; j < m; j++ ) {

//             data.push(

//                 // Move the particle to the emission origin
//                 origin.x,
//                 origin.y,
//                 origin.z,

//                 // Set the phase above 0, switching it on for use
//                 random( 10 ),

//                 // Populate the velocity slot with an initial random force
//                 velocities.x + force * random( -1.0, 1.0 ),
//                 velocities.y + force * random( -1.0, 1.0 ),
//                 velocities.z + force * random( -1.0, 1.0 ),

//                 // Empty data slot
//                 0
//             );
//         }

//         // Now we modify the pixels of the particle data texture inside the chunk boundaries
//         gl.texSubImage2D(
//             // target, detail level, x, y, width, height
//             gl.TEXTURE_2D, 0, chunk.x, chunk.y, chunk.size, 1,
//             // data format, data type, pixels
//             gl.RGBA, gl.FLOAT, new Float32Array( data )
//         );
//     }

//     // Update the particle index
//     gl.particleIndex += count;
//     gl.particleIndex %= PARTICLE_COUNT;
// }



// /*
// ------------------------------------------------------------

// Helper methods

// ------------------------------------------------------------
// */

// // Creates and compiles a shader from source
// function createShader( source, type ) {

//     var shader = gl.createShader( type );

//     gl.shaderSource( shader, source );
//     gl.compileShader( shader );

//     if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
//         throw gl.getShaderInfoLog( shader );

//     return shader;
// }

// // Creates a shader program and creates / links shaders
// function createProgram( vertexSource, fragmentSource ) {

//     var vs = createShader( vertexSource, gl.VERTEX_SHADER );
//     var fs = createShader( fragmentSource, gl.FRAGMENT_SHADER );

//     var program = gl.createProgram();

//     gl.attachShader( program, vs );
//     gl.attachShader( program, fs );
//     gl.linkProgram( program );

//     if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
//         throw gl.getProgramInfoLog( program );

//     return program;
// }

// // Populates shader object with loaded GLSL code
// function loadShaders( callback ) {

//     var queue = 0;

//     function loadHandler( name, req ) {

//         return function() {
//             shaders[ name ] = req.responseText;
//             if ( --queue <= 0 ) callback();
//         };
//     }

//     for ( var name in shaders ) {

//         queue++;

//         var req = new XMLHttpRequest();
//         req.onload = loadHandler( name, req );
//         req.open( 'get', 'ink_glsl/' + name + '.glsl', true );
//         req.send();
//     }
// }