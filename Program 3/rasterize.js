/**
 * @author mmcmill
 * 
 * /

/* GLOBAL CONSTANTS AND VARIABLES */

const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://raw.githubusercontent.com/mmcmill/CSC461/master/triangles.json" // triangles file loc

var view = new mat4.create(); //view matrix
var projection = new mat4.create();// projection matrix

var eye = new vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var up = new vec3.fromValues(0,1,0); //default up vector
var at = new vec3.fromValues(0.5,0.5,1); //default center vector
var lightPos = new vec3.fromValues(-0.5, 1.5, -0.5); 
var lightColor = new vec4.fromValues(1.0, 1.0, 1.0, 1.0);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var triBufferSize; // the number of indices in the triangle buffer
var colorBuffer;
var normalBuffer;
var coordArray;

var modelMatBuffer; // contains single model mat4 for each triangle
var modelSetIndices; // a 2D array of sets indices into modelPerTri. ex: [[0, 1], [2, 3, 4]]
var modelMatArray; // a 1D array holding model mat4 that are each associated with a triangle
var activeMSetIndex = -1;

var vertexPositionAttrib; // where to put position for vertex shader
var vertexNormalAttrib;
var ambientColorAttrib;
var diffuseColorAttrib;
var specularColorAttrib;
var specularNAttrib;

var modelMatRow0;
var modelMatRow1;
var modelMatRow2; 
var modelMatRow3;

var VUniform;
var PUniform;
var eyeUniform;
var lightPosUniform;
var lightColorUniform;

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    canvas.tabIndex = 1; // set the tabIndex to 1 so that canvas is focusable
    canvas.addEventListener('keydown', readKeyInput, false); // add keydown event listener to canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
    
    setupMVP();
 
} // end setupWebGL

function setupMVP(){
	mat4.lookAt(view, eye, at, up);
	togglePerspective(true);
}

// read triangles in, load them into webgl buffers
function loadTriangles() {
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        coordArray = []; // 1D array of vertex coords for WebGL
        var indexArray = [];
        var colorArray = [];
        var normalArray = [];
        modelMatArray = [];
        modelSetIndices = [];
        var vertCount = 0;
        var triCount = 0;
        
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
			var setArray = [];
            // set up the vertex coord array
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++){
                coordArray = coordArray.concat(inputTriangles[whichSet].vertices[whichSetVert]);
                
                // load in ambient color
                colorArray = colorArray.concat(inputTriangles[whichSet].material.ambient);
                colorArray = colorArray.concat(1.0);
                
                //load in diffuse color
                colorArray = colorArray.concat(inputTriangles[whichSet].material.diffuse);
				colorArray = colorArray.concat(1.0); // concat alpha
				
				//load in specular color
				colorArray = colorArray.concat(inputTriangles[whichSet].material.specular);
				colorArray = colorArray.concat(1.0);
				
				// load in specular reflection coefficient
				colorArray = colorArray.concat(inputTriangles[whichSet].material.n)
				
				normalArray = normalArray.concat(inputTriangles[whichSet].normals[whichSetVert]);
            
				modelMatArray = modelMatArray.concat(new mat4.create());
				setArray = setArray.concat(whichSetVert + triCount);
            }
            
            
            for (let i = 0; i < inputTriangles[whichSet].triangles.length; i++) {
				let triangle = inputTriangles[whichSet].triangles[i];
				triangle[0] += vertCount;
				triangle[1] += vertCount;
				triangle[2] += vertCount;
				indexArray = indexArray.concat(triangle);
		   }
		   
		   modelSetIndices = modelSetIndices.concat([setArray]);
		   triCount += modelSetIndices[whichSet].length;
		   vertCount += inputTriangles[whichSet].vertices.length;
        } // end for each triangle set 
        triBufferSize = indexArray.length;
        
        loadModelMatArrayToGL();

        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        
        //send the normals of the vertices to webGL
        normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Uint16Array(normalArray), gl.STATIC_DRAW);
        
        //send colors to webGl
        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
        
        // send index array to WebGL
        triangleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
    } // end if triangles found
} // end load triangles

