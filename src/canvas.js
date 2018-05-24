import { GetWebGLContext, CreateSquareVbo, AttachShader,
         LinkProgram, CreateRGBATextures, CreateRGBAImageTexture2D  } from './glUtils.js';

const RENDER_VERTEX = require('./shader/render.vert');
const RENDER_FRAGMENT = require('./shader/render.frag');

export default class Canvas {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.pixelRatio = 1.0;//window.devicePixelRatio;


        this.boundMouseDownListener = this.mouseDownListener.bind(this);
        this.boundMouseUpListener = this.mouseUpListener.bind(this);
        this.boundMouseWheelListener = this.mouseWheelListener.bind(this);
        this.boundMouseMoveListener = this.mouseMoveListener.bind(this);
        this.boundMouseOutListener = this.mouseOutListener.bind(this);
        this.boundDblClickLisntener = this.mouseDblClickListener.bind(this);
        this.boundKeydown = this.keydownListener.bind(this);
        this.boundKeyup = this.keyupListener.bind(this);

        this.mouse = [0, 0];
        this.numPhotos = 1;
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
    }


    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.resizeCanvas();
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
        this.gl = GetWebGLContext(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.addEventListeners();

        this.renderCanvasProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                       'a_vertex');
        this.getRenderUniformLocations(this.renderCanvasProgram);

        this.photos = CreateRGBATextures(this.gl,
                                         this.canvas.width, this.canvas.height, 4);
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_mouse'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_numPhotos'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex1'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex2'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex3'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex4'));
    }

    setPhotoObj(imgObj, index) {
        this.photos[index] = CreateRGBAImageTexture2D(this.gl,
                                                      imgObj.width, imgObj.height, imgObj);
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++], this.mouse[0], this.canvas.height - this.mouse[1]);
        this.gl.uniform1i(this.uniLocations[i++], this.numPhotos);

        for (let n = 0; n < this.numPhotos; n++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + n);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.photos[n]);
            this.gl.uniform1i(this.uniLocations[i++], n);
        }
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.setRenderUniformValues(this.canvas.width, this.canvas.height);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(this.renderVAttrib);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown',
                                     this.boundMouseDownListener);
        this.canvas.addEventListener('mouseup',
                                     this.boundMouseUpListener);
        this.canvas.addEventListener('wheel',
                                     this.boundMouseWheelListener);
        this.canvas.addEventListener('mousemove',
                                     this.boundMouseMoveListener);
        this.canvas.addEventListener('mouseout',
                                     this.boundMouseOutListener);
        this.canvas.addEventListener('dblclick',
                                     this.boundDblClickLisntener);
        this.canvas.addEventListener('keydown',
                                     this.boundKeydown);
        this.canvas.addEventListener('keyup',
                                     this.boundKeyup);
        this.canvas.addEventListener('contextmenu',
                                     event => event.preventDefault());
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;
    }

    mouseWheelListener(event) {}

    mouseDownListener(event) {}

    mouseDblClickListener(event) {}

    mouseUpListener(event) {}

    mouseMoveListener(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouse = [event.clientX - rect.left, event.clientY - rect.top];
    }

    mouseOutListener(event) {}

    keydownListener(event) {}

    keyupListener(event) {}
}
