import Vue from 'vue';
import Root from './vue/root.vue';
import Canvas from './canvas.js';
import { CreateRGBAImageTexture2D } from './glUtils.js';

window.addEventListener('load', () => {
    window.Vue = Vue;
    const canvas = new Canvas('canvas');

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
        canvas.render();
        requestAnimationFrame(renderLoop);
    }
    renderLoop();
});
