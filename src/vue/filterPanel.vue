<template>
  <div class="propertyPanel">
    <select size="1" v-model="selected" @change="changed">
        <option disabled value="">Please select filter</option>
        <option v-for="option in options" v-bind:value="option.value">
          {{ option.text }}
        </option>
    </select>
    <component v-bind:is="filters[selected]" :canvasManager="canvasManager"></component>
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
        }
    }
}
</script>

<style>
.propertyPanel{
    height: 150px;

    flex-direction: column;
    border-style: ridge;
    background-color: white;
    border-top: ridge;
    border-color: gray;

    padding: 10px;
}

</style>
