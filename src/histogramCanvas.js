import Canvas from './canvas.js';

export default class HistogramCanvas extends Canvas {
    constructor(canvasId, histogram) {
        super(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.histogram = histogram;
    }

    render() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0,
                          this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(0, 0,
                            this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle="red";
        let x = 0;
        for(const r of this.histogram[0]) {
            console.log(r);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height);
            this.ctx.lineTo(x, (1. - r) * this.canvas.height );
            this.ctx.stroke();
            x++;
        }
    }
}
