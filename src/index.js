import Vue from 'vue';
import Root from './vue/root.vue';
import ImageCanvas from './imageCanvas.js';
import { CreateRGBAImageTexture2D } from './glUtils.js';

window.addEventListener('load', () => {
    window.Vue = Vue;
    const canvas = new ImageCanvas('canvas', 'overlay');

    const d = { 'canvas':  canvas };

    /* eslint-disable no-unused-vars */
    const app = new Vue({
        el: '#vue-ui',
        data: d,
        render: (h) => {
            return h('root', { 'props': d });
        },
        components: { 'root': Root }
    });

    canvas.init();
    canvas.render();

    function renderLoop() {
        if (canvas.isRendering) {
            canvas.render();
            canvas.isRendering = false;
        }
        requestAnimationFrame(renderLoop);
    }
    renderLoop();
});