function loadModelMatArrayToGL(){
	var modelMat1DArray = [];
	for (var i = 0; i < modelMatArray.length; i++){
		var modelMat = modelMatArray[i];
		modelMat1DArray = modelMat1DArray.concat(...modelMat);
	}
	
	modelMatBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, modelMatBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelMat1DArray), gl.STATIC_DRAW);
}

// setup the webGL shaders
function setupShaders() {
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        
        varying vec3 L, N, E;
        varying vec4 ambientColor, diffuseColor, specularColor;
        varying float specularN;
        
        void main(void) {
			vec3 norm = N;
			if(gl_FrontFacing){
				norm = -norm;
			}
			
			vec4 diffuse = clamp(dot(L, norm), 0.0, 1.0) * diffuseColor;
			
			vec3 H = normalize(L+E);
			vec4 specular = pow(clamp(dot(norm, H), 0.0, 1.0), specularN) * specularColor;
			
			if (dot(L, norm) < 0.0)
				specular = vec4(0.0, 0.0, 0.0, 1.0);
			
			vec4 fColor = ambientColor + diffuse + specular;
            gl_FragColor = fColor; 
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
		precision mediump float;
    
        attribute vec3 vertexPos;
        attribute vec3 vertexNormal;
        
        attribute vec4 vertexAmbientColor;
        attribute vec4 vertexDiffuseColor;
        attribute vec4 vertexSpecularColor;
        attribute float specularReflectionN;
        
        attribute mat4 M;

		uniform mat4 V, P;
        uniform vec3 lightPos;
        uniform vec4 lightColor;
        
        varying vec3 L, N, E;
        varying vec4 ambientColor, diffuseColor, specularColor;
        varying float specularN;

        void main(void) {
			ambientColor = vertexAmbientColor*lightColor;
			diffuseColor = vertexDiffuseColor*lightColor;
			specularColor = vertexSpecularColor*lightColor;
			specularN = specularReflectionN;
			
			mat4 MV = V * M;
			vec3 pos = (MV* vec4(vertexPos, 1.0)).xyz;
			vec3 light = (MV*vec4(lightPos, 1.0)).xyz;
			
			vec3 eye = vec3(V[0][3], V[1][3], V[2][3]);
			
			L = normalize(light - pos);
			N = normalize((MV*vec4(vertexNormal,1.0)).xyz );
			E = normalize(eye-pos);
			
			mat4 MVP = P * MV;
			gl_Position = MVP * vec4(vertexPos, 1.0);
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPos"); 
                vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "vertexNormal");
                ambientColorAttrib = gl.getAttribLocation(shaderProgram, "vertexAmbientColor");
                diffuseColorAttrib = gl.getAttribLocation(shaderProgram, "vertexDiffuseColor");
                specularColorAttrib = gl.getAttribLocation(shaderProgram, "vertexSpecularColor");
                specularNAttrib = gl.getAttribLocation(shaderProgram, "specularReflectionN");
                
                modelMatRow0 = gl.getAttribLocation(shaderProgram, "M");
                modelMatRow1 = modelMatRow0 + 1;
                modelMatRow2 = modelMatRow0 + 2;
                modelMatRow3 = modelMatRow0 + 3;
                
                VUniform = gl.getUniformLocation(shaderProgram, "V");
                PUniform = gl.getUniformLocation(shaderProgram, "P");
                lightPosUniform = gl.getUniformLocation(shaderProgram, "lightPos");
                lightColorUniform = gl.getUniformLocation(shaderProgram, "lightColor");
                
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                gl.enableVertexAttribArray(vertexNormalAttrib);
                gl.enableVertexAttribArray(ambientColorAttrib);
                gl.enableVertexAttribArray(diffuseColorAttrib);
                gl.enableVertexAttribArray(specularColorAttrib);
                gl.enableVertexAttribArray(specularNAttrib);
                
                gl.enableVertexAttribArray(modelMatRow0);
                gl.enableVertexAttribArray(modelMatRow1);
                gl.enableVertexAttribArray(modelMatRow2);
                gl.enableVertexAttribArray(modelMatRow3);
                
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders
var bgColor = 0;
// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    requestAnimationFrame(renderTriangles);
    
    //set uniforms
    gl.uniformMatrix4fv(VUniform, false, view);
    gl.uniformMatrix4fv(PUniform, false, projection);
    gl.uniform3fv(lightPosUniform, lightPos);
    gl.uniform4fv(lightColorUniform, lightColor);
    
    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(vertexNormalAttrib,3, gl.UNSIGNED_SHORT, false, 0,0);

	// color buffer: activate and feed into vertex shader
	//each attrib holds 4 floats. float = 4 bytes.
	// 4 bytes per float * 4 floats = 16 bytes
	// 16 bytes per vec4 color * 3 vec4 colors = 48 bytes
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer); 
    gl.vertexAttribPointer(ambientColorAttrib, 4, gl.FLOAT, false, 52,0); 
    gl.vertexAttribPointer(diffuseColorAttrib, 4, gl.FLOAT, false, 52,16); 
    gl.vertexAttribPointer(specularColorAttrib, 4, gl.FLOAT, false, 52,32); 
    gl.vertexAttribPointer(specularNAttrib, 1, gl.FLOAT, false, 52, 48);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, modelMatBuffer);
    gl.vertexAttribPointer(modelMatRow0, 4, gl.FLOAT, false, 64, 0);
    gl.vertexAttribPointer(modelMatRow1, 4, gl.FLOAT, false, 64, 16);
    gl.vertexAttribPointer(modelMatRow2, 4, gl.FLOAT, false, 64, 32);
    gl.vertexAttribPointer(modelMatRow3, 4, gl.FLOAT, false, 64, 48);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, triBufferSize, gl.UNSIGNED_SHORT,0); // render
    
} // end render triangles

