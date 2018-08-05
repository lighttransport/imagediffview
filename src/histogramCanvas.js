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

        const strokeStyles = ["red", "green", "blue", "black"];
        for(let i = 0; i < 4; i++) {
            let x = 0;
            this.ctx.strokeStyle = strokeStyles[i];
            let sum = 0;
            console.log(this.canvas.height)
            for(const r of this.histogram[i]) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, (1. - r) * this.canvas.height );
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
                x++;
                sum += r;
            }
            console.log(sum);
        }
    }
}
