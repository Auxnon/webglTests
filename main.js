let gl;
let program;
let time=0;
let lastTime=Date.now();

function init() {
    console.log('hi');
    let canvas = document.querySelector("canvas");
    let fs = getSource("./fragment.frag"); //document.querySelector("#shader-vs");
    let vs = getSource("./vertex.vert");
    gl = canvas.getContext("webgl2");
    gl.viewport(0, 0, canvas.width = window.innerWidth, canvas.height = window.innerHeight);
    let vShader = compileShader(gl, vs, gl.VERTEX_SHADER);
    let fShader = compileShader(gl, fs, gl.FRAGMENT_SHADER);
    program = createProgram(gl, vShader, fShader);

    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    // Create a buffer and put three 2d clip space points in it
    let positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let positions = [
        -1, -1,
        -1, 1,
        1,1,
        1, -1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    program.timeUniform = gl.getUniformLocation(program, "iTime");
    gl.uniform1f(program.timeUniform, 1.); 
    program.resolutionUniform = gl.getUniformLocation(program, "resolution");
    gl.uniform2f(program.resolutionUniform,window.innerWidth,window.innerHeight);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 2; // 2 components per iteration
    let type = gl.FLOAT; // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    animate();
    //let program = gl.createProgramFromSources(gl, [vs, fs]);
}
init();


function animate() {
    let t=Date.now();
    let delta=t-lastTime;
    lastTime=t;
    time+=delta/1000.; //DEV add delta
    console.log(time) 
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.uniform1f(program.timeUniform, Math.floor(time*100)/100.); 
    requestAnimationFrame(animate);
}

function compileShader(gl, shaderSource, shaderType) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program filed to link:" + gl.getProgramInfoLog(program));
    }

    program.createUniform = function (type, name) {
        var location = gl.getUniformLocation(program, name);
        return function (v1, v2, v3, v4) {
            gl['uniform' + type](location, v1, v2, v3, v4);
        }
    };

    return program;
};

function getSource(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};