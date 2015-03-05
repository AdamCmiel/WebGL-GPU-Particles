var gl; 
var advecProgram;
var forceProgram;
var densityProgram;
var divProgram;
var renderProgram
var frameBuffer1;
var frameBuffer2;
var texture1;
var texture2;
var it = 3;
var n = 512;
var ext;
var shaders = {
  advec_frag: '',
  density_frag: '',
  div_frag: '',
  force_frag: '',
  render_frag: '',
  vertex: ''
};

function init () {
  loadShaders(function() {
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");
    ext = gl.getExtension("OES_texture_float");
    if (!gl || !ext) { alert("Error"); return; }

    //create programs
    forceProgram = createProgram({
      fragmentSource : shaders.force_frag, 
      vertexSource : shaders.vertex
    });
    
    densityProgram  = createProgram( {
      fragmentSource : shaders.density_frag, 
      vertexSource : shaders.vertex
    });
    
    divProgram  = createProgram( {
      fragmentSource : shaders.div_frag, 
      vertexSource : shaders.vertex
    });
    
    renderProgram  = createProgram( {
      fragmentSource : shaders.render_frag, 
      vertexSource : shaders.vertex
    });
    
    advecProgram  = createProgram( {
      fragmentSource : shaders.advec_frag, 
      vertexSource : shaders.vertex
    });

    //get uniforms
    forceProgram.forceLoc      = gl.getUniformLocation(forceProgram, "force");
    advecProgram.aPosLoc       = gl.getAttribLocation(advecProgram, "aPos");
    advecProgram.aTextCoordLoc = gl.getAttribLocation(advecProgram, "aTexCoord");
    divProgram.sampLoc     = gl.getUniformLocation(divProgram, "samp");
    advecProgram.sampLoc   = gl.getUniformLocation(advecProgram, "samp");
    densityProgram.sampLoc = gl.getUniformLocation(densityProgram, "samp");

    //enable vert arrays
    gl.enableVertexAttribArray( advecProgram.aPosLoc );
    gl.enableVertexAttribArray( advecProgram.aTextCoordLoc );

    //set the starting force
    gl.useProgram(forceProgram);
    gl.uniform1f(forceProgram.forceLoc, .001*.5*-10 );

    gl.useProgram(divProgram);
    gl.uniform1i(divProgram.sampLoc, 1);


    gl.useProgram(advecProgram);

    //points on the texture
    var aPosData = new Float32Array([-1,-1,  1,-1,  -1,1, 1,1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, aPosData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(advecProgram.aPosLoc, 2, gl.FLOAT, gl.FALSE, 8, 0);

    var aTextureCoordData = new Float32Array([0,0, 1,0, 0,1, 1,1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, aTextureCoordData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(advecProgram.aTextCoordLoc, 2, gl.FLOAT, gl.FALSE, 8, 0);
    gl.uniform1i(advecProgram.sampLoc, 1);

    var pixels = [], h = 2/n, density;
    for(var i = 0; i<n; i++)
    for(var j = 0; j<n; j++){
     var x = h*(j-n/2),  y = h*(i-n/2);
     if (x*x + y*y > .02) density = 0; else density= 2;
     // pixels.push( 0, 0, density, 0 );
     pixels.push( 0, 0, 0, 0 );
    }

    texture1 = createTexture({
      textureSlot : gl.TEXTURE0,
      data : pixels,
      width : n,
      height : n
    });

    texture2 = createTexture({
      textureSlot : gl.TEXTURE1,
      data : pixels,
      width : n,
      height : n
    });

    frameBuffer1 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

    if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
    alert(err + "FLOAT as the color attachment to an frameBuffer1");

    frameBuffer2 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);

    draw();
    bindEvents();
  });
}



function draw(){
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
  gl.useProgram(forceProgram);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
  gl.useProgram(advecProgram);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // gl.useProgram(densityProgram);
  // for(var i = 0; i < it; i++){
  //   gl.uniform1i(densityProgram.sampLoc, 0);
  //   gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
  //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  //   gl.uniform1i(densityProgram.sampLoc, 1);
  //   gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
  //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  // }

  // gl.uniform1i(densityProgram.sampLoc, 0);
  // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer2);
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
  // gl.useProgram(divProgram);
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  gl.useProgram(renderProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(draw);
}

function createTexture(options) {
  var texture = gl.createTexture();
  gl.activeTexture(options.textureSlot);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, options.width, options.height, 0, gl.RGBA, gl.FLOAT, new Float32Array(options.data));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
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

function createProgram(options) {
    var vs = createShader( options.vertexSource, gl.VERTEX_SHADER );
    var fs = createShader( options.fragmentSource, gl.FRAGMENT_SHADER );
    var program = gl.createProgram();
    gl.attachShader( program, vs );
    gl.attachShader( program, fs );
    gl.linkProgram( program );
    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
        throw gl.getProgramInfoLog( program );
    return program;
}

function bindEvents() {
  window.addEventListener('mousemove', function(ev) {
    var x = ev.clientX, y = ev.clientY;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    var data = [];
    for(var i=0; i<16; i++) {
      data.push(0, 0, 2, 0);  
    }
    
    if(512 - y < 0 || x < 0) return;
    gl.texSubImage2D(
              // target, detail level, x, y, width, height
              gl.TEXTURE_2D, 0, x , 512 - y, 4, 4,
              // data format, data type, pixels
              gl.RGBA, gl.FLOAT, new Float32Array( data )
          );
  });
}

document.body.onload = init;
