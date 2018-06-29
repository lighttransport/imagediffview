import Vue from 'vue';
import Root from './vue/root.vue';
import ImageCanvas from './imageCanvas.js';
import { CreateRGBAImageTexture2D } from './glUtils.js';
import CanvasManager from './canvasManager.js';
import Buefy from 'buefy';
import 'buefy/lib/buefy.css';

window.addEventListener('load', () => {
    window.Vue = Vue;
    Vue.use(Buefy);

    const canvasManager = new CanvasManager('canvas', "chartCanvas");

    const d = { 'canvasManager': canvasManager  };

    /* eslint-disable no-unused-vars */
    const app = new Vue({
        el: '#vue-ui',
        data: d,
        render: (h) => {
            return h('root', { 'props': d });
        },
        components: { 'root': Root }
    });

    canvasManager.init();

    let resizeTimer = setTimeout(canvasManager.resizeCallback, 500);
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(canvasManager.resizeCallback, 500);
    });

    function renderLoop() {
        canvasManager.renderLoop();
        requestAnimationFrame(renderLoop);
    }
    renderLoop();
});
