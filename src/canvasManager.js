import FilterCanvas from './filterCanvas.js';

export default class CanvasManager {
    constructor(canvasId) {
        this.canvasId = canvasId;

        this.resizeCallback = this.resize.bind(this);
    }

    init() {
        this.filterCanvas = new FilterCanvas(this.canvasId);
        this.filterCanvas.render();
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