function readKeyInput(keyEvent)
{
	switch(keyEvent.key){
		case 'a':
			mat4.translate(view, view, new vec3.fromValues(-.1,0,0));
			break;
		case 'd':
			mat4.translate(view, view, new vec3.fromValues(.1,0,0));
			break;
		case 'w':
			mat4.translate(view, view, new vec3.fromValues(0,0,-.1));
			break;
		case 's':
			mat4.translate(view, view, new vec3.fromValues(0,0,.1));
			break;
		case 'q':
			mat4.translate(view, view, new vec3.fromValues(0,-.1,0));
			break;
		case 'e':
			mat4.translate(view, view, new vec3.fromValues(0,.1,0));
			break;
		case 'W':
			mat4.rotate(view, view, Math.PI/180, new vec3.fromValues(-1, 0, 0));
			break;
		case 'S':
			mat4.rotate(view, view, Math.PI/180, new vec3.fromValues(1, 0, 0));
			break;
		case 'A':
			mat4.rotate(view, view, Math.PI/180, new vec3.fromValues(0, 1, 0));
			break;
		case 'D':
			mat4.rotate(view, view, Math.PI/180, new vec3.fromValues(0, -1, 0));
			break;
		case 'ArrowLeft':
			selectPrevSet();
			break;
		case 'ArrowRight':
			selectNextSet();
			break;
		case ' ':
			deselectSet();
			break;
		case '<':
			togglePerspective(true);
			break;
		case '=':
			togglePerspective(false);
			break;
		case 'k':
			translateSet(new vec3.fromValues(0.1, 0, 0));
			break;
		case ';':
			translateSet(new vec3.fromValues(-0.1, 0, 0));
			break;
		case 'o':
			translateSet(new vec3.fromValues(0, 0, 0.1));
			break;
		case 'l':
			translateSet(new vec3.fromValues(0, 0, -0.1));
			break;
		case 'i':
			translateSet(new vec3.fromValues(0, 0.1, 0));
			break;
		case 'p':
			translateSet(new vec3.fromValues(0, -0.1, 0));
			break;
		case 'K':
			rotateSet(new vec3.fromValues(0, 0.1, 0));
			break;
		case ':':
			rotateSet(new vec3.fromValues(0, -0.1, 0));
			break;
		case 'O':
			rotateSet(new vec3.fromValues(0.1, 0, 0));
			break;
		case 'L':
			rotateSet(new vec3.fromValues(-0.1, 0, 0));
			break;
		case 'I':
			rotateSet(new vec3.fromValues(0, 0, -0.1));
			break;
		case 'P':
			rotateSet(new vec3.fromValues(0, 0, 0.1));
			break;
	}
}

