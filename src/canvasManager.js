import FilterCanvas from './filterCanvas.js';
import ChartCanvas from './chartCanvas.js';
import HistogramCanvas from './histogramCanvas.js';

export default class CanvasManager {
    constructor(canvasId, chartCanvasId, histoCanvasId) {
        this.canvasId = canvasId;
        this.chartCanvasId = chartCanvasId;
        this.histoCanvasId = histoCanvasId;

        this.resizeCallback = this.resize.bind(this);
        this.filterCanvas = null;
    }

    init() {
        this.filterCanvas = new FilterCanvas(this.canvasId);
        this.filterCanvas.render();
        const histo = this.filterCanvas.makeHistogram();

        this.chartCanvas = new ChartCanvas(this.chartCanvasId,
                                           this.filterCanvas.chartColor);
        this.chartCanvas.render();
        this.filterCanvas.addChartReadListener(() => {
            this.chartCanvas.render();
        });

        this.histoCanvas = new HistogramCanvas(this.histoCanvasId,
                                               histo);
        this.histoCanvas.render();
    }

    initChart() {
        this.chartCanvas = new ChartCanvas(this.chartCanvasId,
                                           this.filterCanvas.chartColor);
        this.chartCanvas.render();
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
