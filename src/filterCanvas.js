import { GetWebGLContext, CreateSquareVbo, AttachShader,
         LinkProgram, CreateRGBATextures, CreateRGBAImageTexture2D  } from './glUtils.js';
import Canvas from './canvas.js';

const RENDER_VERTEX = require('./shader/render.vert');
const RENDER_FRAGMENT = require('./shader/filter.frag');

export default class FilterCanvas extends Canvas {
    constructor(canvasId) {
        super(canvasId);

        this.resizeCanvas();
        this.gl = GetWebGLContext(this.canvas);
        this.vertexBuffer = CreateSquareVbo(this.gl);

        this.renderCanvasProgram = this.gl.createProgram();
        AttachShader(this.gl, RENDER_VERTEX,
                     this.renderCanvasProgram, this.gl.VERTEX_SHADER);
        AttachShader(this.gl, RENDER_FRAGMENT,
                     this.renderCanvasProgram, this.gl.FRAGMENT_SHADER);
        LinkProgram(this.gl, this.renderCanvasProgram);
        this.renderVAttrib = this.gl.getAttribLocation(this.renderCanvasProgram,
                                                       'a_vertex');
        this.getRenderUniformLocations(this.renderCanvasProgram);

        this.imageTex = CreateRGBATextures(this.gl,
                                           this.canvas.width, this.canvas.height, 1)[0];
        this.imgObj = undefined;
        this.mouse = [0, 0];
        this.colorOnMouse = [0, 0, 0];

        this.filterMode = -1;
        this.sepiaAmount = 0.5;
        this.hueSaturation = [0, 0];
        this.brightnessContrast = [0, 0];
        this.vibranceAmount = 0;
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_mouse'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex1'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_filterMode'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_sepiaAmount'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_hueSaturation'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_brightnessContrast'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_vibranceAmount'));
    }

    resizeCanvas() {
        if (this.imgObj != undefined) {
            const ratio = this.imgObj.imgObj.width / this.imgObj.imgObj.height;
            const parent = this.canvas.parentElement;
            const pw = parent.parentElement.clientWidth;
            const ph = parent.parentElement.clientHeight;

            const offsetRatio = 0.9;
            if (ratio > 1.0) {
                // image width > height
                if(pw > ph) {
                    this.canvas.height = (ph * offsetRatio);
                    this.canvas.style.height = (ph * offsetRatio) +'px';
                    this.canvas.width = (ph * offsetRatio) * ratio;
                    this.canvas.style.width = ((ph * offsetRatio) * ratio) +'px';
                } else {
                    this.canvas.height = (pw * offsetRatio) * ratio;
                    this.canvas.style.height = ((pw * offsetRatio) * ratio) +'px';
                    this.canvas.width = (pw * offsetRatio);
                    this.canvas.style.width = (pw * offsetRatio) +'px';
                }
            } else {
                // image width < height
                if(pw > ph) {
                    this.canvas.height = (ph * offsetRatio);
                    this.canvas.style.height = (ph * offsetRatio) +'px';
                    this.canvas.width = (ph * offsetRatio) * ratio;
                    this.canvas.style.width = ((ph * offsetRatio) * ratio) +'px';
                } else {
                    this.canvas.height = (pw * offsetRatio);
                    this.canvas.style.height = (pw * offsetRatio) +'px';
                    this.canvas.width = (pw * offsetRatio) * ratio;
                    this.canvas.style.width = ((pw * offsetRatio) * ratio) +'px';
                }
            }
        } else {
            const parent = this.canvas.parentElement;
            this.canvas.style.width = parent.clientWidth + 'px';
            this.canvas.style.height = parent.clientHeight + 'px';
            this.canvas.width = parent.clientWidth * this.pixelRatio;
            this.canvas.height = parent.clientHeight * this.pixelRatio;
            this.canvasRatio = this.canvas.width / this.canvas.height / 2;
        }
    }

    setImage(img) {
        this.imgObj = img;
        this.imageTex = CreateRGBAImageTexture2D(this.gl,
                                                 img.imgObj.width,
                                                 img.imgObj.height,
                                                 img.imgObj);
        this.resizeCanvas();
    }

    computeHistogram(imageData) {
        this.render();
        const buff = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        imageData.computeHistogram(this.gl, buff, this.canvas.width, this.canvas.height);
    }

    readPixels() {
        this.render();
        const buff = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        this.gl.readPixels(0, 0, this.canvas.width, this.canvas.height,
                           this.gl.RGBA, this.gl.UNSIGNED_BYTE, buff);
        console.log(buff);
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.mouse[0], this.canvas.height - this.mouse[1]);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTex);
        this.gl.uniform1i(this.uniLocations[i++], 0);

        this.gl.uniform1i(this.uniLocations[i++], this.filterMode);
        this.gl.uniform1f(this.uniLocations[i++], this.sepiaAmount);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.hueSaturation[0], this.hueSaturation[1]);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.brightnessContrast[0], this.brightnessContrast[1]);
        this.gl.uniform1f(this.uniLocations[i++], this.vibranceAmount);
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

    mouseMoveListener(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouse = [event.clientX - rect.left, event.clientY - rect.top];

        this.colorOnMouse = new Uint8Array(4);
        this.gl.readPixels(this.mouse[0], this.canvas.height - this.mouse[1], 1, 1,
                           this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.colorOnMouse);
        console.log(this.colorOnMouse);
    }
}