function rotateSet(axisVec){
	if (activeMSetIndex < 0){
		return;
	}
	
	var setIndices = modelSetIndices[activeMSetIndex];
	
	for (let i = 0; i < setIndices.length; i++){
		let modelMat = modelMatArray[setIndices[i]];
		
		modelMat = mat4.rotate(modelMat, modelMat, Math.PI/180 ,axisVec); 
		modelMatArray[setIndices[i]] = modelMat;
	}
	
	loadModelMatArrayToGL();
}

function translateSet(translationVec){
	if (activeMSetIndex < 0){
		return;
	}
	
	var setIndices = modelSetIndices[activeMSetIndex];
	
	for (let i = 0; i < setIndices.length; i++){
		let modelMat = modelMatArray[setIndices[i]];
		
		modelMat = mat4.translate(modelMat, modelMat, translationVec); 
		modelMatArray[setIndices[i]] = modelMat;
	}
	
	loadModelMatArrayToGL();
}

function scaleSet(scalar){
	if (activeMSetIndex < 0){
		return;
	}
	
	var setIndices = modelSetIndices[activeMSetIndex];
	
	let origin = new vec3.create();
	for (let i = 0; i < setIndices.length; i++){
		let vIndex = setIndices[i]*3;
		let vPos = new vec3.fromValues(coordArray[vIndex], coordArray[vIndex+1], coordArray[vIndex+2]);
		vec3.add(origin, origin, vPos);
	}
	
	vec3.scale(origin, origin, 1/setIndices.length);
	
	let scalarVec = new vec3.fromValues(scalar, scalar, scalar);
	for (let i = 0; i < setIndices.length; i++){
		let modelMat = modelMatArray[setIndices[i]];
		
		modelMat = mat4.translate(modelMat, modelMat, origin); 
		modelMat = mat4.scale(modelMat, modelMat, scalarVec);
		modelMat = mat4.translate(modelMat, modelMat, vec3.scale(new vec3.create(),origin, -1));
		modelMatArray[setIndices[i]] = modelMat;
	}
}


function selectPrevSet(){
	scaleSet(1/1.2);
	if (activeMSetIndex <= 0){
		activeMSetIndex = modelSetIndices.length -1; 
	} else {
		activeMSetIndex -= 1;
	}

	scaleSet(1.2);
	loadModelMatArrayToGL();
}

function selectNextSet(){
	scaleSet(1/1.2);
	if(activeMSetIndex >= modelSetIndices.length -1) {
		activeMSetIndex = 0;
	} else {
		 activeMSetIndex += 1;
	}
	scaleSet(1.2);
	loadModelMatArrayToGL();
}

function deselectSet(){
	scaleSet(1/1.2);
	activeMSetIndex = -1;
	loadModelMatArrayToGL();
}

function togglePerspective(perspectiveOn){
	if(perspectiveOn){
		mat4.perspective(projection, 3.1415/2, 512/512, 0.5, 10.0);
	} else {
		mat4.ortho(projection, -.5, .5, -.5, .5, 0.5, 10.0);
	}
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
	setupWebGL(); // set up the webGL environment
	loadTriangles(); // load in the triangles from tri file
	setupShaders(); // setup the webGL shaders
	renderTriangles(); // draw the triangles using webGL
  
} // end main
