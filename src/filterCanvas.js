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
        this.mouseFromOrigin = [0, 0];
        this.colorOnMouse = [0, 0, 0];

        this.filterMode = -1;
        this.sepiaAmount = 0.0;
        this.hueSaturation = [0, 0];
        this.brightnessContrast = [0, 0];
        this.vibranceAmount = 0;

        this.temperature = 1500;
        this.temperatureStrength = 1;
        
        this.imageScale = 1.0;
        this.imageTranslate = [0, 0];
        this.prevImgTranslate = [0, 0];

        // 0: none 1: first point 2: second point 3: third point 4: determined
        this.chartPickMode = FilterCanvas.CHART_POINT_NONE;
        this.chartPoints = [0, 0, 0, 0, 0, 0];
        this.chartPointsMouse = new Array(6);
        this.chartColor = new Array(24); // upper left -> lower right
        for(let i = 0; i < 24; i++) {
            this.chartColor[i] = [0, 0, 0];
        }
        this.chartReadListeners = [];
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_mouse'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_scale'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_translate'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_chartPickMode'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_chartFirstSecondPoints'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_chartThirdPoint'));
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
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_temperature'))
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

    readPixels() {
        this.render();
        const buff = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        this.gl.readPixels(0, 0, this.canvas.width, this.canvas.height,
                           this.gl.RGBA, this.gl.UNSIGNED_BYTE, buff);
//        console.log(buff);
    }

    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.mouse[0], this.mouse[1]);
        this.gl.uniform1f(this.uniLocations[i++],
                          this.imageScale);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.imageTranslate[0], this.imageTranslate[1]);
        this.gl.uniform1i(this.uniLocations[i++],
                          this.chartPickMode);
        this.gl.uniform4f(this.uniLocations[i++],
                          this.chartPoints[0], this.chartPoints[1],
                          this.chartPoints[2], this.chartPoints[3]);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.chartPoints[4], this.chartPoints[5]);

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
        this.gl.uniform2f(this.uniLocations[i++],
                          this.temperature, this.temperatureStrength);
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

    addChartReadListener(listener) {
        this.chartReadListeners.push(listener);
    }

    chartRead() {
        for(const listener of this.chartReadListeners) {
            listener();
        }
    }

    clearColorChart() {
        this.chartPickMode = FilterCanvas.CHART_POINT_NONE;
        this.chartPoints = [0, 0, 0, 0, 0, 0];
        this.chartPointsMouse = new Array(6);
        this.chartColor = new Array(24); // upper left -> lower right
        for(let i = 0; i < 24; i++) {
            this.chartColor[i] = [0, 0, 0];
        }

        this.chartRead();
    }

    mouseMoveListener(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouse = [event.clientX - rect.left, event.clientY - rect.top];
        this.mouseFromOrigin = [(this.mouse[0] - this.canvas.width * 0.5) * this.imageScale + this.canvas.width * 0.5 + this.imageTranslate[0] * this.canvas.width,
                                (this.mouse[1] - this.canvas.height * 0.5) * this.imageScale + this.canvas.height * 0.5 + this.imageTranslate[1] * this.canvas.height];
        console.log(this.mouseFromOrigin);
        this.colorOnMouse = new Uint8Array(4);
        this.gl.readPixels(this.mouse[0], this.canvas.height - this.mouse[1], 1, 1,
                           this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.colorOnMouse);

        if(this.mouseDown && this.mouseButton === Canvas.MOUSE_BUTTON_RIGHT) {
            //dragging
            this.imageTranslate[0] = this.prevImgTranslate[0] + (this.prevMouse[0] - this.mouse[0]) / (this.canvas.width / this.imageScale);
            this.imageTranslate[1] = this.prevImgTranslate[1] + (this.prevMouse[1] - this.mouse[1]) / (this.canvas.height / this.imageScale);
        }
        this.render();
    }

    mouseWheelListener(event) {
        if (event.deltaY < 0) {
            this.imageScale /= 1.1;
        } else {
            this.imageScale *= 1.1;
        }
        this.render();
    }

    readColorChart() {
        const w = this.chartPointsMouse[2] - this.chartPointsMouse[0];
        const h = this.chartPointsMouse[3] - this.chartPointsMouse[5];
         //    + this.chartPoints[0];
         // + this.chartPoints[1];
        const offsetX = Math.abs(w) / 12.0;
        const offsetY = Math.abs(h) / 8.0;
        const stepX = Math.abs(w) / 6.0;
        const stepY = Math.abs(h) / 4.0;

        for(let j = 0; j < 4; j++) {
            for(let i = 0; i < 6; i++) {
                const x = (this.chartPointsMouse[0] + offsetX + stepX * i);
                const y = (this.chartPointsMouse[1] + offsetY + stepY * j);
                console.log(`(${x}, ${y})`);
                const rect = new Uint8Array(1 * 1 * 4);
                this.gl.readPixels(x, this.canvas.height - y,
                                   1, 1,
                                   this.gl.RGBA, this.gl.UNSIGNED_BYTE, rect);
                console.log(rect);
                this.chartColor[i + 6 * j] = [rect[0], rect[1], rect[2]];
            }
        }
        this.chartRead();
    }

    makeHistogram() {
        this.redBin = new Array(256);
        this.greenBin = new Array(256);
        this.blueBin = new Array(256);
        this.luminanceBin = new Array(256);

        this.maxValue = [-1, -1, -1, -1];
        for(let i = 0; i < 256; i++) {
            this.redBin[i] = 0;
            this.greenBin[i] = 0;
            this.blueBin[i] = 0;
            this.luminanceBin[i] = 0;
        }

        const rect = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        this.gl.readPixels(0, 0,
                           this.canvas.width, this.canvas.height,
                           this.gl.RGBA, this.gl.UNSIGNED_BYTE, rect);
        console.log(rect);
        for(let i = 0; i < this.canvas.width * this.canvas.height * 4; i += 4) {
            const red = parseInt(rect[i + 0]);
            const green = parseInt(rect[i + 1]);
            const blue = parseInt(rect[i + 2]);
            const luminance =  parseInt(0.298912 * red + 0.586611 * green + 0.114478 * blue);
            this.redBin[red]++;
            this.greenBin[green]++;
            this.blueBin[blue]++;
            this.luminanceBin[luminance]++;

            this.maxValue[0] = Math.max(this.maxValue[0], this.redBin[red]);
            this.maxValue[1] = Math.max(this.maxValue[1], this.greenBin[green]);
            this.maxValue[2] = Math.max(this.maxValue[2], this.blueBin[blue]);
            this.maxValue[3] = Math.max(this.maxValue[3], this.luminanceBin[luminance]);
        }

        const m = Math.max(Math.max(Math.max(this.maxValue[0], this.maxValue[1]),
                                    this.maxValue[2]),
                           this.maxValue[3]);

        for(let i = 0; i < 256; i++) {
            this.redBin[i] = this.redBin[i] / m;
            this.greenBin[i] = this.greenBin[i] / m;
            this.blueBin[i] = this.blueBin[i] / m;
            this.luminanceBin[i] = this.luminanceBin[i] / m;
        }

        return [this.redBin, this.greenBin, this.blueBin, this.luminanceBin];
    }

    mouseDownListener(event) {
        this.mouseDown = true;
        this.mouseButton = event.button;
        const rect = this.canvas.getBoundingClientRect();
        this.prevMouse = [event.clientX - rect.left, event.clientY - rect.top];

        if(event.button === Canvas.MOUSE_BUTTON_LEFT) {
            if(this.chartPickMode == FilterCanvas.CHART_POINT_NONE) {
                this.chartPoints[0] = (((this.prevMouse[0]) / (this.canvas.width) - 0.5) * this.imageScale + 0.5 + this.imageTranslate[0]);
                this.chartPoints[1] = (((this.prevMouse[1]) / (this.canvas.height) -0.5) * this.imageScale + 0.5  + this.imageTranslate[1]);
                this.chartPointsMouse[0] = this.prevMouse[0];
                this.chartPointsMouse[1] = this.prevMouse[1];
                this.chartPickMode = FilterCanvas.CHART_POINT_FIRST;
            } else if (this.chartPickMode == FilterCanvas.CHART_POINT_FIRST) {
                this.chartPoints[2] = (((this.prevMouse[0]) / (this.canvas.width) - 0.5) * this.imageScale + 0.5 + this.imageTranslate[0]);
                this.chartPoints[3] = (((this.prevMouse[1]) / (this.canvas.height) -0.5) * this.imageScale + 0.5  + this.imageTranslate[1]);
                this.chartPointsMouse[2] = this.prevMouse[0];
                this.chartPointsMouse[3] = this.prevMouse[1];
                this.chartPickMode = FilterCanvas.CHART_POINT_SECOND;
            } else if (this.chartPickMode == FilterCanvas.CHART_POINT_SECOND) {
                this.chartPoints[4] = (((this.prevMouse[0]) / (this.canvas.width) - 0.5) * this.imageScale + 0.5 + this.imageTranslate[0]);
                this.chartPoints[5] = (((this.prevMouse[1]) / (this.canvas.height) -0.5) * this.imageScale + 0.5  + this.imageTranslate[1]);
                this.chartPointsMouse[4] = this.prevMouse[0];
                this.chartPointsMouse[5] = this.prevMouse[1];
                this.chartPickMode = FilterCanvas.CHART_POINT_THIRD;
                this.readColorChart();
            }
        }
        console.log(this.chartPoints);
    }

    mouseUpListener(event) {
        this.mouseDown = false;
        const rect = this.canvas.getBoundingClientRect();
        this.prevMouse = [event.clientX - rect.left, event.clientY - rect.top];
        this.prevImgTranslate[0] = this.imageTranslate[0];
        this.prevImgTranslate[1] = this.imageTranslate[1];
    }

    static get CHART_POINT_NONE() {
        return 0;
    }

    static get CHART_POINT_FIRST() {
        return 1;
    }

    static get CHART_POINT_SECOND() {
        return 2;
    }

    static get CHART_POINT_THIRD() {
        return 3;
    }
}
