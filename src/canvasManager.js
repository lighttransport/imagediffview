import FilterCanvas from './filterCanvas.js';
import ChartCanvas from './chartCanvas.js';

export default class CanvasManager {
    constructor(canvasId, chartCanvasId) {
        this.canvasId = canvasId;
        this.chartCanvasId = chartCanvasId;

        this.resizeCallback = this.resize.bind(this);
        this.filterCanvas = null;
    }

    init() {
        this.filterCanvas = new FilterCanvas(this.canvasId);
        this.filterCanvas.render();

        this.chartCanvas = new ChartCanvas(this.chartCanvasId,
                                           this.filterCanvas.chartColor);
        this.chartCanvas.render();
        this.filterCanvas.addChartReadedListener(() => {
            this.chartCanvas.render();
        });
    }

    renderLoop() {
        if(this.filterCanvas.isRendering) {
            this.filterCanvas.render();
        }
    }

    resize() {
        this.filterCanvas.resizeCanvas();
        this.filterCanvas.render();
    }

    setImageData(imageData) {
        this.filterCanvas.setImageData();
        this.filterCanvas.render();
    }
}
