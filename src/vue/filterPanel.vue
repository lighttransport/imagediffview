<template>
  <div class="propertyPanel">
    <div>
      <select size="1" v-model="selected" @change="changed">
        <option disabled value="">Please select filter</option>
        <option v-for="option in options" v-bind:value="option.value">
          {{ option.text }}
        </option>
      </select>
      <component v-bind:is="filters[selected]" :canvasManager="canvasManager"></component>
    </div>
    <div class="histoCanvasParent">
      <canvas id="histoCanvas"></canvas>
    </div>
    <div class="chartCanvasParent">
      <canvas id="chartCanvas"></canvas>
    </div>
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
            selected: "",
            filters: ["", Sepia, HueSaturation, BrightnessContrast, Vibrance],
            options: [
                { text: 'None', value: 0 },
                { text: 'Sepia', value: 1 },
                { text: 'HueSaturation', value: 2 },
                { text: 'BrightnessContrast', value: 3 },
                { text: 'vibrance', value: 4 },
            ]
        };
    },
    methods: {
        changed: function() {
            this.canvasManager.filterCanvas.filterMode = this.selected;
            this.canvasManager.filterCanvas.render();
        },
        readPixels: function() {
            this.canvasManager.filterCanvas.readPixels();
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
