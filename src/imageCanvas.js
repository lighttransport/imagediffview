import { GetWebGLContext, CreateSquareVbo, AttachShader,
         LinkProgram, CreateRGBATextures, CreateRGBAImageTexture2D  } from './glUtils.js';
import Canvas from './canvas.js';

const RENDER_VERTEX = require('./shader/render.vert');
const RENDER_FRAGMENT = require('./shader/render.frag');

export default class ImageCanvas extends Canvas {
    constructor(canvasId, overlayId) {
        super(canvasId);
        this.canvasId = canvasId;
        this.overlayId = overlayId;
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
        this.numPhotos = 0;
        this.photoNames = new Array(4);

        this.enableBlend = false;
        this.blendFactor = 0.5;

        this.photoObjs = undefined;
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;

        const rect = this.canvas.getBoundingClientRect();

        this.overlay.width = parent.clientWidth * this.pixelRatio;
        this.overlay.height = parent.clientHeight * this.pixelRatio;
    }

    resizeCanvasFromPhoto(width, height) {
        const ratio = height / width;
        const defaultSize = 600;
        this.canvas.parentElement.style.width = (defaultSize) +'px';
        this.canvas.parentElement.style.height = (defaultSize* ratio) + 'px';
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.pixelRatio;
        this.canvas.height = parent.clientHeight * this.pixelRatio;
        this.canvasRatio = this.canvas.width / this.canvas.height / 2;

        const rect = this.canvas.getBoundingClientRect();

        this.overlay.width = this.canvas.width;
        this.overlay.height = this.canvas.height;
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.overlay = document.getElementById(this.overlayId);
        this.resizeCanvas();
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
        this.ctx = this.canvas.getContext('2d');
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_mouse'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_enableBlend'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_blendFactor'));
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

    setPhotoObj(name, imgObj, index, photoObj) {
        this.photoNames[index] = name;
        this.photos[index] = CreateRGBAImageTexture2D(this.gl,
                                                      imgObj.width, imgObj.height, imgObj);
        this.resizeCanvasFromPhoto(imgObj.width, imgObj.height);

        this.currentPhotoObj = photoObj;
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++], this.mouse[0], this.canvas.height - this.mouse[1]);
        this.gl.uniform1i(this.uniLocations[i++], this.enableBlend);
        this.gl.uniform1f(this.uniLocations[i++], this.blendFactor);
        this.gl.uniform1i(this.uniLocations[i++], this.numPhotos);

        for (let n = 0; n < this.numPhotos; n++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + n);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.photos[n]);
            this.gl.uniform1i(this.uniLocations[i++], n);
        }
    }

    render() {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        if(this.numPhotos === 0) {
            this.renderOverlay();
            return;
        }
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.useProgram(this.renderCanvasProgram);
        this.setRenderUniformValues(this.canvas.width, this.canvas.height);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(this.renderVAttrib);
        this.gl.vertexAttribPointer(this.renderVAttrib, 2,
                                    this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.flush();

        this.renderOverlay();

    }

    renderOverlay() {
        const ctx = this.overlay.getContext('2d');
        ctx.fillStyle = "rgba(1, 1, 1,0)";
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.font = "14px 'Times New Roman'";
        if (this.numPhotos >= 1) {
            const w = ctx.measureText(this.photoNames[0]).width;
            ctx.fillStyle = "rgba(64, 64, 64, 0.7)";
            ctx.fillRect(5, 0, w + 10, 25);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(this.photoNames[0], 10, 20);
        }
        if (this.numPhotos >= 2) {
            const w = ctx.measureText(this.photoNames[1]).width;
            ctx.fillStyle = "rgba(64, 64, 64, 0.7)";
            ctx.fillRect(this.canvas.width - w - 15, 0, w + 10, 25);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(this.photoNames[1], this.canvas.width - w - 10, 20);
        }
        if (this.numPhotos >= 3) {
            const w = ctx.measureText(this.photoNames[2]).width;
            ctx.fillStyle = "rgba(64, 64, 64, 0.7)";
            ctx.fillRect(5, this.canvas.height - 25, w + 10, 25);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(this.photoNames[2], 10, this.canvas.height - 10);
        }
        if (this.numPhotos >= 4) {
            const w = ctx.measureText(this.photoNames[3]).width;
            ctx.fillStyle = "rgba(64, 64, 64, 0.7)";
            ctx.fillRect(this.canvas.width - w - 15, this.canvas.height - 25,
                         w + 10, 25);
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillText(this.photoNames[3], this.canvas.width - w - 10,
                         this.canvas.height - 10);
        }
    }

    addEventListeners() {
        this.overlay.addEventListener('mousedown',
                                     this.boundMouseDownListener);
        this.overlay.addEventListener('mouseup',
                                     this.boundMouseUpListener);
        this.overlay.addEventListener('wheel',
                                     this.boundMouseWheelListener);
        this.overlay.addEventListener('mousemove',
                                     this.boundMouseMoveListener);
        this.overlay.addEventListener('mouseout',
                                     this.boundMouseOutListener);
        this.overlay.addEventListener('dblclick',
                                     this.boundDblClickLisntener);
        this.overlay.addEventListener('keydown',
                                     this.boundKeydown);
        this.overlay.addEventListener('keyup',
                                     this.boundKeyup);
        this.overlay.addEventListener('contextmenu',
                                     event => event.preventDefault());
    }

    mouseWheelListener(event) {}

    mouseDownListener(event) {}

    mouseDblClickListener(event) {}

    mouseUpListener(event) {}

    mouseMoveListener(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouse = [event.clientX - rect.left, event.clientY - rect.top];

        if (this.numPhotos >= 2) {
            this.isRendering = true;
        }

        if (this.numPhotos === 1) {
            // var pixels = new Uint8Array(this.gl.canvas.width * this.gl.canvas.height * 4);
            // this.gl.readPixels(0, 0, this.canvas.width, this.canvas.height,
            //                    this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
            // console.log(pixels);
        }
    }

    mouseOutListener(event) {
        this.isRendering = false;
    }

    keydownListener(event) {}

    keyupListener(event) {}
}
