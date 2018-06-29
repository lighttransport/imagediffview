import Canvas from './canvas.js';

export default class ChartCanvas extends Canvas {
    constructor(canvasId, chart) {
        super(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = chart;
        
        this.padding = 5;
        this.patchWidth = this.canvas.width / 6;
        this.patchHeight = this.canvas.height / 4;
    }

    render() {
        this.ctx.strokeRect(0, 0,
                          this.canvas.width, this.canvas.height);

        for (let x = 0; x < 6; x++) {
            for (let y = 0; y < 4; y++) {
                this.ctx.fillStyle = `rgb(${this.chart[x + 6 * y][0]}, ${this.chart[x + 6 * y][1]}, ${this.chart[x + 6 * y][2]})`;
                this.ctx.fillRect(this.padding + x * this.patchWidth,
                                  this.padding + y * this.patchHeight,
                                  this.patchWidth - 2 * this.padding,
                                  this.patchHeight - 2 * this.padding);
            }
        }
    }
}
