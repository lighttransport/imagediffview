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

        this.image = CreateRGBATextures(this.gl,
                                        this.canvas.width, this.canvas.height, 1)[0];

        this.mouse = [0, 0];
    }

    getRenderUniformLocations(program) {
        this.uniLocations = [];
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_resolution'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_mouse'));
        this.uniLocations.push(this.gl.getUniformLocation(program,
                                                          'u_tex1'));
    }

    setImage(img) {
        this.image = CreateRGBAImageTexture2D(this.gl,
                                              img.imgObj.width,
                                              img.imgObj.height,
                                              img.imgObj);
        const ratio = img.imgObj.width / img.imgObj.height;
        const parent = this.canvas.parentElement
        const pw = parent.parentElement.clientWidth;
        const ph = parent.parentElement.clientHeight;
        console.log(parent.parentElement);
        if (ratio > 1.0) {
            console.log(ratio);
            console.log(pw);
            console.log(ph);
            // width > height
            this.canvas.style.height = (ph * 0.8) +'px';
            this.canvas.height = (ph * 0.8);
            this.canvas.width = (ph * 0.8) * ratio;
            this.canvas.style.width = ((ph * 0.8) * ratio) +'px';
        } else {
            this.canvas.style.height = (pw * 0.8) +'px';
            this.canvas.height = (pw * 0.8);
            this.canvas.width = (pw * 0.8) * ratio;
            this.canvas.style.width = ((pw * 0.8) * ratio) +'px';
        }
        console.log(parent);
        console.log();
        this.render();
    }
    
    setRenderUniformValues(width, height) {
        let i = 0;
        this.gl.uniform2f(this.uniLocations[i++], width, height);
        this.gl.uniform2f(this.uniLocations[i++],
                          this.mouse[0], this.canvas.height - this.mouse[1]);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.image);
        this.gl.uniform1i(this.uniLocations[i++], 0);
    }

    render() {
        this.gl.clearColor(1, 1, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

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
    }
}
