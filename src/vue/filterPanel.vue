<template>
  <div class="propertyPanel">
    <div class="histoCanvasParent">
      <canvas id="histoCanvas"></canvas>
    </div>
    <div class="chartCanvasParent">
      <canvas id="chartCanvas"></canvas>
    </div>
    <button @click="clearColorChart">Clear</button>
  </div>
</template>

<script>
import Sepia from './sepia.vue';
import HueSaturation from './hueSaturation.vue';
import BrightnessContrast from './brightnessContrast.vue';
import Vibrance from './vibrance.vue';

export default {
    props: ['canvasManager'],
    data: function() {
        return {
        };
    },
    methods: {
        readPixels: function() {
            this.canvasManager.filterCanvas.readPixels();
        },
        clearColorChart: function() {
            this.canvasManager.filterCanvas.clearColorChart();
            this.canvasManager.filterCanvas.render();
            this.canvasManager.initChart();
        }
    }
}
</script>

<style>
.propertyPanel{
    height: 150px;

    border-style: ridge;
    background-color: white;
    border-top: ridge;
    border-color: gray;

    padding: 10px;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.chartCanvasParent {
    flex-basis: 300px;
}

.histoCanvasParent {
    flex-basis: 256px;
    width: 256px;
}

#histoCanvas {
    width: 256px;
}

</style>
